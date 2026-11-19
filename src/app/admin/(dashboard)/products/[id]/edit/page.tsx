import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getAdminProduct } from "@/lib/services/admin-products";
import { listCategoriesWithCounts } from "@/lib/services/categories";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("products.write");
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProduct(id).catch(() => null),
    listCategoriesWithCounts().catch(() => []),
  ]);

  if (!product) notFound();

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
          {product.name}
        </h2>
        <p className="mt-1 text-[12.5px] text-ash">
          {product.sku} · {product.categoryName}
        </p>
      </div>

      <ProductForm
        productId={product.id}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        initial={{
          name: product.name,
          description: product.description,
          sku: product.sku,
          categoryId: product.categoryId,
          gender: product.gender,
          sizingSystem: product.sizingSystem,
          images: product.images,
          variants: product.variants,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isPublished: product.isPublished,
          lowStockThreshold: product.lowStockThreshold,
        }}
      />
    </div>
  );
}