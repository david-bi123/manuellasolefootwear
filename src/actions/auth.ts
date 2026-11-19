"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/admin";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { clearRateLimit, rateLimit } from "@/lib/auth/rate-limit";
import { getSiteStatus } from "@/lib/services/site";
import { fieldErrorsFrom, loginSchema } from "@/lib/validators";

export async function loginAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return actionError("Enter your email and password to continue.", fieldErrorsFrom(parsed.error));
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "local";
  const key = `login:${parsed.data.email}:${ip}`;
  const limit = rateLimit(key, 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return actionError(
      `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
    );
  }

  try {
    await connectDB();

    // While the site is paused, only super admins (Samtech Labs) may sign in.
    const site = await getSiteStatus();
    const superAdminOnly = site.status === "paused";

    const admin = await Admin.findOne({ email: parsed.data.email }).select("+passwordHash");
    if (!admin) return actionError("Invalid email or password.");
    if (!admin.isActive) return actionError("This account has been deactivated. Contact the owner.");
    if (admin.invitationStatus === "pending") {
      return actionError("This invitation has not been accepted yet. Use your invitation link.");
    }
    if (admin.invitationStatus === "revoked") {
      return actionError("This account is no longer active. Contact the owner.");
    }
    if (superAdminOnly && admin.role !== "superadmin") {
      return actionError(
        "The site is paused. Only a super admin can sign in until hosting is renewed.",
      );
    }

    const valid = await verifyPassword(parsed.data.password, admin.passwordHash as string);
    if (!valid) return actionError("Invalid email or password.");

    admin.lastLoginAt = new Date();
    await admin.save();
    await createSession(String(admin._id));
    clearRateLimit(key);
    return actionOk("Signed in.");
  } catch (error) {
    console.error("[login] failed:", error);
    if (error instanceof z.ZodError) return actionError("Check the details you entered.");
    return actionError(
      "We could not sign you in right now. Check the database connection and try again.",
    );
  }
}

export async function logoutAction() {
  await destroySession();
  revalidatePath("/admin", "layout");
}
