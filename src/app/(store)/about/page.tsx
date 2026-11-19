import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Footprints, HandHeart, MessageCircle, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { getSettings } from "@/lib/services/settings";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About",
  description:
    "Manuella Sole Footwear is a considered collection of premium heels, boots, loafers and formal shoes for men and women — ordered personally on WhatsApp.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const settings = await getSettings();
  const wa = settings.whatsappNumber;
  const waLink = wa
    ? `https://wa.me/${normaliseWhatsAppNumber(wa)}?text=${encodeURIComponent(
        `Hello ${settings.businessName}! I would like to know more about the collection.`,
      )}`
    : "/contact";

  return (
    <>
      {/* Page hero */}
      <section className="relative overflow-hidden border-b border-line bg-editorial grain">
        <div className="shell relative z-10 py-16 lg:py-24">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            <p className="eyebrow text-gold-deep">Our story</p>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-[44px] leading-[1.02] tracking-[-0.02em] text-ink sm:text-[64px]">
            Footwear that feels as good as <span className="italic text-gold-deep">it looks.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[14px] leading-[1.85] text-ash">
            Manuella Sole is a premium footwear studio based in Accra. We bring together refined
            silhouettes, honest materials and personal service — so every pair you choose feels
            considered, from the first message to the moment you wear it.
          </p>
        </div>
      </section>

      {/* Story split */}
      <section className="shell py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden bg-cream shadow-editorial">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero.jpg"
                  alt="Black stiletto heels with a gold chain ankle strap, photographed in warm editorial light"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 right-4 bg-ink px-7 py-6 text-ivory shadow-lift sm:right-6">
                <p className="font-display text-[26px] leading-none text-champagne">Est. Accra</p>
                <p className="mt-1.5 text-[9px] uppercase tracking-[0.2em] text-ivory/60">
                  Premium footwear
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="eyebrow text-gold-deep">How we work</p>
            <h2 className="display-2 mt-4 text-ink">
              Considered, never
              <span className="italic text-gold-deep"> complicated.</span>
            </h2>
            <div className="mt-6 space-y-5 text-[13.5px] leading-[1.85] text-ash">
              <p>
                We travel, we sample and we listen. Every style in the collection is chosen because
                it earns its place — the shape has to work, the material has to age well, and the
                finish has to feel right on the foot.
              </p>
              <p>
                We keep the collection tightly edited. Rather than chase every trend, we focus on
                the pairs you will reach for again and again: a heel that carries you through a
                long day, a boot that gets better with wear, a loafer that works with everything.
              </p>
              <p>
                And because fit matters as much as style, every order is handled personally. Send us
                your size and colour on WhatsApp and we will make sure you get the pair that suits
                you best.
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-8 inline-flex h-12 items-center gap-2.5 bg-ink px-7 text-[11px] uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-deep"
            >
              Shop the collection
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-line bg-cream/50">
        <div className="shell py-16 lg:py-20">
          <Reveal>
            <div className="mb-10 max-w-xl">
              <p className="eyebrow text-gold-deep">What we stand for</p>
              <h2 className="display-2 mt-3 text-ink">Three simple promises</h2>
            </div>
          </Reveal>

          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Quality first",
                body: "Materials and construction are chosen to last, not just to look good on the first wear.",
              },
              {
                icon: Footprints,
                title: "Fit and comfort",
                body: "We help you find the right size, the right width and the right pair for the way you move.",
              },
              {
                icon: HandHeart,
                title: "Personal service",
                body: "You order directly with a person, not a checkout. Questions, styling and aftercare included.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06} className="bg-ivory">
                <div className="h-full p-7 sm:p-9">
                  <span className="grid h-11 w-11 place-items-center border border-gold/30 bg-gold-pale text-gold-deep">
                    <item.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-display text-[24px] text-ink">{item.title}</h3>
                  <p className="mt-3 text-[13px] leading-[1.8] text-ash">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink grain">
        <div className="absolute inset-0 bg-editorial opacity-60" aria-hidden="true" />
        <div className="shell relative z-10 py-20 text-center lg:py-24">
          <Reveal>
            <p className="eyebrow text-champagne">Say hello</p>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-[36px] leading-[1.08] text-ivory sm:text-[52px]">
              We would love to help you find <span className="italic text-champagne">your pair.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[13.5px] leading-relaxed text-ivory/55">
              Whether you know exactly what you want or need a little guidance, a message is all it
              takes.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href={waLink}
                target={wa ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex h-[52px] items-center gap-2.5 bg-champagne px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-champagne-pale"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Message on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex h-[52px] items-center border border-ivory/25 px-8 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors hover:border-champagne hover:text-champagne"
              >
                Contact us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
