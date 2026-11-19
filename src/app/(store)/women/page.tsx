import type { Metadata } from "next";
import { ShopView } from "@/components/storefront/shop-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Women's Footwear",
  description:
    "Heels, boots and loafers for women — refined silhouettes in leather and suede, with personal WhatsApp ordering from Manuella Sole Footwear.",
  alternates: { canonical: "/women" },
};

export default async function WomenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <ShopView
      basePath="/women"
      searchParams={params}
      eyebrow="For her"
      title="Women's collection"
      lockedGender="Women"
      allowGenderFilter={false}
      description="From a sculpted court heel to a grounded Chelsea boot, each pair is chosen for its line, its comfort and how it carries through the day."
    />
  );
}
