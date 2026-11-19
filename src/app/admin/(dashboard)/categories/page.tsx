import { Tags } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { listCategoriesWithCounts } from "@/lib/services/categories";
import { Card } from "@/components/admin/primitives";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export default async function CategoriesPage() {
  await requirePermission("categories.write");
  const categories = await listCategoriesWithCounts().catch(() => []);

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow text-gold-deep">Catalogue</p>
        <h2 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[32px]">
          Categories
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ash">
          Organise the collection into categories. Categories appear in the storefront navigation.
        </p>
      </div>

      <Card pad={false}>
        <CategoryManager
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            gender: category.gender,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            productCount: category.productCount,
          }))}
        />
      </Card>
    </div>
  );
}