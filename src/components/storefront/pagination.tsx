import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  basePath,
  params,
}: {
  page: number;
  pages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "page") query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    return `${basePath}${query.toString() ? `?${query.toString()}` : ""}`;
  };

  const windowStart = Math.max(1, Math.min(page - 1, pages - 4));
  const windowEnd = Math.min(pages, windowStart + 4);
  const numbers = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between border-t border-line pt-6">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-ash transition-colors hover:text-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-line">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Previous
        </span>
      )}

      <div className="flex items-center gap-1.5">
        {numbers.map((number) => (
          <Link
            key={number}
            href={href(number)}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              "grid h-10 w-10 place-items-center border text-[12px] tabular-nums transition-colors",
              number === page
                ? "border-ink bg-ink text-ivory"
                : "border-line bg-white text-ash hover:border-ink hover:text-ink",
            )}
          >
            {number}
          </Link>
        ))}
      </div>

      {page < pages ? (
        <Link
          href={href(page + 1)}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-ash transition-colors hover:text-ink"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-line">
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
