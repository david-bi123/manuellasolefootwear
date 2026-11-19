import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Footprints,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getCategoriesWithCounts, getFeaturedProducts, getNewArrivals } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Manuella Sole Footwear — Step Into Your Style",
  description:
    "Premium heels, boots, loafers and formal shoes for men and women. Explore the collection and order personally on WhatsApp.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [settings, categories, featured, newArrivals] = await Promise.all([
    getSettings(),
    getCategoriesWithCounts().catch(() => []),
    getFeaturedProducts(4).catch(() => []),
    getNewArrivals(4).catch(() => []),
  ]);

  const wa = settings.whatsappNumber;
  const waLink = wa
    ? `https://wa.me/${normaliseWhatsAppNumber(wa)}?text=${encodeURIComponent(
        `Hello ${settings.businessName}! I would like some help choosing a pair.`,
      )}`
    : "/contact";

  const categoryTiles = categories.filter((category) => category.productCount > 0).slice(0, 4);
  const products = featured.length ? featured : newArrivals;

  return (
    <>
      {/* =================================================================
          HERO — oversized editorial split
      ================================================================= */}
      <section className="relative overflow-hidden border-b border-line bg-editorial grain">
        <div className="shell relative z-10 grid items-center gap-10 pb-12 pt-6 sm:pb-16 sm:pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-20 lg:pt-10">
          <div className="relative z-10 max-w-2xl">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-champagne-deep" aria-hidden="true" />
                <p className="eyebrow text-gold-deep">Manuella Sole · Accra</p>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="display-0 mt-6 text-ink">
                Step into
                <br />
                <span className="italic text-champagne">your style.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-[14.5px] leading-[1.85] text-ash">
                Premium heels, boots, loafers and formal shoes for men and women — chosen for
                comfort, character and craft. Order personally on WhatsApp and we will help you
                find the pair.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="btn-sheen group inline-flex h-[56px] items-center gap-2.5 bg-ink px-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold-deep"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    Shop the collection
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
                  </span>
                </Link>
                <a
                  href={waLink}
                  target={wa ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex h-[56px] items-center gap-2.5 border border-ink/25 bg-white/40 px-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink backdrop-blur transition-all hover:border-ink hover:bg-ink hover:text-ivory"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Ask on WhatsApp
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex items-center gap-4 text-[10.5px] uppercase tracking-[0.18em] text-ash">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-champagne-deep" strokeWidth={1.6} aria-hidden="true" />
                  Handpicked pairs
                </span>
                <span className="h-3 w-px bg-line-dark" aria-hidden="true" />
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-champagne-deep" strokeWidth={1.6} aria-hidden="true" />
                  UK &amp; EU sizing
                </span>
                <span className="hidden h-3 w-px bg-line-dark sm:block" aria-hidden="true" />
                <span className="hidden items-center gap-2 sm:inline-flex">
                  <BadgeCheck className="h-4 w-4 text-champagne-deep" strokeWidth={1.6} aria-hidden="true" />
                  Direct ordering
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} y={32} className="relative">
            {/* Champagne halo behind the portrait */}
            <div className="bg-halo pointer-events-none absolute -inset-10 -z-10" aria-hidden="true" />
            <div className="relative mx-auto aspect-[4/5] max-h-[52vh] w-full max-w-[440px] overflow-hidden rounded-2xl rounded-tr-[6rem] bg-cream shadow-editorial ring-1 ring-ink/10 lg:max-h-[58vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero.jpg"
                alt="Black stiletto heels with a gold chain ankle strap, styled in warm editorial light"
                className="h-full w-full object-cover animate-slow-zoom"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent" />
            </div>

            <div className="absolute -bottom-6 left-3 max-w-[280px] animate-float-y rounded-xl border border-line bg-ivory/95 p-5 shadow-lift backdrop-blur sm:left-6">
              <p className="eyebrow text-champagne-deep">The signature edit</p>
              <p className="mt-2 font-display text-[23px] leading-tight text-ink">
                Quiet luxury, made for every day.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:text-gold-deep"
              >
                Explore new arrivals
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Marquee rail */}
        <div className="relative z-10 border-t border-line bg-cream/70">
          <div className="flex overflow-hidden py-3.5">
            <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10 text-[9px] uppercase tracking-[0.28em] text-ash">
              {Array.from({ length: 2 }).map((_, group) => (
                <div key={group} className="flex shrink-0 items-center gap-10">
                  {[
                    "Heels, boots & loafers",
                    "UK & EU sizing",
                    "Direct WhatsApp ordering",
                    "Personal styling advice",
                    "New arrivals weekly",
                  ].map((item) => (
                    <span key={item} className="flex items-center gap-10">
                      {item}
                      <span className="h-1 w-1 rounded-full bg-champagne" aria-hidden="true" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          CATEGORIES — asymmetric editorial tiles
      ================================================================= */}
      <section className="shell py-20 lg:py-28">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-gold-deep">Explore</p>
              <h2 className="display-2 mt-3 text-ink">Shop by category</h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1.5 text-[10px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-gold hover:text-gold-deep"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        {categoryTiles.length ? (
          <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 lg:grid-cols-4">
            {categoryTiles.map((category, index) => (
              <RevealItem key={category.slug} className={index % 2 === 1 ? "lg:mt-10" : undefined}>
                <Link href={`/category/${category.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream shadow-soft ring-1 ring-ink/5">
                    {category.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.image}
                        alt={`${category.name} collection`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <Footprints className="h-9 w-9 text-line-dark" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                      <div>
                        <p className="font-display text-[24px] leading-tight text-ivory">
                          {category.name}
                        </p>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-ivory/65">
                          {category.productCount} {category.productCount === 1 ? "style" : "styles"}
                        </p>
                      </div>
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-ivory/40 text-ivory transition-all duration-300 group-hover:border-champagne group-hover:bg-champagne group-hover:text-ink">
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="border border-line bg-cream/50 px-6 py-16 text-center">
            <Footprints className="mx-auto h-8 w-8 text-gold" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl text-ink">The collection is on its way.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ash">
              Categories will appear here as soon as the first styles are added.
            </p>
          </div>
        )}
      </section>

      {/* =================================================================
          FEATURED — alternating editorial layout with intro panel
      ================================================================= */}
      <section className="border-y border-line bg-cream/50">
        <div className="shell py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <Reveal>
                <p className="eyebrow text-gold-deep">The edit</p>
                <h2 className="display-2 mt-3 text-ink">
                  Pieces we
                  <br />
                  <span className="italic text-gold-deep">love.</span>
                </h2>
                <p className="mt-4 max-w-sm text-[13.5px] leading-[1.8] text-ash">
                  A short selection from the collection — refined shapes, versatile tones and
                  materials that wear beautifully.
                </p>
                <Link
                  href="/shop"
                  className="group mt-7 inline-flex h-[50px] items-center gap-2.5 bg-ink px-7 text-[10px] uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-deep"
                >
                  View all styles
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Reveal>
            </div>

            <div>
              {products.length ? (
                <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6">
                  {products.map((product) => (
                    <RevealItem key={product.id}>
                      <ProductCard product={product} />
                    </RevealItem>
                  ))}
                </RevealGroup>
              ) : (
                <div className="border border-line bg-ivory px-6 py-16 text-center">
                  <Footprints className="mx-auto h-8 w-8 text-gold" aria-hidden="true" />
                  <p className="mt-4 font-display text-2xl text-ink">New styles are on their way.</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-ash">
                    In the meantime, message us on WhatsApp and we will help you find what you are
                    looking for.
                  </p>
                  <a
                    href={waLink}
                    target={wa ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex h-11 items-center gap-2 bg-ink px-6 text-[10px] uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-deep"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Chat with us
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          STORY — asymmetric editorial with oversized pull quote
      ================================================================= */}
      <section className="shell py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream shadow-editorial ring-1 ring-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/story.jpg"
                alt="White bow-embellished pumps styled on a sunlit cafe balustrade"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 right-4 rounded-xl border border-champagne/20 bg-ink px-7 py-6 text-ivory shadow-lift sm:right-6">
              <p className="font-display text-[30px] leading-none text-champagne">Est.</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-ivory/60">
                Accra · Ghana
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="eyebrow text-gold-deep">Our story</p>
            <h2 className="mt-4 font-display text-[32px] leading-[1.08] text-ink sm:text-[42px]">
              Considered, from the first <span className="italic text-gold-deep">sketch</span> to
              your door.
            </h2>
            <p className="mt-6 text-[14px] leading-[1.85] text-ash">
              Manuella Sole began with a simple belief: footwear should feel as good as it looks. We
              work closely with makers to bring together refined silhouettes, honest materials and
              finishes that hold up to real life.
            </p>
            <p className="mt-4 text-[14px] leading-[1.85] text-ash">
              Every pair is chosen by hand, and every order is handled personally — so you always
              know exactly what you are getting.
            </p>
            <Link
              href="/about"
              className="group mt-8 inline-flex h-12 items-center gap-2.5 border border-ink px-7 text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-ivory"
            >
              More about us
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* =================================================================
          PROMISE
      ================================================================= */}
      <section className="shell pb-20 lg:pb-28">
        <RevealGroup className="grid border-y border-line sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Quality-led selection",
              body: "Every style is chosen for its construction, comfort and how it holds up to daily wear.",
            },
            {
              icon: MessageCircle,
              title: "Personal ordering",
              body: "Choose your size and colour, then send your order directly to us on WhatsApp.",
            },
            {
              icon: BadgeCheck,
              title: "Honest advice",
              body: "Need a size recommendation or a second opinion? We are one message away.",
            },
          ].map((item) => (
            <RevealItem
              key={item.title}
              className="h-full border-b border-line py-9 sm:border-b-0 sm:border-r sm:px-9 sm:first:pl-0 sm:last:border-r-0"
            >
              <item.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-5 font-display text-[24px] text-ink">{item.title}</h3>
              <p className="mt-2.5 text-[13px] leading-[1.75] text-ash">{item.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* =================================================================
          CLOSING CTA — oversized editorial statement
      ================================================================= */}
      <section className="relative overflow-hidden bg-ink grain">
        <div className="absolute inset-0 bg-editorial opacity-60" aria-hidden="true" />
        <div className="shell relative z-10 py-20 text-center lg:py-28">
          <Reveal>
            <p className="eyebrow text-champagne">Order personally</p>
            <h2 className="mx-auto mt-5 max-w-3xl font-display text-[40px] leading-[1.02] text-ivory sm:text-[62px]">
              Find the pair that feels
              <br />
              <span className="italic text-champagne">like you.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[13.5px] leading-relaxed text-ivory/55">
              Browse the collection, then send us your size and colour — we will take care of the
              rest.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="group inline-flex h-[54px] items-center gap-2.5 bg-champagne px-9 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-champagne-pale"
              >
                Shop the collection
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <a
                href={waLink}
                target={wa ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex h-[52px] items-center gap-2 border border-ivory/25 px-8 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors hover:border-champagne hover:text-champagne"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Chat with us
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: settings.businessName,
            slogan: settings.tagline,
            url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            currenciesAccepted: "GHS",
            paymentAccepted: "Cash, Mobile Money, Bank Transfer",
            ...(wa ? { telephone: `+${settings.whatsappNumber}` } : {}),
            address: settings.businessAddress
              ? { "@type": "PostalAddress", streetAddress: settings.businessAddress }
              : undefined,
          }),
        }}
      />
    </>
  );
}