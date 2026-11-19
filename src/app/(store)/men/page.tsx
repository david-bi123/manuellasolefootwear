import type { Metadata } from "next";
import { ShopView } from "@/components/storefront/shop-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Men's Footwear",
  description:
    "Oxfords, derbies, loafers and boots for men — considered classics in leather and suede, with personal WhatsApp ordering from Manuella Sole Footwear.",
  alternates: { canonical: "/men" },
};

export default async function MenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <ShopView
      basePath="/men"
      searchParams={params}
      eyebrow="For him"
      title="Men's collection"
      lockedGender="Men"
      allowGenderFilter={false}
      description="Goodyear-welted formals, soft suede loafers and everyday boots — a wardrobe of pairs built to be resoled, not replaced."
    />
  );
}
