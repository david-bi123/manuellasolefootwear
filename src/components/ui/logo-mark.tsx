import { Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The Manuella Sole brand mark — a champagne-gradient seal with the
 * footprint emblem. Used across the storefront, admin shell and auth screens.
 */
export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-champagne-deep via-champagne to-champagne-pale text-ink shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_4px_12px_-4px_rgba(160,124,62,0.6)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-[2.5px] rounded-full border border-ink/15"
        aria-hidden="true"
      />
      <Footprints
        strokeWidth={1.6}
        style={{ width: size * 0.44, height: size * 0.44 }}
      />
    </span>
  );
}
