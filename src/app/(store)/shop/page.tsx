import type { Metadata } from "next";
import { ShopView } from "@/components/storefront/shop-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Footwear",
  description:
    "Browse the full Manuella Sole collection — heels, boots, loafers and formal shoes for men and women, with personal WhatsApp ordering.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <ShopView
      basePath="/shop"
      searchParams={params}
      eyebrow="The collection"
      title="Shop all footwear"
      description="A considered edit of heels, boots, loafers and formal shoes. Filter by category, size or colour, then order the pair you love directly on WhatsApp."
    />
  );
}
