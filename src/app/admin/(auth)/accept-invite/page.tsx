import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getInvitationByToken } from "@/lib/services/team";
import { AcceptInviteForm } from "@/components/admin/accept-invite-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  if (!token) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center border border-line bg-cream text-gold-deep">
          <ShieldAlert className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-[30px] text-ink">Invitation link incomplete</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ash">
          This invitation link is missing its token. Ask the owner to send you a fresh link.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-flex h-11 items-center gap-2 border border-line bg-white px-6 text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    );
  }

  const invitation = await getInvitationByToken(token).catch(() => null);

  if (!invitation) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center border border-line bg-cream text-danger">
          <ShieldAlert className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-[30px] text-ink">Invitation expired</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ash">
          This invitation is invalid or has expired. Invitations last 48 hours — ask the owner for a
          new one.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-flex h-11 items-center gap-2 border border-line bg-white px-6 text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <AcceptInviteForm
      token={token}
      name={invitation.name}
      email={invitation.email}
      role={invitation.role === "admin" || invitation.role === "staff" ? invitation.role : "staff"}
      expiresAt={invitation.expiresAt}
    />
  );
}
