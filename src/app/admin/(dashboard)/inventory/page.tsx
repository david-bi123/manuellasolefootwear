import {
  AlertTriangle,
  Boxes,
  CircleAlert,
  PackageSearch,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getInventorySummary, listInventory } from "@/lib/services/inventory";
import { formatMoney, formatNumber } from "@/lib/format";
import { Card, Pill, StatCard, Td, Th, EmptyState } from "@/components/admin/primitives";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StockAdjustButton } from "@/components/admin/stock-adjust";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventory",
  robots: { index: false, follow: false },
};

function statusTone(status: string) {
  if (status === "In stock") return "success" as const;
  if (status === "Low stock") return "warning" as const;
  return "danger" as const;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("inventory.view");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const size = typeof params.size === "string" ? params.size : "";
  const colour = typeof params.colour === "string" ? params.colour : "";
  const statusParam = typeof params.status === "string" ? params.status : "";
  const status =
    statusParam === "low" || statusParam === "out" || statusParam === "in" ? statusParam : undefined;
  const page = Number(typeof params.page === "string" ? params.page : 1) || 1;

  const [result, summary] = await Promise.all([
    listInventory({ q, size, colour, status, page, pageSize: 25 }),
    getInventorySummary(),
  ]);

  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    const base = { q, size, colour, status: statusParam, page, ...overrides };
    for (const [key, value] of Object.entries(base)) {
      if (value !== undefined && value !== "" && value !== 0) next.set(key, String(value));
    }
    const qs = next.toString();
    return qs ? `/admin/inventory?${qs}` : "/admin/inventory";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold-deep">Stock</p>
          <h2 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[32px]">
            Inventory
          </h2>
          <p className="mt-1.5 text-[13px] text-ash">
            Every size and colour variant, with live stock levels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Units on hand"
          value={formatNumber(summary.totalUnits)}
          hint={`${formatNumber(summary.totalVariants)} variants`}
          icon={Boxes}
          tone="gold"
        />
        <StatCard
          label="Retail value"
          value={formatMoney(summary.retailValue)}
          hint="At current selling prices"
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Low stock"
          value={formatNumber(summary.lowStock)}
          hint="At or below threshold"
          icon={AlertTriangle}
          tone={summary.lowStock ? "warning" : "neutral"}
        />
        <StatCard
          label="Out of stock"
          value={formatNumber(summary.outOfStock)}
          hint="No units remaining"
          icon={CircleAlert}
          tone={summary.outOfStock ? "danger" : "neutral"}
        />
      </div>

      <Card pad={false} className="p-4 sm:p-5">
        <AdminFilterBar
          action="/admin/inventory"
          fields={[
            { name: "q", placeholder: "Search product or SKU", defaultValue: q, type: "search" },
            {
              name: "status",
              label: "Status",
              type: "select",
              defaultValue: statusParam,
              options: [
                { value: "", label: "All" },
                { value: "in", label: "In stock" },
                { value: "low", label: "Low stock" },
                { value: "out", label: "Out of stock" },
              ],
            },
            { name: "size", placeholder: "Size", defaultValue: size, type: "search" },
            { name: "colour", placeholder: "Colour", defaultValue: colour, type: "search" },
          ]}
        />
      </Card>

      <Card pad={false}>
        {result.items.length ? (
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
            <table className="admin-table min-w-[760px]">
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Variant</Th>
                  <Th>Cost</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Adjust</Th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((row) => (
                  <tr key={`${row.productId}-${row.variantId}`}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-8 shrink-0 overflow-hidden border border-line bg-cream">
                          {row.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.image} alt={row.productName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center">
                              <PackageSearch className="h-3.5 w-3.5 text-line-dark" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-ink">{row.productName}</p>
                          <p className="text-[11px] text-ash-light">
                            {row.SKU} · {row.categoryName}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-ash">
                      {row.sizingSystem} {row.size} · {row.colour}
                    </Td>
                    <Td className="tabular-nums text-ash">{formatMoney(row.costPrice)}</Td>
                    <Td className="font-medium tabular-nums text-ink">
                      {formatMoney(row.salePrice && row.salePrice > 0 ? row.salePrice : row.sellingPrice)}
                    </Td>
                    <Td className="tabular-nums text-ink">{formatNumber(row.stockQuantity)}</Td>
                    <Td>
                      <Pill tone={statusTone(row.status)} dot>
                        {row.status}
                      </Pill>
                    </Td>
                    <Td className="text-right">
                      <StockAdjustButton
                        productId={row.productId}
                        variantId={row.variantId}
                        productName={row.productName}
                        variantLabel={`${row.sizingSystem} ${row.size} · ${row.colour}`}
                        stock={row.stockQuantity}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Boxes}
            title="No inventory to show"
            body="Add products with stock, or adjust your filters."
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
          noun="variants"
        />
      ) : null}
    </div>
  );
}