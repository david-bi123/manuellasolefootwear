import Link from "next/link";
import type { Metadata } from "next";
import { Footprints } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ivory">
      {/* Ambient editorial backdrop */}
      <div className="bg-halo pointer-events-none absolute -right-32 top-16 h-96 w-96" aria-hidden="true" />
      <div className="bg-halo pointer-events-none absolute -left-32 bottom-16 h-96 w-96 opacity-60" aria-hidden="true" />

      <header className="relative border-b border-line/80">
        <div className="shell flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-ink">
            <LogoMark size={34} />
            <span className="font-display text-[19px] leading-none tracking-[0.2em]">MANUELLA</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ash transition-colors hover:border-line-dark hover:text-ink"
          >
            Shop
          </Link>
        </div>
      </header>

      <main className="shell relative flex flex-1 flex-col items-center justify-center py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-champagne/40 bg-gradient-to-b from-champagne-pale to-cream text-gold-deep shadow-[0_8px_24px_-12px_rgba(160,124,62,0.5)]">
          <Footprints className="h-7 w-7" strokeWidth={1.4} aria-hidden="true" />
        </span>
        <p className="eyebrow mt-8 text-champagne-deep">Error 404</p>
        <h1 className="display-1 mt-4 max-w-2xl text-ink">
          This step
          <br />
          <span className="italic text-champagne">does not exist.</span>
        </h1>
        <p className="mt-6 max-w-md text-[13px] leading-[1.8] text-ash">
          The page may have moved, or the pair you were looking for has sold out. Explore the
          collection, or message us and we will point you in the right direction.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="btn-sheen inline-flex h-12 items-center bg-ink px-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-deep"
          >
            <span className="relative z-10">Browse the collection</span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center border border-ink/25 bg-white/50 px-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink backdrop-blur transition-colors hover:border-ink"
          >
            Return home
          </Link>
        </div>

        <div className="mt-16 grid w-full max-w-2xl gap-px overflow-hidden rounded-xl border border-line bg-line shadow-soft sm:grid-cols-3">
          {[
            { label: "Shop all", href: "/shop" },
            { label: "New arrivals", href: "/new-arrivals" },
            { label: "Contact", href: "/contact" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-ivory px-4 py-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ash transition-colors hover:bg-cream hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
