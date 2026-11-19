import { requirePermission } from "@/lib/auth/session";
import { listTeam } from "@/lib/services/team";
import { TeamManager } from "@/components/admin/team-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Team",
  robots: { index: false, follow: false },
};

export default async function TeamPage() {
  await requirePermission("team.manage");
  const members = await listTeam();

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow text-gold-deep">Administration</p>
        <h2 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[32px]">
          Team
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ash">
          Invite administrators and staff, manage their access and roles. Invitations are valid for
          48 hours.
        </p>
      </div>

      <TeamManager members={members} />
    </div>
  );
}