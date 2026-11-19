import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT } from "jose";
import { cache } from "react";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/admin";
import { hasPermission, type Permission, type Role } from "@/lib/roles";
import { SESSION_COOKIE, sessionSecret, verifySessionToken } from "@/lib/auth/token";

export { SESSION_COOKIE, verifySessionToken };
const SESSION_HOURS = 8;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
};

function secretKey(): Uint8Array {
  return sessionSecret();
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .setIssuer("manuella-sole")
    .sign(secretKey());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Verifies the cookie signature only (no database access). */

/**
 * Loads the signed-in administrator, re-checking the database on every request so
 * deactivated accounts lose access immediately. Memoised per request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifySessionToken(token);
  if (!userId) return null;

  try {
    await connectDB();
    const admin = await Admin.findOne({
      _id: userId,
      isActive: true,
      invitationStatus: "active",
    })
      .select("name email role permissions")
      .lean();

    if (!admin) return null;

    return {
      id: String(admin._id),
      name: admin.name,
      email: admin.email,
      role: admin.role as Role,
      permissions: (admin.permissions as string[]) ?? [],
    };
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasPermission(user.role, user.permissions, permission)) {
    redirect("/admin/dashboard?denied=" + encodeURIComponent(permission));
  }
  return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "superadmin") {
    redirect("/admin/dashboard?denied=" + encodeURIComponent("platform.manage"));
  }
  return user;
}

export function userCan(user: SessionUser, permission: Permission) {
  return hasPermission(user.role, user.permissions, permission);
}

export function userIsSuperAdmin(user: SessionUser) {
  return user.role === "superadmin";
}
