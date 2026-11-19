"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

export function AnnouncementBar({ text }: { text: string }) {
  const [dismissed, setDismissed] = useState(true);
  const storageKey = `msf-announcement-${text.slice(0, 32)}`;

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  if (!text || dismissed) return null;

  // Repeat the message so the marquee loop is seamless on wide screens.
  const sequence = Array.from({ length: 6 }, () => text);

  return (
    <div className="relative overflow-hidden bg-ink text-ivory">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-ink to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-10 z-10 w-10 bg-gradient-to-l from-ink to-transparent"
        aria-hidden="true"
      />
      <div className="flex overflow-hidden py-2 pr-10" aria-hidden="true">
        <div className="flex shrink-0 animate-marquee items-center whitespace-nowrap">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center">
              {sequence.map((item, index) => (
                <span
                  key={`${half}-${index}`}
                  className="mx-6 flex items-center gap-2.5 text-[9.5px] font-medium uppercase leading-none tracking-[0.22em] text-ivory/85"
                >
                  <Sparkles className="h-3 w-3 text-champagne" strokeWidth={1.5} aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Screen-reader equivalent of the marquee */}
      <p className="sr-only">{text}</p>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          try {
            window.localStorage.setItem(storageKey, "1");
          } catch {
            /* storage unavailable */
          }
        }}
        className="absolute right-2.5 top-1/2 z-20 grid h-6 w-6 -translate-y-1/2 place-items-center text-ivory/55 transition-colors hover:text-champagne"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
