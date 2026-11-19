"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import {
  acceptInvitation,
  inviteMember,
  revokeInvitation,
  setMemberActive,
  setMemberRole,
} from "@/lib/services/team";
import { acceptInviteSchema, fieldErrorsFrom, inviteSchema } from "@/lib/validators";
import { normaliseEmail } from "@/lib/auth/invitations";
import type { Role } from "@/lib/roles";

export async function inviteMemberAction(
  payload: { name: string; email: string; role: "admin" | "staff" },
): Promise<ActionResult<{ inviteLink: string; emailSent: boolean; emailReason?: string }>> {
  const user = await requirePermission("team.manage");
  const parsed = inviteSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError("Check the invitation details.", fieldErrorsFrom(parsed.error));
  }
  try {
    await connectDB();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const result = await inviteMember(user.id, parsed.data, siteUrl);
    revalidatePath("/admin/team");
    return actionOk(
      result.emailSent
        ? "Invitation emailed. You can also copy the link below."
        : "Invitation created. Email delivery is not configured, so share the link below.",
      result,
    );
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "The invitation could not be created.");
  }
}

export async function acceptInviteAction(
  payload: { token: string; name: string; password: string; confirmPassword: string },
): Promise<ActionResult<{ email: string; role: Role }>> {
  const parsed = acceptInviteSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError("Check the details you entered.", fieldErrorsFrom(parsed.error));
  }
  try {
    await connectDB();
    const result = await acceptInvitation(parsed.data.token, parsed.data.name, parsed.data.password);
    revalidatePath("/admin/team");
    return actionOk("Your account is ready. You can sign in now.", result);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "The invitation could not be accepted.");
  }
}

export async function setMemberActiveAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const user = await requirePermission("team.manage");
  try {
    await connectDB();
    await setMemberActive(user.id, id, isActive);
    revalidatePath("/admin/team");
    return actionOk(isActive ? "Team member reactivated." : "Team member deactivated.");
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Could not update the account.");
  }
}

export async function setMemberRoleAction(
  id: string,
  role: "admin" | "staff",
): Promise<ActionResult> {
  const user = await requirePermission("team.manage");
  try {
    await connectDB();
    await setMemberRole(user.id, id, role);
    revalidatePath("/admin/team");
    return actionOk("Role updated.");
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Could not update the role.");
  }
}

export async function revokeInvitationAction(id: string): Promise<ActionResult> {
  const user = await requirePermission("team.manage");
  try {
    await connectDB();
    await revokeInvitation(user.id, id);
    revalidatePath("/admin/team");
    return actionOk("Invitation revoked.");
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Could not revoke the invitation.");
  }
}

export async function resendInviteAction(id: string): Promise<ActionResult<{ inviteLink: string }>> {
  await requirePermission("team.manage");
  try {
    await connectDB();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { Admin } = await import("@/lib/models/admin");
    const { createInvitationToken } = await import("@/lib/auth/invitations");
    const admin = await Admin.findById(id);
    if (!admin) return actionError("Team member not found.");
    if (admin.invitationStatus !== "pending") return actionError("This account is already active.");
    const { token, tokenHash } = createInvitationToken();
    admin.invitationTokenHash = tokenHash;
    admin.invitationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await admin.save();
    revalidatePath("/admin/team");
    return actionOk("A fresh invitation link has been created.", {
      inviteLink: `${siteUrl.replace(/\/$/, "")}/admin/accept-invite?token=${token}`,
    });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Could not resend the invitation.");
  }
}

export type NormalisedInviteEmail = ReturnType<typeof normaliseEmail>;
