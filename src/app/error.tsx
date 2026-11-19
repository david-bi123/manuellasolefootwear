"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <LogoMark size={52} />
      <span className="mt-8 grid h-14 w-14 place-items-center rounded-2xl border border-danger/20 bg-danger/5 text-danger">
        <TriangleAlert className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-[30px] text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-ash">
        An unexpected error occurred. Please try again — if it persists, contact support.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 inline-flex h-12 items-center gap-2 bg-ink px-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-deep"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
