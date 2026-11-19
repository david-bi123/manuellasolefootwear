import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/format";

export function Pagination({
  page,
  pages,
  total,
  pageSize,
  hrefForPage,
  noun = "results",
}: {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  hrefForPage: (page: number) => string;
  noun?: string;
}) {
  if (pages <= 1) return null;

  // Build a compact window of page numbers around the current page.
  const window: (number | "…")[] = [];
  const push = (value: number | "…") => window.push(value);
  const add = (value: number) => {
    if (value >= 1 && value <= pages) push(value);
  };

  if (pages <= 7) {
    for (let i = 1; i <= pages; i += 1) add(i);
  } else {
    add(1);
    if (page > 3) push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i += 1) add(i);
    if (page < pages - 2) push("…");
    add(pages);
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-[11.5px] text-ash">
        Showing <span className="font-medium text-ink">{formatNumber(from)}–{formatNumber(to)}</span>{" "}
        of {formatNumber(total)} {noun}
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        {page > 1 ? (
          <Link
            href={hrefForPage(page - 1)}
            className="grid h-8 w-8 place-items-center border border-line bg-white text-ink transition-colors hover:border-ink"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="grid h-8 w-8 place-items-center border border-line bg-white text-line-dark">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </span>
        )}

        {window.map((entry, index) =>
          entry === "…" ? (
            <span key={`gap-${index}`} className="px-1.5 text-[12px] text-ash-light">
              …
            </span>
          ) : (
            <Link
              key={entry}
              href={hrefForPage(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={
                entry === page
                  ? "grid h-8 min-w-8 place-items-center bg-ink px-2 text-[12px] font-medium text-ivory"
                  : "grid h-8 min-w-8 place-items-center border border-line bg-white px-2 text-[12px] text-ash transition-colors hover:border-ink hover:text-ink"
              }
            >
              {entry}
            </Link>
          ),
        )}

        {page < pages ? (
          <Link
            href={hrefForPage(page + 1)}
            className="grid h-8 w-8 place-items-center border border-line bg-white text-ink transition-colors hover:border-ink"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="grid h-8 w-8 place-items-center border border-line bg-white text-line-dark">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </nav>
    </div>
  );
}