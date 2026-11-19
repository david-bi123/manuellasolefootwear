"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const gallery = images.length ? images : [{ url: "", alt: `${name} footwear` }];
  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, gallery.length - 1)];

  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream shadow-editorial ring-1 ring-ink/10">
        {current.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.url}
            src={current.url}
            alt={current.alt || `${name} footwear`}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="font-display text-4xl text-line-dark">Manuella</span>
          </div>
        )}
        <span className="pointer-events-none absolute bottom-4 right-4 bg-ivory/90 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-ash backdrop-blur">
          {active + 1} / {gallery.length}
        </span>
      </div>

      {gallery.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {gallery.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-cream ring-1 ring-ink/5 transition-all duration-300",
                index === active
                  ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory"
                  : "opacity-65 hover:opacity-100",
              )}
              aria-label={`View image ${index + 1} of ${gallery.length}`}
              aria-pressed={index === active}
            >
              {image.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
