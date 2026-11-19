import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { listCategoriesWithCounts } from "@/lib/services/categories";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await requirePermission("products.write");
  const categories = await listCategoriesWithCounts().catch(() => []);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ash transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to products
        </Link>
        <h2 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[32px]">
          New product
        </h2>
      </div>

      {categories.length === 0 ? (
        <div className="border border-warning/25 bg-warning/5 px-4 py-3 text-[12.5px] text-warning">
          You have no categories yet.{" "}
          <Link href="/admin/categories" className="font-medium underline underline-offset-2">
            Create a category
          </Link>{" "}
          before adding a product.
        </div>
      ) : null}

      <ProductForm
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}