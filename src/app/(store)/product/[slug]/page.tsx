import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Footprints, Plus } from "lucide-react";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { PurchasePanel } from "@/components/storefront/purchase-panel";
import { ProductCard } from "@/components/storefront/product-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function summarise(text: string, length = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length - 1)}…` : clean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: summarise(product.description || `${product.name} from Manuella Sole Footwear.`),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} — Manuella Sole Footwear`,
      description: summarise(product.description, 200),
      type: "website",
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.id, 4).catch(() => []);
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: settings.businessName },
    category: product.categoryName,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GHS",
      lowPrice: product.price,
      highPrice: Math.max(...product.variants.map((variant) => variant.price), product.price),
      offerCount: product.variants.length,
      availability:
        totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      ...(product.categorySlug
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.categoryName,
              item: `${SITE_URL}/category/${product.categorySlug}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: 4, name: product.name },
    ],
  };

  return (
    <>
      <div className="shell">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 py-6 text-[10px] uppercase tracking-[0.14em] text-ash-light"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          {product.categorySlug ? (
            <>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <Link
                href={`/category/${product.categorySlug}`}
                className="transition-colors hover:text-ink"
              >
                {product.categoryName}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ash">{product.name}</span>
        </nav>

        <div className="grid gap-12 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pb-28">
          <ProductGallery images={product.images} name={product.name} />

          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold" aria-hidden="true" />
              <p className="eyebrow text-gold-deep">{product.categoryName || product.gender}</p>
            </div>
            <h1 className="mt-5 font-display text-[44px] leading-[1.02] tracking-[-0.02em] text-ink sm:text-[54px]">
              {product.name}
            </h1>
            <p className="mt-5 text-[14px] leading-[1.85] text-ash">{product.description}</p>

            <div className="mt-8 border-t border-line pt-7">
              <PurchasePanel
                productName={product.name}
                slug={product.slug}
                variants={product.variants}
                sizingSystem={product.sizingSystem}
                fallbackPrice={product.price}
                businessName={settings.businessName}
                whatsappNumber={settings.whatsappNumber}
                siteUrl={SITE_URL}
                lowStockThreshold={product.lowStockThreshold}
              />
            </div>

            <div className="mt-9 border-t border-line">
              {[
                {
                  title: "Materials & construction",
                  body: "Selected for the quality of the upper, the lining and the sole. Full-grain leathers are finished by hand; suede is treated for everyday wear. Exact materials are confirmed on request before you order.",
                },
                {
                  title: "Care",
                  body: "Brush suede after wear and store away from direct heat. Clean leather with a soft cloth and a neutral cream; use shoe trees to hold the shape. Avoid prolonged exposure to water.",
                },
                {
                  title: "Delivery & returns",
                  body: "Delivery is arranged personally on WhatsApp and confirmed before dispatch. If a pair is not right, message us within 48 hours of delivery to arrange an exchange or return — unworn, in original packaging.",
                },
                {
                  title: "Sizing guidance",
                  body: `This style uses ${product.sizingSystem} sizing. If you are between sizes or unsure, send us a message — we will compare the fit against a pair you already own.`,
                },
              ].map((section) => (
                <details key={section.title} className="group border-b border-line py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.14em] text-ink [&::-webkit-details-marker]:hidden">
                    {section.title}
                    <Plus className="h-4 w-4 text-gold-deep transition-transform duration-300 group-open:rotate-45" strokeWidth={1.6} aria-hidden="true" />
                  </summary>
                  <p className="mt-3 text-[12.5px] leading-[1.8] text-ash">{section.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {related.length ? (
        <section className="border-t border-line bg-cream/40">
          <div className="shell py-20 lg:py-24">
            <Reveal>
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-gold-deep">Continue exploring</p>
                  <h2 className="display-2 mt-3 text-ink">You may also like</h2>
                </div>
                <Link
                  href={`/category/${product.categorySlug}`}
                  className="hidden border-b border-ink/30 pb-1 text-[10px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-gold hover:text-gold-deep sm:inline-block"
                >
                  All {product.categoryName.toLowerCase()}
                </Link>
              </div>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((item) => (
                <RevealItem key={item.id}>
                  <ProductCard product={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : (
        <section className="border-t border-line bg-cream/40">
          <div className="shell flex flex-col items-center gap-3 py-14 text-center">
            <Footprints className="h-6 w-6 text-gold" aria-hidden="true" />
            <p className="font-display text-2xl text-ink">Looking for something else?</p>
            <Link
              href="/shop"
              className="text-[10px] uppercase tracking-[0.16em] text-ink underline underline-offset-4"
            >
              Browse the full collection
            </Link>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </>
  );
}
