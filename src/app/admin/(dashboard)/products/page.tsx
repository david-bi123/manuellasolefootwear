import Link from "next/link";
import {
  Archive,
  Boxes,
  CircleAlert,
  Eye,
  EyeOff,
  Package,
  Pencil,
  Plus,
  Star,
} from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getAdminProducts } from "@/lib/services/admin-products";
import { listCategoriesWithCounts } from "@/lib/services/categories";
import { formatMoney, formatNumber, formatDate } from "@/lib/format";
import { PageHead, Card, Pill, Td, Th, EmptyState } from "@/components/admin/primitives";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { Pagination } from "@/components/admin/pagination";
import { AdminFilterBar } from "@/components/admin/filter-bar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("products.view");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const gender = typeof params.gender === "string" ? params.gender : "";
  const status = typeof params.status === "string" ? params.status : "";
  const page = Number(typeof params.page === "string" ? params.page : 1) || 1;

  const [result, categories] = await Promise.all([
    getAdminProducts({ q, category, gender, status, page, pageSize: 20 }),
    listCategoriesWithCounts().catch(() => []),
  ]);

  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    const base = { q, category, gender, status, page, ...overrides };
    for (const [key, value] of Object.entries(base)) {
      if (value !== undefined && value !== "" && value !== 0) next.set(key, String(value));
    }
    const qs = next.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  return (
    <div className="space-y-5">
      <PageHead
        title="Products"
        description="Create and manage the footwear collection. Products marked published appear on the storefront."
      >
        <Link
          href="/admin/products/new"
          className="inline-flex h-9 items-center gap-2 bg-ink px-4 text-[10px] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-gold-deep"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New product
        </Link>
      </PageHead>

      <Card pad={false} className="p-4 sm:p-5">
        <AdminFilterBar
          action="/admin/products"
          fields={[
            { name: "q", placeholder: "Search name or SKU", defaultValue: q, type: "search" },
            {
              name: "category",
              label: "Category",
              type: "select",
              defaultValue: category,
              options: [
                { value: "", label: "All categories" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ],
            },
            {
              name: "gender",
              label: "Gender",
              type: "select",
              defaultValue: gender,
              options: [
                { value: "", label: "All" },
                { value: "Men", label: "Men" },
                { value: "Women", label: "Women" },
                { value: "Unisex", label: "Unisex" },
              ],
            },
            {
              name: "status",
              label: "Status",
              type: "select",
              defaultValue: status,
              options: [
                { value: "", label: "All" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
                { value: "low", label: "Low stock" },
              ],
            },
          ]}
        />
      </Card>

      <Card pad={false}>
        {result.items.length ? (
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
            <table className="admin-table min-w-[820px]">
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Status</Th>
                  <Th>Updated</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((product) => (
                  <tr key={product.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-9 shrink-0 overflow-hidden border border-line bg-cream">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center">
                              <Package className="h-4 w-4 text-line-dark" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="block truncate text-[13px] font-medium text-ink transition-colors hover:text-gold-deep"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-[11px] text-ash-light">
                            {product.sku} · {product.gender}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-ash">{product.categoryName}</Td>
                    <Td className="font-medium tabular-nums text-ink">
                      {formatMoney(product.priceFrom)}
                    </Td>
                    <Td className="tabular-nums text-ash">
                      {formatNumber(product.totalStock)}
                      <span className="ml-1 text-[11px] text-ash-light">
                        ({product.variantCount})
                      </span>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {product.isArchived ? (
                          <Pill tone="neutral">Archived</Pill>
                        ) : product.isPublished ? (
                          <Pill tone="success">Published</Pill>
                        ) : (
                          <Pill tone="warning">Draft</Pill>
                        )}
                        {product.isFeatured ? (
                          <Pill tone="gold">
                            <Star className="h-2.5 w-2.5" aria-hidden="true" /> Featured
                          </Pill>
                        ) : null}
                      </div>
                    </Td>
                    <Td className="text-ash">{formatDate(product.updatedAt)}</Td>
                    <Td className="text-right">
                      <ProductRowActions product={product} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No products yet"
            body="Add your first style to start building the collection."
            action={
              <Link
                href="/admin/products/new"
                className="inline-flex h-10 items-center bg-ink px-5 text-[10px] uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-gold-deep"
              >
                Create a product
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
          noun="products"
        />
      ) : null}
    </div>
  );
}