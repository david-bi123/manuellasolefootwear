"use client";

import Link from "next/link";
import { ArrowUpRight, Ruler } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/lib/services/catalog";

export function ProductCard({
  product,
  priority = false,
  className,
  tone = "light",
}: {
  product: ProductCardType;
  priority?: boolean;
  className?: string;
  tone?: "light" | "dark";
}) {
  const soldOut = product.totalStock <= 0;
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : 0;

  return (
    <article className={cn("group relative flex h-full flex-col", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-xl bg-cream shadow-soft ring-1 ring-ink/5 transition-shadow duration-500 group-hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
        aria-label={`View ${product.name}`}
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.imageAlt}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              soldOut ? "opacity-55 saturate-50" : "group-hover:scale-[1.07]",
            )}
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-cream to-sand/60">
            <span className="font-display text-3xl italic text-line-dark">Manuella</span>
          </div>
        )}

        {/* Editorial gradient veil on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-ink/85 px-3 py-1 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-ivory backdrop-blur">
              Sold out
            </span>
          ) : null}
          {product.isNewArrival && !soldOut ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/95 px-3 py-1 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-ink backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-champagne-deep" aria-hidden="true" />
              New
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="rounded-full bg-gold px-3 py-1 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_4px_12px_-4px_rgba(94,21,35,0.7)]">
              −{discount}%
            </span>
          ) : null}
        </div>

        {/* Sizes peek — surfaces on hover so shoppers can scan fit at a glance */}
        <div
          className="pointer-events-none absolute inset-x-3 bottom-3.5 translate-y-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink/70 px-3 py-2 backdrop-blur-md">
            <Ruler className="h-3.5 w-3.5 shrink-0 text-champagne" strokeWidth={1.6} aria-hidden="true" />
            <span className="truncate text-[9px] font-medium uppercase tracking-[0.14em] text-ivory/90">
              {product.sizingSystem} · {product.sizes.slice(0, 6).join(" ")}
              {product.sizes.length > 6 ? " …" : ""}
            </span>
          </div>
        </div>

        {/* Corner arrow affordance */}
        <span className="pointer-events-none absolute right-3.5 top-3.5 grid h-10 w-10 translate-y-2 rotate-[-45deg] place-items-center rounded-full bg-ivory/95 text-ink opacity-0 shadow-lift backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:rotate-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <p
          className={cn(
            "flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em]",
            tone === "dark" ? "text-ivory/45" : "text-ash-light",
          )}
        >
          <span className="inline-block h-px w-4 bg-champagne-deep/70" aria-hidden="true" />
          {product.categoryName || product.gender}
        </p>
        <h3 className="mt-1.5 font-display text-[21px] leading-snug">
          <Link
            href={`/product/${product.slug}`}
            className={cn(
              "link-underline transition-colors",
              tone === "dark" ? "text-ivory hover:text-champagne" : "text-ink hover:text-gold-deep",
            )}
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={cn(
              "text-[14.5px] font-semibold tabular-nums",
              tone === "dark" ? "text-ivory" : "text-ink",
            )}
          >
            {formatMoney(product.price)}
          </span>
          {product.compareAt ? (
            <span
              className={cn(
                "text-[11.5px] tabular-nums line-through decoration-gold/50",
                tone === "dark" ? "text-ivory/40" : "text-ash-light",
              )}
            >
              {formatMoney(product.compareAt)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
