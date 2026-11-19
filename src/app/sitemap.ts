import type { MetadataRoute } from "next";
import { getCategoriesWithCounts, getStorefrontSitemapProducts } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/new-arrivals`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/women`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/men`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [categories, products] = await Promise.all([
      getCategoriesWithCounts(),
      getStorefrontSitemapProducts(),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((category) => ({
        url: `${SITE_URL}/category/${category.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...products.map((product) => ({
        url: `${SITE_URL}/product/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
