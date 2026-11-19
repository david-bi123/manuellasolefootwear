import Link from "next/link";
import { CircleAlert, Plus, ReceiptText } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { listSales } from "@/lib/services/sales";
import { PAYMENT_METHODS, PAYMENT_STATUSES, SALE_STATUSES } from "@/lib/models/sale";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { PageHead, Card, Pill, Td, Th, EmptyState } from "@/components/admin/primitives";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sales",
  robots: { index: false, follow: false },
};

function saleTone(status: string) {
  if (status === "Completed") return "success" as const;
  if (status === "Partially Returned") return "warning" as const;
  return "danger" as const;
}

function payTone(status: string) {
  if (status === "Paid") return "success" as const;
  if (status === "Partially Paid") return "warning" as const;
  return "neutral" as const;
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("sales.view");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const paymentStatus = typeof params.paymentStatus === "string" ? params.paymentStatus : "";
  const paymentMethod = typeof params.paymentMethod === "string" ? params.paymentMethod : "";
  const saleStatus = typeof params.saleStatus === "string" ? params.saleStatus : "";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  const page = Number(typeof params.page === "string" ? params.page : 1) || 1;

  const result = await listSales({
    q,
    paymentStatus,
    paymentMethod,
    saleStatus,
    from: from || undefined,
    to: to || undefined,
    page,
    pageSize: 20,
  });

  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    const base = { q, paymentStatus, paymentMethod, saleStatus, from, to, page, ...overrides };
    for (const [key, value] of Object.entries(base)) {
      if (value !== undefined && value !== "" && value !== 0) next.set(key, String(value));
    }
    const qs = next.toString();
    return qs ? `/admin/sales?${qs}` : "/admin/sales";
  };

  return (
    <div className="space-y-5">
      <PageHead
        title="Sales"
        description="Recorded orders. Open a sale to record returns, update payment status or cancel it."
      >
        <Link
          href="/admin/sales/new"
          className="inline-flex h-9 items-center gap-2 bg-ink px-4 text-[10px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-gold-deep"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Record a sale
        </Link>
      </PageHead>

      <Card pad={false} className="p-4 sm:p-5">
        <AdminFilterBar
          action="/admin/sales"
          fields={[
            { name: "q", placeholder: "Reference, name or phone", defaultValue: q, type: "search" },
            {
              name: "paymentStatus",
              label: "Payment",
              type: "select",
              defaultValue: paymentStatus,
              options: [
                { value: "", label: "All" },
                ...PAYMENT_STATUSES.map((s) => ({ value: s, label: s })),
              ],
            },
            {
              name: "paymentMethod",
              label: "Method",
              type: "select",
              defaultValue: paymentMethod,
              options: [
                { value: "", label: "All" },
                ...PAYMENT_METHODS.map((m) => ({ value: m, label: m })),
              ],
            },
            {
              name: "saleStatus",
              label: "Status",
              type: "select",
              defaultValue: saleStatus,
              options: [
                { value: "", label: "All" },
                ...SALE_STATUSES.map((s) => ({ value: s, label: s })),
              ],
            },
            { name: "from", label: "From", type: "date", defaultValue: from },
            { name: "to", label: "To", type: "date", defaultValue: to },
          ]}
        />
      </Card>

      <Card pad={false}>
        {result.items.length ? (
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
            <table className="admin-table min-w-[820px]">
              <thead>
                <tr>
                  <Th>Reference</Th>
                  <Th>Customer</Th>
                  <Th>Date</Th>
                  <Th>Items</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((sale) => (
                  <tr key={sale.id}>
                    <Td>
                      <Link
                        href={`/admin/sales/${sale.id}`}
                        className="font-medium text-ink transition-colors hover:text-gold-deep"
                      >
                        {sale.saleReference}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-ash-light">{sale.createdByName}</p>
                    </Td>
                    <Td>
                      <span className="text-ink">{sale.customerName}</span>
                      {sale.customerPhone ? (
                        <p className="mt-0.5 text-[11px] text-ash-light">{sale.customerPhone}</p>
                      ) : null}
                    </Td>
                    <Td className="text-ash">{formatDateTime(sale.saleDate)}</Td>
                    <Td className="tabular-nums text-ash">{formatNumber(sale.itemCount)}</Td>
                    <Td>
                      <Pill tone={saleTone(sale.saleStatus)}>{sale.saleStatus}</Pill>
                    </Td>
                    <Td>
                      <Pill tone={payTone(sale.paymentStatus)}>{sale.paymentStatus}</Pill>
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
            icon={ReceiptText}
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
      </Card>

      {result.pages > 1 ? (
        <Pagination
          page={result.page}
          pages={result.pages}
          total={result.total}
          pageSize={result.pageSize}
          hrefForPage={(p) => buildQuery({ page: p })}
          noun="sales"
        />
      ) : null}
    </div>
  );
}