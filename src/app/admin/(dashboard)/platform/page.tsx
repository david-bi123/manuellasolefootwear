import {
  Activity,
  AlertTriangle,
  Boxes,
  CircleCheck,
  Database,
  Globe,
  PauseCircle,
  PlayCircle,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth/session";
import { getSiteStatus } from "@/lib/services/site";
import { getSiteUrl, isSiteUrlConfigured } from "@/lib/site-url";
import { getDashboardData, resolveRange } from "@/lib/services/analytics";
import { getTeamStats } from "@/lib/services/team";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { Card, CardHead, Pill, StatCard } from "@/components/admin/primitives";
import { PlatformControls } from "@/components/admin/platform-controls";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Platform · Samtech Labs",
  robots: { index: false, follow: false },
};

export default async function PlatformPage() {
  await requireSuperAdmin();

  const site = await getSiteStatus();
  const range = resolveRange("30d");
  const [data, team] = await Promise.all([
    getDashboardData(range).catch(() => null),
    getTeamStats().catch(() => ({ total: 0, active: 0, pending: 0 })),
  ]);

  const paused = site.status === "paused";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold-deep">Samtech Labs · Platform</p>
          <h2 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[32px]">
            Site wellbeing
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ash">
            Monitor the health of this hosted site and control whether it is live or paused for
            non-payment.
          </p>
        </div>
        <Pill tone={paused ? "danger" : "success"} dot>
          {paused ? "Site paused" : "Site live"}
        </Pill>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Site status"
          value={paused ? "Paused" : "Live"}
          hint={
            paused && site.pausedAt ? `Paused ${formatDateTime(site.pausedAt)}` : "Serving customers"
          }
          icon={paused ? PauseCircle : Globe}
          tone={paused ? "danger" : "success"}
        />
        <StatCard
          label="Database"
          value={site.databaseConnected ? "Connected" : "Offline"}
          hint={site.databaseConnected ? "MongoDB reachable" : "Check the connection string"}
          icon={Database}
          tone={site.databaseConnected ? "success" : "danger"}
        />
        <StatCard
          label="Team accounts"
          value={formatNumber(team.active)}
          hint={`${formatNumber(team.total)} total · ${formatNumber(team.pending)} pending`}
          icon={Users}
          tone="neutral"
        />
        <StatCard
          label="Net revenue (30d)"
          value={data ? formatMoney(data.summary.revenue) : "—"}
          hint={data ? `${formatNumber(data.summary.salesCount)} orders` : "No data"}
          icon={ReceiptText}
          tone="gold"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Subscription control */}
        <Card>
          <CardHead
            title="Subscription control"
            description="Pause the site if the monthly hosting subscription is unpaid."
            action={
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-ash">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Super admin only
              </span>
            }
          />
          <PlatformControls paused={paused} pausedAt={site.pausedAt} pausedReason={site.pausedReason} />
        </Card>

        {/* Health checks */}
        <Card>
          <CardHead title="Health checks" description="Live status of the platform." />
          <ul className="space-y-3">
            <HealthRow
              ok={site.databaseConnected}
              label="Database connection"
              detail={site.databaseConnected ? "Connected" : "Not reachable"}
            />
            <HealthRow
              ok={!paused}
              label="Storefront availability"
              detail={paused ? "Paused for the public" : "Live"}
            />
            <HealthRow
              ok={Boolean(process.env.SESSION_SECRET)}
              label="Session secret"
              detail={process.env.SESSION_SECRET ? "Configured" : "Missing — sign-in will fail"}
            />
            <HealthRow
              ok={isSiteUrlConfigured()}
              label="Site URL"
              detail={getSiteUrl()}
            />
          </ul>
        </Card>
      </div>

      {/* Catalogue + inventory snapshot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-gold-pale text-gold-deep">
              <Boxes className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-ash-light">Units on hand</p>
              <p className="font-display text-[24px] leading-none text-ink tabular-nums">
                {data ? formatNumber(data.inventory.totalUnits) : "—"}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-cream text-ash">
              <Activity className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-ash-light">Low / out of stock</p>
              <p className="font-display text-[24px] leading-none text-ink tabular-nums">
                {data
                  ? `${formatNumber(data.inventory.lowStock)} / ${formatNumber(data.inventory.outOfStock)}`
                  : "—"}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-cream text-ash">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-ash-light">Developer contact</p>
              <p className="truncate text-[13px] font-medium text-ink">
                {site.developerEmail || site.developerPhone || site.developerName}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HealthRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-line/60 pb-3 last:border-0 last:pb-0">
      <span className="flex items-center gap-2.5 text-[13px] text-ink">
        {ok ? (
          <CircleCheck className="h-4 w-4 text-success" strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-warning" strokeWidth={1.8} aria-hidden="true" />
        )}
        {label}
      </span>
      <span className={ok ? "text-[12px] text-ash" : "text-[12px] font-medium text-warning"}>
        {detail}
      </span>
    </li>
  );
}