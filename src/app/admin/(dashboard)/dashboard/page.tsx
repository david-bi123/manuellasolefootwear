import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Boxes,
  CircleAlert,
  Footprints,
  ReceiptText,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewFinancials } from "@/lib/roles";
import { getDashboardData, resolveRange } from "@/lib/services/analytics";
import { formatMoney, formatNumber, formatPercent, formatDateTime } from "@/lib/format";
import { Card, CardHead, Pill, StatCard, TableShell, Td, Th, EmptyState } from "@/components/admin/primitives";
import { BarList, GenderSplit, PaymentDonut, RevenueChart, Sparkline } from "@/components/admin/charts";
import { RangePicker } from "@/components/admin/range-picker";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

function saleStatusTone(status: string) {
  switch (status) {
    case "Completed":
      return "success" as const;
    case "Partially Returned":
      return "warning" as const;
    case "Returned":
    case "Cancelled":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function paymentTone(status: string) {
  switch (status) {
    case "Paid":
      return "success" as const;
    case "Partially Paid":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const financials = canViewFinancials(user?.role ?? "staff", user?.permissions);

  const preset = typeof params.preset === "string" ? params.preset : "30d";
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;
  const range = resolveRange(preset, from, to);
  const data = await getDashboardData(range);

  const denied = typeof params.denied === "string" ? params.denied : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (user?.name ?? "there").split(/\s+/)[0];

  return (
    <div className="space-y-5">
      {denied ? (
        <div
          role="alert"
          className="flex items-start gap-3 border border-warning/25 bg-warning/5 px-4 py-3 text-[12.5px] text-warning"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden="true" />
          <span>
            You do not have permission to view <span className="font-semibold">{denied}</span>. If
            you need access, ask the owner to update your role.
          </span>
        </div>
      ) : null}

      {/* Hero band */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-ink text-ivory shadow-lift">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80rem 26rem at 110% -30%, rgba(200,163,95,0.28), transparent 55%), radial-gradient(50rem 24rem at -10% 130%, rgba(23,83,64,0.5), transparent 55%)",
          }}
          aria-hidden="true"
        />
        <Footprints
          className="pointer-events-none absolute -right-4 top-1/2 hidden h-44 w-44 -translate-y-1/2 text-champagne/10 lg:block"
          strokeWidth={0.9}
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-champagne">{range.label} · Manuella Console</p>
            <h2 className="mt-3 font-display text-[30px] leading-[1.05] text-ivory sm:text-[38px]">
              {greeting}, <span className="italic text-champagne">{firstName}.</span>
            </h2>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ivory/60">
              Here’s how the shop is performing — revenue, stock and the orders that need
              your attention today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/sales/new"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-champagne px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink transition-all hover:bg-champagne-pale hover:shadow-glow"
            >
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              Record a sale
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-ivory/20 bg-white/[0.04] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory backdrop-blur transition-colors hover:border-champagne/50 hover:text-champagne"
            >
              <Boxes className="h-4 w-4" aria-hidden="true" />
              Add product
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ash-light">
          Performance overview
        </p>
        <RangePicker
          preset={range.preset}
          from={params.from === undefined ? undefined : String(params.from)}
          to={params.to === undefined ? undefined : String(params.to)}
        />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {financials ? (
          <>
            <StatCard
              label="Net revenue"
              value={formatMoney(data.summary.revenue)}
              hint={`Gross ${formatMoney(data.summary.grossRevenue)} · refunds ${formatMoney(data.summary.refunds)}`}
              icon={Banknote}
              tone="gold"
            >
              <Sparkline data={data.series} dataKey="revenue" stroke="#175340" className="relative mt-4 h-10 w-full" />
            </StatCard>
            <StatCard
              label="Gross profit"
              value={formatMoney(data.summary.profit)}
              hint={`Margin ${formatPercent(data.summary.margin)} · COGS ${formatMoney(data.summary.cost)}`}
              icon={TrendingUp}
              tone={data.summary.profit >= 0 ? "success" : "danger"}
            />
            <StatCard
              label="Orders"
              value={formatNumber(data.summary.salesCount)}
              hint={
                data.summary.pendingCount
                  ? `${data.summary.pendingCount} awaiting payment · ${formatMoney(data.summary.outstanding)} outstanding`
                  : `Average order ${formatMoney(data.summary.averageOrder)}`
              }
              icon={ReceiptText}
            >
              <Sparkline data={data.series} dataKey="orders" stroke="#c8a35f" className="relative mt-4 h-10 w-full" />
            </StatCard>
            <StatCard
              label="Units on hand"
              value={formatNumber(data.inventory.totalUnits)}
              hint={`${data.inventory.lowStock} low · ${data.inventory.outOfStock} out of stock`}
              icon={Boxes}
              tone={data.inventory.outOfStock ? "danger" : data.inventory.lowStock ? "warning" : "neutral"}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Net revenue"
              value={formatMoney(data.summary.revenue)}
              hint={`${formatNumber(data.summary.salesCount)} orders recorded`}
              icon={Banknote}
              tone="gold"
            >
              <Sparkline data={data.series} dataKey="revenue" stroke="#175340" className="relative mt-4 h-10 w-full" />
            </StatCard>
            <StatCard
              label="Orders"
              value={formatNumber(data.summary.salesCount)}
              hint={`Average order ${formatMoney(data.summary.averageOrder)}`}
              icon={ReceiptText}
            >
              <Sparkline data={data.series} dataKey="orders" stroke="#c8a35f" className="relative mt-4 h-10 w-full" />
            </StatCard>
            <StatCard
              label="Units on hand"
              value={formatNumber(data.inventory.totalUnits)}
              hint={`${data.inventory.totalVariants} size and colour options`}
              icon={Boxes}
            />
            <StatCard
              label="Low stock"
              value={formatNumber(data.inventory.lowStock + data.inventory.outOfStock)}
              hint={`${data.inventory.lowStock} low · ${data.inventory.outOfStock} out of stock`}
              icon={AlertTriangle}
              tone={data.inventory.outOfStock ? "danger" : data.inventory.lowStock ? "warning" : "success"}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" pad={false}>
          <div className="p-5 sm:p-6">
            <CardHead
              title={financials ? "Revenue & gross profit" : "Revenue"}
              description="Net revenue after returns, plotted daily."
              action={
                <div className="flex items-center gap-4 text-[11px] text-ash">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
                    Revenue
                  </span>
                  {financials ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />
                      Gross profit
                    </span>
                  ) : null}
                </div>
              }
            />
            <RevenueChart data={data.series} showProfit={financials} />
          </div>
        </Card>

        <Card pad={false}>
          <div className="p-5 sm:p-6">
            <CardHead title="Payment mix" description="How customers are paying." />
            <PaymentDonut data={data.paymentMix} />
          </div>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHead title="Top products" description="By units sold in this period." />
          {data.topProducts.length ? (
            <ul className="divide-y divide-line/70">
              {data.topProducts.map((product, index) => (
                <li key={product.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="w-5 shrink-0 font-display text-[17px] text-ash-light tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{product.name}</p>
                    <p className="text-[11px] text-ash-light">
                      {formatNumber(product.quantity)} sold
                    </p>
                  </div>
                  <span className="shrink-0 text-[12.5px] font-medium tabular-nums text-ink">
                    {formatMoney(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[12.5px] text-ash">No product sales in this period.</p>
          )}
        </Card>

        <Card>
          <CardHead title="Category performance" description="Units sold per category." />
          <BarList
            data={data.categories.map((category) => ({
              name: category.name,
              value: category.quantity,
              hint: `${formatNumber(category.quantity)} · ${formatMoney(category.revenue)}`,
            }))}
            emptyLabel="No category sales in this period."
          />
        </Card>

        <Card>
          <CardHead title="Stock health" description="Units on hand across the collection." />
          <GenderSplit data={data.stockByGender} />
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-line pt-5 min-[420px]:grid-cols-2">
            <div className="min-w-0">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ash-light">
                Retail value
              </p>
              <p className="mt-1.5 break-words font-display text-[19px] leading-tight text-ink tabular-nums">
                {formatMoney(data.inventory.retailValue)}
              </p>
            </div>
            {financials ? (
              <div className="min-w-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ash-light">
                  Cost value
                </p>
                <p className="mt-1.5 break-words font-display text-[19px] leading-tight text-ink tabular-nums">
                  {formatMoney(data.inventory.costValue)}
                </p>
              </div>
            ) : (
              <div className="min-w-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ash-light">
                  Variants
                </p>
                <p className="mt-1.5 font-display text-[19px] leading-tight text-ink tabular-nums">
                  {formatNumber(data.inventory.totalVariants)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Low stock + recent sales */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHead
            title="Needs attention"
            description="Lowest stock first."
            action={
              <Link
                href="/admin/inventory?status=low"
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-ash transition-colors hover:text-ink"
              >
                View inventory
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            }
          />
          {data.lowStock.length ? (
            <ul className="space-y-3">
              {data.lowStock.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.colour}`}
                  className="flex items-center justify-between gap-3 border-b border-line/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">{item.productName}</p>
                    <p className="text-[11px] text-ash-light">
                      {item.sizingSystem} {item.size} · {item.colour}
                    </p>
                  </div>
                  <Pill tone={item.stockQuantity === 0 ? "danger" : "warning"} dot>
                    {item.stockQuantity === 0 ? "Out" : `${item.stockQuantity} left`}
                  </Pill>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[12.5px] text-ash">
              Every variant is above its low-stock threshold.
            </p>
          )}
        </Card>

        <Card pad={false} className="lg:col-span-2">
          <div className="p-5 sm:p-6">
            <CardHead
              title="Recent sales"
              description="The latest recorded orders."
              action={
                <Link
                  href="/admin/sales"
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-ash transition-colors hover:text-ink"
                >
                  View all sales
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              }
            />
            {data.recentSales.length ? (
              <div className="-mx-1 overflow-x-auto px-1">
                <table className="admin-table min-w-[560px]">
                  <thead>
                    <tr>
                      <Th>Reference</Th>
                      <Th>Customer</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th className="text-right">Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSales.map((sale) => (
                      <tr key={sale.id}>
                        <Td>
                          <Link
                            href={`/admin/sales/${sale.id}`}
                            className="font-medium text-ink transition-colors hover:text-gold-deep"
                          >
                            {sale.saleReference}
                          </Link>
                          <p className="mt-0.5 text-[11px] text-ash-light">
                            {sale.itemCount} {sale.itemCount === 1 ? "item" : "items"} ·{" "}
                            {sale.paymentMethod}
                          </p>
                        </Td>
                        <Td>
                          <span className="text-ink">{sale.customerName}</span>
                          {sale.customerPhone ? (
                            <p className="mt-0.5 text-[11px] text-ash-light">{sale.customerPhone}</p>
                          ) : null}
                        </Td>
                        <Td className="text-ash">{formatDateTime(sale.saleDate)}</Td>
                        <Td>
                          <div className="flex flex-col gap-1">
                            <Pill tone={saleStatusTone(sale.saleStatus)}>{sale.saleStatus}</Pill>
                            <Pill tone={paymentTone(sale.paymentStatus)}>{sale.paymentStatus}</Pill>
                          </div>
                        </Td>
                        <Td className="text-right font-medium tabular-nums text-ink">
                          {formatMoney(sale.total)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={CircleAlert}
                title="No sales recorded yet"
                body="Record your first sale to start building the picture of the business."
                action={
                  <Link
                    href="/admin/sales/new"
                    className="inline-flex h-10 items-center bg-ink px-5 text-[10px] uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-gold-deep"
                  >
                    Record a sale
                  </Link>
                }
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
