import type { Metadata } from "next";
import { ShopView } from "@/components/storefront/shop-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "The latest pairs to arrive at Manuella Sole Footwear — new heels, boots, loafers and formal shoes, available to order on WhatsApp.",
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <ShopView
      basePath="/new-arrivals"
      searchParams={params}
      eyebrow="Just in"
      title="New arrivals"
      description="Fresh silhouettes and returning favourites, added as they land in the collection. New pairs are announced here first."
      newOnly
    />
  );
}
