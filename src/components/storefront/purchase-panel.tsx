"use client";

import { useMemo, useState } from "react";
import { Check, MessageCircle, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export type PanelVariant = {
  id: string;
  size: string;
  colour: string;
  stockQuantity: number;
  price: number;
  compareAt: number | null;
  sku: string;
};

export function PurchasePanel({
  productName,
  slug,
  variants,
  sizingSystem,
  fallbackPrice,
  businessName,
  whatsappNumber,
  siteUrl,
  lowStockThreshold,
}: {
  productName: string;
  slug: string;
  variants: PanelVariant[];
  sizingSystem: string;
  fallbackPrice: number;
  businessName: string;
  whatsappNumber: string;
  siteUrl: string;
  lowStockThreshold: number;
}) {
  const colours = useMemo(
    () => [...new Set(variants.map((variant) => variant.colour))],
    [variants],
  );

  const firstAvailable = variants.find((variant) => variant.stockQuantity > 0) ?? variants[0];
  const [colour, setColour] = useState(firstAvailable?.colour ?? "");
  const [quantity, setQuantity] = useState(1);

  const sizesForColour = useMemo(
    () => variants.filter((variant) => variant.colour === colour),
    [variants, colour],
  );

  const [size, setSize] = useState(() => {
    const available = sizesForColour.find((variant) => variant.stockQuantity > 0);
    return (available ?? sizesForColour[0])?.size ?? "";
  });

  const selected =
    variants.find((variant) => variant.colour === colour && variant.size === size) ?? null;

  const maxQuantity = Math.max(1, Math.min(selected?.stockQuantity ?? 1, 10));
  const inStock = Boolean(selected && selected.stockQuantity > 0);
  const lowStock = Boolean(
    selected && selected.stockQuantity > 0 && selected.stockQuantity <= lowStockThreshold,
  );

  function chooseColour(next: string) {
    setColour(next);
    setQuantity(1);
    const options = variants.filter((variant) => variant.colour === next);
    const available = options.find((variant) => variant.stockQuantity > 0) ?? options[0];
    setSize(available?.size ?? "");
  }

  const price = selected?.price ?? fallbackPrice;
  const compareAt = selected?.compareAt ?? null;

  const href = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        buildOrderMessage({
          businessName,
          productName,
          price,
          size: size || "—",
          sizingSystem,
          colour,
          quantity,
          productUrl: `${siteUrl.replace(/\/$/, "")}/product/${slug}`,
          sku: selected?.sku || undefined,
        }),
      )
    : "/contact";

  return (
    <div className="space-y-7">
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-display text-[38px] leading-none tabular-nums text-ink">
            {formatMoney(price)}
          </span>
          {compareAt ? (
            <>
              <span className="text-[15px] tabular-nums text-ash-light line-through">
                {formatMoney(compareAt)}
              </span>
              <span className="rounded-full bg-gold-pale px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                Save {formatMoney(compareAt - price)}
              </span>
            </>
          ) : null}
        </div>
        <p className="mt-2.5 text-[11px] uppercase tracking-[0.14em] text-ash-light">
          {selected?.sku ? `SKU ${selected.sku}` : `Style ${slug}`} · {sizingSystem} sizing
        </p>
      </div>

      {colours.length > 1 ? (
        <fieldset>
          <legend className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
            Colour
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {colours.map((option) => {
              const available = variants.some(
                (variant) => variant.colour === option && variant.stockQuantity > 0,
              );
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseColour(option)}
                  aria-pressed={colour === option}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[11px] tracking-[0.04em] transition-all duration-200",
                    colour === option
                      ? "border-ink bg-ink text-ivory shadow-[0_4px_12px_-6px_rgba(18,25,22,0.5)]"
                      : "border-line text-ash hover:border-ink hover:text-ink",
                    !available && colour !== option && "opacity-45",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">Colour</p>
          <p className="mt-2 text-[13px] text-ash">{colour}</p>
        </div>
      )}

      <fieldset>
        <div className="flex items-baseline justify-between">
          <legend className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
            Size ({sizingSystem})
          </legend>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-ash-light">
            {inStock ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                {selected?.stockQuantity} in stock
              </>
            ) : (
              "Select a size"
            )}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {sizesForColour.map((variant) => {
            const soldOut = variant.stockQuantity <= 0;
            return (
              <button
                key={variant.id}
                type="button"
                disabled={soldOut}
                onClick={() => {
                  setSize(variant.size);
                  setQuantity(1);
                }}
                aria-pressed={size === variant.size}
                aria-label={`${sizingSystem} ${variant.size}${soldOut ? " — sold out" : ""}`}
                className={cn(
                  "relative grid h-11 place-items-center rounded-lg border text-[12px] tabular-nums transition-all duration-200",
                  size === variant.size
                    ? "border-ink bg-ink text-ivory shadow-[0_4px_12px_-6px_rgba(18,25,22,0.5)]"
                    : "border-line text-ash hover:border-ink hover:text-ink",
                  soldOut &&
                    "cursor-not-allowed border-line/70 text-ash-light/70 line-through hover:border-line/70 hover:text-ash-light/70",
                )}
              >
                {variant.size}
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-[10.5px] leading-relaxed text-ash-light">
          UK and EU sizes are not interchangeable. Choose the system shown above.
        </p>
      </fieldset>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">Quantity</span>
        <div className="flex items-center border border-line">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            className="grid h-10 w-10 place-items-center text-ink transition-colors hover:bg-cream disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="w-10 text-center text-[13px] tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
            disabled={quantity >= maxQuantity}
            className="grid h-10 w-10 place-items-center text-ink transition-colors hover:bg-cream disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {lowStock ? (
        <p className="rounded-lg border border-warning/25 bg-warning/5 px-3 py-2 text-[11px] leading-relaxed text-warning">
          Only {selected?.stockQuantity} left in {sizingSystem} {size} — availability is confirmed
          personally before dispatch.
        </p>
      ) : null}

      <div className="space-y-2.5">
        {inStock ? (
          <a
            href={href}
            target={whatsappNumber ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="btn-sheen group flex h-[58px] w-full items-center justify-center gap-2.5 bg-ink px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold-deep"
          >
            <MessageCircle className="relative z-10 h-4 w-4" aria-hidden="true" />
            <span className="relative z-10">Order on WhatsApp</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-[58px] w-full cursor-not-allowed items-center justify-center bg-line px-6 text-[11px] uppercase tracking-[0.2em] text-ash"
          >
            Sold out — message us for the next drop
          </button>
        )}

        <a
          href={href}
          target={whatsappNumber ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 border border-ink/25 px-6 text-[10px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
        >
          Ask a question about this pair
        </a>

        <p className="pt-1 text-center text-[10.5px] leading-relaxed text-ash-light">
          This opens a WhatsApp message — it does not place an order or take payment. We confirm
          availability, delivery and payment with you personally.
        </p>
      </div>

      <ul className="space-y-3 border-t border-line pt-5 text-[12px] text-ash">
        <li className="flex items-start gap-2.5">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden="true" />
          Personal styling and sizing advice before you commit.
        </li>
        <li className="flex items-start gap-2.5">
          <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden="true" />
          Delivery arranged and confirmed on WhatsApp, nationwide.
        </li>
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-deep" aria-hidden="true" />
          Every pair checked by hand before it leaves us.
        </li>
      </ul>
    </div>
  );
}
