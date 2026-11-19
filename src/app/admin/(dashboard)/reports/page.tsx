import {
  Banknote,
  Download,
  ReceiptText,
  TrendingUp,
  Boxes,
} from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { buildSalesCsv, getReportData, resolveRange } from "@/lib/services/analytics";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { Card, CardHead, StatCard, Td, Th, EmptyState } from "@/components/admin/primitives";
import { BarList, CategoryBarChart, PaymentDonut, RevenueChart } from "@/components/admin/charts";
import { RangePicker } from "@/components/admin/range-picker";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("reports.view");
  const params = await searchParams;

  const preset = typeof params.preset === "string" ? params.preset : "30d";
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;
  const range = resolveRange(preset, from, to);
  const data = await getReportData(range);

  // CSV download link preserves the active range.
  const exportParams = new URLSearchParams({ preset: range.preset });
  if (range.preset === "custom") {
    exportParams.set("from", range.fromISO);
    exportParams.set("to", range.toISO);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold-deep">{range.label}</p>
          <h2 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[32px]">
            Reports
          </h2>
          <p className="mt-1.5 text-[13px] text-ash">
            A full picture of sales, stock and performance for the selected period.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <RangePicker
            preset={range.preset}
            from={params.from === undefined ? undefined : String(params.from)}
            to={params.to === undefined ? undefined : String(params.to)}
          />
          <a
            href={`/admin/reports/export?${exportParams.toString()}`}
            className="inline-flex h-9 items-center gap-2 border border-line bg-white px-4 text-[10px] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Net revenue"
          value={formatMoney(data.summary.revenue)}
          hint={`Gross ${formatMoney(data.summary.grossRevenue)} · refunds ${formatMoney(data.summary.refunds)}`}
          icon={Banknote}
          tone="gold"
        />
        <StatCard
          label="Gross profit"
          value={formatMoney(data.summary.profit)}
          hint={`Margin ${formatPercent(data.summary.margin)}`}
          icon={TrendingUp}
          tone={data.summary.profit >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Orders"
          value={formatNumber(data.summary.salesCount)}
          hint={`Average order ${formatMoney(data.summary.averageOrder)}`}
          icon={ReceiptText}
        />
        <StatCard
          label="Units on hand"
          value={formatNumber(data.inventory.totalUnits)}
          hint={`${data.inventory.lowStock} low · ${data.inventory.outOfStock} out of stock`}
          icon={Boxes}
          tone={data.inventory.outOfStock ? "danger" : data.inventory.lowStock ? "warning" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" pad={false}>
          <div className="p-5 sm:p-6">
            <CardHead title="Revenue over time" description="Net revenue plotted by day." />
            <RevenueChart
              data={data.daily.map((point) => ({
                label: point.period,
                revenue: point.revenue,
                profit: point.profit,
                orders: point.orders,
              }))}
              showProfit
            />
          </div>
        </Card>
        <Card pad={false}>
          <div className="p-5 sm:p-6">
            <CardHead title="Payment mix" description="How customers are paying." />
            <PaymentDonut data={data.paymentMix} />
          </div>
        </Card>
      </div>

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
                    <p className="text-[11px] text-ash-light">{formatNumber(product.quantity)} sold</p>
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
          <CategoryBarChart data={data.categories} />
        </Card>

        <Card>
          <CardHead title="Stock by category" description="Units on hand." />
          <BarList
            data={data.stockByCategory.map((row) => ({
              name: row.name,
              value: row.units,
              hint: `${formatNumber(row.units)} · ${formatMoney(row.costValue)}`,
            }))}
            emptyLabel="No stock on hand."
          />
        </Card>
      </div>

      <Card pad={false}>
        <div className="p-5 sm:p-6">
          <CardHead
            title="Sales in this period"
            description={`${formatNumber(data.sales.length)} orders · ${range.label}`}
          />
          {data.sales.length ? (
            <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
              <table className="admin-table min-w-[720px]">
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
                  {data.sales.slice(0, 50).map((sale) => (
                    <tr key={sale.id}>
                      <Td className="font-medium text-ink">{sale.saleReference}</Td>
                      <Td className="text-ash">{sale.customerName}</Td>
                      <Td className="text-ash">{formatMoney(sale.total)}</Td>
                      <Td className="text-ash">{sale.saleStatus}</Td>
                      <Td className="text-right font-medium tabular-nums text-ink">
                        {formatMoney(sale.total)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.sales.length > 50 ? (
                <p className="mt-3 text-center text-[11.5px] text-ash-light">
                  Showing the first 50 of {formatNumber(data.sales.length)}. Export CSV for the full list.
                </p>
              ) : null}
            </div>
          ) : (
            <EmptyState
              icon={ReceiptText}
              title="No sales in this period"
              body="Choose a different date range to see sales."
            />
          )}
        </div>
      </Card>
    </div>
  );
}