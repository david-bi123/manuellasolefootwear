import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/storefront/shop-view";
import { getCategoriesWithCounts } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

const FALLBACK_COPY: Record<string, string> = {
  heels:
    "Sculpted courts, peep-toes and block heels chosen for balance and all-day wear. Each pair is finished in leather or suede with a considered heel height.",
  boots:
    "Chelsea, brogue and buckle boots in suede and burnished leather — grounded silhouettes that work with tailoring and denim alike.",
  loafers:
    "Penny, tassel and driving loafers with soft leather linings and flexible soles. The easiest pair in the wardrobe to reach for.",
  formal:
    "Oxfords, derbies and monk straps with clean lines and honest construction. Made to be worn often and repaired rather than replaced.",
};

async function findCategory(slug: string) {
  const categories = await getCategoriesWithCounts().catch(() => []);
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) return { title: "Category not found" };

  return {
    title: `${category.name} — Manuella Sole Footwear`,
    description:
      FALLBACK_COPY[category.slug] ??
      `Shop ${category.name.toLowerCase()} at Manuella Sole Footwear. Order the pair you love directly on WhatsApp.`,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: category.image ? { images: [{ url: category.image }] } : undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await findCategory(slug);
  if (!category) notFound();

  return (
    <ShopView
      basePath={`/category/${category.slug}`}
      searchParams={query}
      eyebrow="Shop by category"
      title={category.name}
      description={category.description || FALLBACK_COPY[category.slug] || undefined}
      lockedCategory={category.slug}
      allowCategoryFilter={false}
    />
  );
}
