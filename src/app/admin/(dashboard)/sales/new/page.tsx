import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getProductOptions } from "@/lib/services/admin-products";
import { SaleForm } from "@/components/admin/sale-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Record a sale",
  robots: { index: false, follow: false },
};

export default async function NewSalePage() {
  await requirePermission("sales.write");
  const products = await getProductOptions();

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
        <h2 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[32px]">
          Record a sale
        </h2>
        <p className="mt-1.5 text-[13px] text-ash">
          Select products and sizes. Stock is deducted and a movement is recorded automatically.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="border border-warning/25 bg-warning/5 px-4 py-3 text-[12.5px] text-warning">
          No products are available to sell yet.{" "}
          <Link href="/admin/products/new" className="font-medium underline underline-offset-2">
            Create a product
          </Link>{" "}
          first.
        </div>
      ) : null}

      <SaleForm products={products} />
    </div>
  );
}