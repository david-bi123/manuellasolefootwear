import { randomBytes } from "crypto";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/admin";
import { Sale } from "@/lib/models/sale";
import { hashPassword, passwordProblems } from "@/lib/auth/password";
import { createInvitationToken, hashToken, normaliseEmail } from "@/lib/auth/invitations";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { sendInvitationEmail } from "@/lib/mailer";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  isActive: boolean;
  invitationStatus: string;
  invitationExpiresAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  createdByName: string;
};

export async function listTeam(): Promise<TeamMember[]> {
  await connectDB();
  const docs = await Admin.find()
    .select("name email role isActive invitationStatus invitationExpiresAt lastLoginAt createdAt createdBy")
    .populate("createdBy", "name")
    .sort({ createdAt: 1 })
    .lean();

  return (docs as any[])
    // Super admin accounts (Samtech Labs platform operators) are hidden from the
    // client-facing team list so the site owner never sees them.
    .filter((doc) => doc.role !== "superadmin")
    .map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      role: doc.role as Role,
      roleLabel: ROLE_LABELS[doc.role as Role] ?? doc.role,
      isActive: doc.isActive,
      invitationStatus: doc.invitationStatus,
      invitationExpiresAt: doc.invitationExpiresAt
        ? new Date(doc.invitationExpiresAt).toISOString()
        : null,
      lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt).toISOString() : null,
      createdAt: new Date(doc.createdAt).toISOString(),
      createdByName: doc.createdBy?.name ?? "Bootstrap",
    }));
}

export async function inviteMember(
  actorId: string,
  input: { name: string; email: string; role: "admin" | "staff" },
  siteUrl: string,
) {
  await connectDB();
  const email = normaliseEmail(input.email);
  const existing = await Admin.findOne({ email });

  if (existing && existing.invitationStatus === "active") {
    throw new Error("An active account already exists for this email address.");
  }

  const { token, tokenHash } = createInvitationToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

  if (existing) {
    existing.name = input.name;
    existing.role = input.role;
    existing.invitationStatus = "pending";
    existing.isActive = true;
    existing.invitationTokenHash = tokenHash;
    existing.invitationExpiresAt = expiresAt;
    existing.passwordHash = await hashPassword(randomBytes(24).toString("hex"));
    existing.createdBy = actorId as any;
    await existing.save();
  } else {
    await Admin.create({
      name: input.name,
      email,
      role: input.role,
      passwordHash: await hashPassword(randomBytes(24).toString("hex")),
      isActive: true,
      invitationStatus: "pending",
      invitationTokenHash: tokenHash,
      invitationExpiresAt: expiresAt,
      createdBy: actorId,
    });
  }

  const inviteLink = `${siteUrl.replace(/\/$/, "")}/admin/accept-invite?token=${token}`;
  const emailResult = await sendInvitationEmail({
    to: email,
    name: input.name,
    roleLabel: ROLE_LABELS[input.role],
    inviteLink,
    expiresInHours: 48,
  });

  return { inviteLink, emailSent: emailResult.sent, emailReason: emailResult.reason };
}

export async function getInvitationByToken(token: string) {
  await connectDB();
  if (!token) return null;
  const admin = await Admin.findOne({
    invitationTokenHash: hashToken(token),
    invitationStatus: "pending",
    invitationExpiresAt: { $gt: new Date() },
  })
    .select("name email role invitationExpiresAt")
    .lean();
  if (!admin) return null;
  return {
    name: admin.name,
    email: admin.email,
    role: admin.role as Role,
    expiresAt: new Date(admin.invitationExpiresAt as Date).toISOString(),
  };
}

export async function acceptInvitation(token: string, name: string, password: string) {
  await connectDB();
  const problem = passwordProblems(password);
  if (problem) throw new Error(problem);

  const admin = await Admin.findOne({
    invitationTokenHash: hashToken(token),
    invitationStatus: "pending",
    invitationExpiresAt: { $gt: new Date() },
  }).select("+passwordHash");

  if (!admin) {
    throw new Error("This invitation link is invalid or has expired. Ask the owner for a new invitation.");
  }

  admin.name = name;
  admin.passwordHash = await hashPassword(password);
  admin.invitationStatus = "active";
  admin.invitationTokenHash = undefined;
  admin.invitationExpiresAt = undefined;
  admin.isActive = true;
  await admin.save();

  return { email: admin.email, role: admin.role as Role };
}

export async function revokeInvitation(actorId: string, id: string) {
  await connectDB();
  const admin = await Admin.findById(id);
  if (!admin) throw new Error("Team member not found.");
  if (admin.role === "owner") throw new Error("The owner account cannot be revoked.");
  if (admin.role === "superadmin") throw new Error("This account cannot be managed here.");
  admin.invitationStatus = "revoked";
  admin.isActive = false;
  admin.invitationTokenHash = undefined;
  admin.invitationExpiresAt = undefined;
  await admin.save();
  return { revoked: true };
}

export async function setMemberActive(actorId: string, id: string, isActive: boolean) {
  await connectDB();
  if (String(actorId) === String(id)) {
    throw new Error("You cannot deactivate your own account.");
  }
  const admin = await Admin.findById(id);
  if (!admin) throw new Error("Team member not found.");
  if (admin.role === "owner") {
    throw new Error("The owner account cannot be deactivated.");
  }
  if (admin.role === "superadmin") {
    throw new Error("This account cannot be managed here.");
  }
  admin.isActive = isActive;
  if (!isActive && admin.invitationStatus === "pending") admin.invitationStatus = "revoked";
  await admin.save();
  return { isActive: admin.isActive };
}

export async function setMemberRole(actorId: string, id: string, role: Role) {
  await connectDB();
  if (String(actorId) === String(id)) throw new Error("You cannot change your own role.");
  if (!["admin", "staff"].includes(role)) {
    throw new Error("Only Administrator and Staff roles can be assigned.");
  }
  const admin = await Admin.findById(id);
  if (!admin) throw new Error("Team member not found.");
  if (admin.role === "owner") throw new Error("The owner role cannot be changed.");
  if (admin.role === "superadmin") {
    throw new Error("This account cannot be managed here.");
  }
  admin.role = role;
  await admin.save();
  return { role: admin.role };
}

export async function getTeamStats() {
  await connectDB();
  const [total, active, pending] = await Promise.all([
    Admin.countDocuments({}),
    Admin.countDocuments({ isActive: true, invitationStatus: "active" }),
    Admin.countDocuments({ invitationStatus: "pending" }),
  ]);
  return { total, active, pending };
}

export async function getAuditTrail(limit = 6) {
  await connectDB();
  const docs = await Sale.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("createdBy", "name")
    .populate("lastModifiedBy", "name")
    .select("saleReference paymentStatus saleStatus updatedAt createdBy lastModifiedBy")
    .lean();
  return (docs as any[]).map((doc) => ({
    id: String(doc._id),
    reference: doc.saleReference,
    status: doc.saleStatus,
    paymentStatus: doc.paymentStatus,
    updatedAt: new Date(doc.updatedAt).toISOString(),
    actor: doc.lastModifiedBy?.name ?? doc.createdBy?.name ?? "—",
  }));
}
