"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, MailPlus, ShieldCheck, UserCheck, UserX } from "lucide-react";
import {
  inviteMemberAction,
  resendInviteAction,
  revokeInvitationAction,
  setMemberActiveAction,
  setMemberRoleAction,
} from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Pill } from "@/components/admin/primitives";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { TeamMember } from "@/lib/services/team";

export function TeamManager({ members }: { members: TeamMember[] }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function invite() {
    startTransition(async () => {
      const result = await inviteMemberAction({ name, email, role });
      if (result.ok && result.data) {
        toast.success(result.message ?? "Invitation created.");
        setInviteLink(result.data.inviteLink);
        setInviteOpen(false);
        setName("");
        setEmail("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not create the invitation.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-ash-light">Total</p>
            <p className="font-display text-[24px] leading-none text-ink tabular-nums">
              {formatNumber(members.length)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-ash-light">Active</p>
            <p className="font-display text-[24px] leading-none text-success tabular-nums">
              {formatNumber(members.filter((m) => m.isActive && m.invitationStatus === "active").length)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-ash-light">Pending</p>
            <p className="font-display text-[24px] leading-none text-warning tabular-nums">
              {formatNumber(members.filter((m) => m.invitationStatus === "pending").length)}
            </p>
          </div>
        </div>

        <Button onClick={() => { setInviteOpen(true); setInviteLink(null); }}>
          <MailPlus className="h-4 w-4" aria-hidden="true" />
          Invite member
        </Button>
      </div>

      {inviteLink ? (
        <div className="border border-success/25 bg-success/5 p-4">
          <p className="text-[12.5px] font-medium text-success">Invitation created.</p>
          <p className="mt-1 text-[12px] text-ash">
            Share this link with the new team member (valid for 48 hours):
          </p>
          <div className="mt-2.5 flex gap-2">
            <input readOnly value={inviteLink} className="admin-input h-9 text-[12px]" />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(inviteLink);
                toast.success("Copied to clipboard.");
              }}
              className="grid h-9 w-9 shrink-0 place-items-center border border-line bg-white text-ash transition-colors hover:border-ink hover:text-ink"
              aria-label="Copy invite link"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="admin-card overflow-hidden">
        {members.length ? (
          <div className="-mx-0 overflow-x-auto">
            <table className="admin-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <p className="text-[13px] font-medium text-ink">{member.name}</p>
                      <p className="text-[11px] text-ash-light">{member.email}</p>
                    </td>
                    <td>
                      <RoleSelect member={member} />
                    </td>
                    <td>
                      <MemberStatus member={member} />
                    </td>
                    <td className="text-ash">
                      {member.lastLoginAt ? formatDateTime(member.lastLoginAt) : "—"}
                    </td>
                    <td className="text-right">
                      <MemberActions member={member} onResend={router.refresh} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-[22px] text-ink">No team members yet</p>
            <p className="mt-1.5 text-[12.5px] text-ash">Invite your first team member to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent title="Invite a team member" description="They will receive an invitation link by email.">
          <div className="space-y-4">
            <Field label="Name" htmlFor="inv-name">
              <input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} className="admin-input" placeholder="Jane Doe" />
            </Field>
            <Field label="Email" htmlFor="inv-email">
              <input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" placeholder="jane@manuellasole.com" />
            </Field>
            <Field label="Role" htmlFor="inv-role">
              <select id="inv-role" value={role} onChange={(e) => setRole(e.target.value as "admin" | "staff")} className="admin-input">
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="primary" loading={pending} onClick={invite}>
              Send invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberStatus({ member }: { member: TeamMember }) {
  if (member.role === "owner") return <Pill tone="gold">Owner</Pill>;
  if (member.role === "superadmin") return <Pill tone="ink">Super admin</Pill>;
  if (member.invitationStatus === "pending") return <Pill tone="warning">Invited</Pill>;
  if (member.invitationStatus === "revoked" || !member.isActive) return <Pill tone="danger">Inactive</Pill>;
  return <Pill tone="success">Active</Pill>;
}

function RoleSelect({ member }: { member: TeamMember }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Owner and super admin roles are fixed and cannot be changed here.
  if (member.role === "owner" || member.role === "superadmin") {
    return <span className="text-[12.5px] text-ash">{member.roleLabel}</span>;
  }
  return (
    <select
      value={member.role}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as "admin" | "staff";
        startTransition(async () => {
          const result = await setMemberRoleAction(member.id, next);
          if (result.ok) {
            toast.success(result.message ?? "Role updated.");
            router.refresh();
          } else {
            toast.error(result.error ?? "Could not update the role.");
          }
        });
      }}
      className="admin-input h-8 w-32 text-[12px]"
    >
      <option value="staff">Staff</option>
      <option value="admin">Administrator</option>
    </select>
  );
}

function MemberActions({ member, onResend }: { member: TeamMember; onResend: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fixed = member.role === "owner" || member.role === "superadmin";

  function toggle() {
    startTransition(async () => {
      const result = await setMemberActiveAction(member.id, !member.isActive);
      if (result.ok) {
        toast.success(result.message ?? "Updated.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not update the account.");
      }
    });
  }

  function resend() {
    startTransition(async () => {
      const result = await resendInviteAction(member.id);
      if (result.ok && result.data) {
        navigator.clipboard?.writeText(result.data.inviteLink);
        toast.success("A fresh invite link was copied to your clipboard.");
        onResend();
      } else {
        toast.error(result.error ?? "Could not resend the invitation.");
      }
    });
  }

  function revoke() {
    startTransition(async () => {
      const result = await revokeInvitationAction(member.id);
      if (result.ok) {
        toast.success(result.message ?? "Invitation revoked.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not revoke the invitation.");
      }
    });
  }

  if (fixed) return <span className="text-[11.5px] text-ash-light">—</span>;

  const btn =
    "inline-flex h-8 items-center gap-1.5 border border-line bg-white px-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ash transition-colors hover:border-ink hover:text-ink disabled:opacity-40";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {member.invitationStatus === "pending" ? (
        <>
          <button type="button" onClick={resend} disabled={pending} className={btn}>
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Resend
          </button>
          <button type="button" onClick={revoke} disabled={pending} className={btn}>
            <UserX className="h-3.5 w-3.5" aria-hidden="true" />
            Revoke
          </button>
        </>
      ) : (
        <button type="button" onClick={toggle} disabled={pending} className={btn}>
          {member.isActive ? (
            <>
              <UserX className="h-3.5 w-3.5" aria-hidden="true" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Activate
            </>
          )}
        </button>
      )}
    </div>
  );
}