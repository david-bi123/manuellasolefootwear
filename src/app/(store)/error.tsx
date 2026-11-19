"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console for diagnostics; the shopper sees a calm fallback.
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <div className="shell flex flex-col items-center py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-danger/20 bg-danger/5 text-danger">
        <TriangleAlert className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <p className="eyebrow mt-8 text-gold-deep">Something went wrong</p>
      <h1 className="display-2 mt-3 max-w-xl text-ink">
        We stumbled<span className="italic text-champagne">, briefly.</span>
      </h1>
      <p className="mt-4 max-w-md text-[13.5px] leading-[1.8] text-ash">
        The page could not be loaded. Please try again — if the problem persists, message us on
        WhatsApp and we will help you directly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-sheen inline-flex h-12 items-center gap-2 bg-ink px-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-deep"
        >
          <RotateCcw className="relative z-10 h-4 w-4" aria-hidden="true" />
          <span className="relative z-10">Try again</span>
        </button>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center border border-ink/25 px-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
        >
          Back to the shop
        </Link>
      </div>
    </div>
  );
}
