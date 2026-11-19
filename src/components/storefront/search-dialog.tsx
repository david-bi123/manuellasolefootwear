"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function SearchDialog({
  trigger,
  suggestions = [],
}: {
  trigger: React.ReactNode;
  suggestions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function submit(term: string) {
    const q = term.trim();
    setOpen(false);
    setValue("");
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent
        title="Search the collection"
        description="Look for a style, a colour or a category."
        className="max-w-xl"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(value);
          }}
        >
          <div className="flex items-center gap-3 border-b border-ink pb-3">
            <Search className="h-5 w-5 shrink-0 text-ash" aria-hidden="true" />
            <input
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Try “heels”, “loafers”, “Chelsea boots”…"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ash-light"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="grid h-9 w-9 place-items-center rounded-md bg-ink text-ivory transition-colors hover:bg-gold-deep"
              aria-label="Search"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>

        {suggestions.length ? (
          <div className="mt-5">
            <p className="eyebrow text-ash">Popular searches</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => submit(term)}
                  className="rounded-full border border-line bg-cream/50 px-3.5 py-1.5 text-xs text-ash transition-all hover:-translate-y-0.5 hover:border-champagne-deep/40 hover:bg-champagne-pale/50 hover:text-ink"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-6 flex items-center justify-end gap-2 border-t border-line pt-4 text-[10px] uppercase tracking-[0.14em] text-ash-light">
          Press
          <kbd className="rounded border border-line-dark bg-cream px-1.5 py-0.5 font-sans text-[10px] text-ash shadow-[0_1px_0_var(--color-line-dark)]">
            /
          </kbd>
          to search anywhere
        </p>
      </DialogContent>
    </Dialog>
  );
}
