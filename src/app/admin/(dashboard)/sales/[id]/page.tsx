import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getSale, type SaleDetail } from "@/lib/services/sales";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { Card, CardHead, Pill, Td, Th } from "@/components/admin/primitives";
import { SaleActions } from "@/components/admin/sale-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sale detail",
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

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("sales.view");
  const { id } = await params;
  const sale = (await getSale(id).catch(() => null)) as SaleDetail | null;
  if (!sale) notFound();

  const outstanding = Math.max(0, sale.total - (sale.refundAmount ?? 0) - (sale.amountPaid ?? 0));
  const canModify = sale.saleStatus === "Completed" || sale.saleStatus === "Partially Returned";

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/sales"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ash transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sales
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-[28px] leading-tight text-ink sm:text-[32px]">
            {sale.saleReference}
          </h2>
          <Pill tone={saleTone(sale.saleStatus)}>{sale.saleStatus}</Pill>
          <Pill tone={payTone(sale.paymentStatus)}>{sale.paymentStatus}</Pill>
        </div>
        <p className="mt-1 text-[12.5px] text-ash">
          {formatDateTime(sale.saleDate)} · Recorded by {sale.createdByName}
        </p>
      </div>

      {sale.saleStatus === "Cancelled" ? (
        <div className="border border-danger/25 bg-danger/5 px-4 py-3 text-[12.5px] text-danger">
          This sale was cancelled{sale.cancellationReason ? `: ${sale.cancellationReason}` : "."}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card pad={false}>
            <div className="p-5 sm:p-6">
              <CardHead title="Items" description="Products included in this sale." />
              <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
                <table className="admin-table min-w-[640px]">
                  <thead>
                    <tr>
                      <Th>Product</Th>
                      <Th>Qty</Th>
                      <Th>Unit</Th>
                      <Th>Discount</Th>
                      <Th className="text-right">Line total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item: SaleDetail["items"][number]) => {
                      const remaining = item.quantity - (item.returnedQuantity ?? 0);
                      return (
                        <tr key={item.id}>
                          <Td>
                            <p className="text-[13px] font-medium text-ink">{item.productName}</p>
                            <p className="text-[11px] text-ash-light">
                              {item.sizingSystem} {item.size} · {item.colour} · {item.SKU}
                              {item.returnedQuantity ? (
                                <span className="ml-1.5 text-danger">
                                  ({item.returnedQuantity} returned)
                                </span>
                              ) : null}
                            </p>
                          </Td>
                          <Td className="tabular-nums text-ash">{formatNumber(remaining)}</Td>
                          <Td className="tabular-nums text-ash">{formatMoney(item.unitSellingPrice)}</Td>
                          <Td className="tabular-nums text-ash">{formatMoney(item.discount)}</Td>
                          <Td className="text-right font-medium tabular-nums text-ink">
                            {formatMoney(item.subtotal - item.discount)}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Notes" />
            <p className="text-[13px] leading-relaxed text-ash">
              {sale.notes || "No notes recorded."}
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHead title="Totals" />
            <dl className="space-y-2.5 text-[13px]">
              <Row label="Subtotal" value={formatMoney(sale.subtotal)} />
              <Row label="Discount" value={`− ${formatMoney(sale.discount)}`} />
              <div className="flex items-center justify-between border-t border-line pt-2.5">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="font-display text-[24px] leading-none tabular-nums text-ink">
                  {formatMoney(sale.total)}
                </dd>
              </div>
              {sale.refundAmount ? (
                <Row label="Refunded" value={`− ${formatMoney(sale.refundAmount)}`} tone="danger" />
              ) : null}
              <Row label="Paid" value={formatMoney(sale.amountPaid ?? 0)} tone="success" />
              {outstanding > 0 ? (
                <Row label="Outstanding" value={formatMoney(outstanding)} tone="warning" />
              ) : null}
            </dl>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[12.5px]">
              <Row label="Payment method" value={sale.paymentMethod} />
              <Row label="Customer" value={sale.customerName || "Walk-in"} />
              {sale.customerPhone ? <Row label="Phone" value={sale.customerPhone} /> : null}
              <Row label="Recorded by" value={sale.createdByName} />
            </dl>
          </Card>

          {canModify ? (
            <Card>
              <CardHead title="Actions" description="Manage this sale." />
              <SaleActions
                sale={{
                  id: sale.id,
                  saleStatus: sale.saleStatus,
                  paymentStatus: sale.paymentStatus,
                  amountPaid: sale.amountPaid ?? 0,
                  outstanding,
                  items: sale.items.map((item: SaleDetail["items"][number]) => ({
                    id: item.id,
                    productName: item.productName,
                    variantLabel: `${item.sizingSystem} ${item.size} · ${item.colour}`,
                    quantity: item.quantity,
                    returnedQuantity: item.returnedQuantity ?? 0,
                  })),
                }}
              />
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-ink";
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ash">{label}</dt>
      <dd className={`font-medium tabular-nums ${toneClass}`}>{value}</dd>
    </div>
  );
}