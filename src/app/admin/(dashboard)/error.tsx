"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin console error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-danger/20 bg-danger/[0.04] px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-danger/25 bg-white text-danger shadow-sm">
        <TriangleAlert className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-[24px] text-ink">This view failed to load</h2>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ash">
        The data could not be retrieved. Your work is safe — try again, and if the problem keeps
        happening, sign out and back in.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-deep"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
