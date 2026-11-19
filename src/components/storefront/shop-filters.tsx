"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

export type FilterOptions = {
  categories: { name: string; slug: string; count: number }[];
  sizes: string[];
  colours: string[];
  minPrice: number;
  maxPrice: number;
  lockedCategory?: string;
  lockedGender?: string;
};

type Props = {
  options: FilterOptions;
  total: number;
  basePath: string;
};

export function ShopToolbar({ options, total, basePath }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = ["q", "category", "gender", "minPrice", "maxPrice", "size", "colour"].filter(
    (key) => params.get(key),
  ).length;

  function update(key: string, value?: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function clearAll() {
    const next = new URLSearchParams();
    const sort = params.get("sort");
    if (sort) next.set("sort", sort);
    router.push(`${pathname}${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
  }

  const sort = params.get("sort") ?? "newest";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white/60 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-white lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Filters
            {activeCount ? (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-ink text-[9px] text-ivory">
                {activeCount}
              </span>
            ) : null}
          </button>
          <p className="text-[10px] uppercase tracking-[0.14em] text-ash">
            {total} {total === 1 ? "style" : "styles"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeCount ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-[10px] uppercase tracking-[0.12em] text-ash underline underline-offset-4 transition-colors hover:text-ink"
            >
              Clear filters
            </button>
          ) : null}
          <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-ash">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select
              value={sort}
              onChange={(event) => update("sort", event.target.value === "newest" ? undefined : event.target.value)}
              className="h-10 rounded-lg border border-line bg-white/60 pl-3 pr-7 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-champagne/40"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Alphabetical</option>
            </select>
          </label>
        </div>
      </div>

      <ActiveFilters options={options} onRemove={(key) => update(key, undefined)} />

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent title="Filter the collection" className="max-h-[85vh] overflow-y-auto">
          <FilterFields options={options} onApply={() => setMobileOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FilterSidebar({ options }: { options: FilterOptions }) {
  return (
    <div className="sticky top-32 space-y-8">
      <FilterFields options={options} />
    </div>
  );
}

function ActiveFilters({
  options,
  onRemove,
}: {
  options: FilterOptions;
  onRemove: (key: string) => void;
}) {
  const params = useSearchParams();
  const entries: { key: string; label: string }[] = [];

  const q = params.get("q");
  if (q) entries.push({ key: "q", label: `“${q}”` });
  const category = params.get("category");
  if (category) {
    const found = options.categories.find((item) => item.slug === category);
    if (found) entries.push({ key: "category", label: found.name });
  }
  const gender = params.get("gender");
  if (gender) entries.push({ key: "gender", label: gender });
  const size = params.get("size");
  if (size) entries.push({ key: "size", label: `Size ${size}` });
  const colour = params.get("colour");
  if (colour) entries.push({ key: "colour", label: colour });
  const min = params.get("minPrice");
  if (min) entries.push({ key: "minPrice", label: `From ${formatMoney(Number(min))}` });
  const max = params.get("maxPrice");
  if (max) entries.push({ key: "maxPrice", label: `Up to ${formatMoney(Number(max))}` });

  if (!entries.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {entries.map((entry) => (
        <button
          key={entry.key}
          type="button"
          onClick={() => onRemove(entry.key)}
          className="inline-flex items-center gap-1.5 border border-line bg-cream/60 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] text-ash transition-colors hover:border-ink hover:text-ink"
        >
          {entry.label}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function FilterFields({
  options,
  onApply,
}: {
  options: FilterOptions;
  onApply?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");

  function apply(key: string, value?: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function applyPrice() {
    const next = new URLSearchParams(params.toString());
    if (minPrice) next.set("minPrice", minPrice);
    else next.delete("minPrice");
    if (maxPrice) next.set("maxPrice", maxPrice);
    else next.delete("maxPrice");
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const current = (key: string) => params.get(key) ?? "";

  return (
    <div className="space-y-7">
      {!options.lockedCategory ? (
        <FilterGroup legend="Category">
          <div className="space-y-2">
            <FilterRadio
              name="category"
              label="All categories"
              checked={!current("category")}
              onChange={() => apply("category", undefined)}
            />
            {options.categories.map((category) => (
              <FilterRadio
                key={category.slug}
                name="category"
                label={`${category.name} (${category.count})`}
                checked={current("category") === category.slug}
                onChange={() => apply("category", category.slug)}
              />
            ))}
          </div>
        </FilterGroup>
      ) : null}

      {!options.lockedGender ? (
        <FilterGroup legend="Shop for">
          <div className="flex flex-wrap gap-2">
            {["Women", "Men", "Unisex"].map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => apply("gender", current("gender") === gender ? undefined : gender)}
                className={cn(
                  "border px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors",
                  current("gender") === gender
                    ? "border-ink bg-ink text-ivory"
                    : "border-line text-ash hover:border-ink hover:text-ink",
                )}
                aria-pressed={current("gender") === gender}
              >
                {gender}
              </button>
            ))}
          </div>
        </FilterGroup>
      ) : null}

      {options.sizes.length ? (
        <FilterGroup legend="Size">
          <div className="flex flex-wrap gap-1.5">
            {options.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => apply("size", current("size") === size ? undefined : size)}
                className={cn(
                  "grid h-9 min-w-10 place-items-center border px-2 text-[11px] tabular-nums transition-colors",
                  current("size") === size
                    ? "border-ink bg-ink text-ivory"
                    : "border-line text-ash hover:border-ink hover:text-ink",
                )}
                aria-pressed={current("size") === size}
                aria-label={`Size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-ash-light">
            Sizes shown as labelled on each product. UK and EU sizing are not interchangeable.
          </p>
        </FilterGroup>
      ) : null}

      {options.colours.length ? (
        <FilterGroup legend="Colour">
          <div className="space-y-2">
            {options.colours.map((colour) => (
              <FilterRadio
                key={colour}
                name="colour"
                label={colour}
                checked={current("colour") === colour}
                onChange={() =>
                  apply("colour", current("colour") === colour ? undefined : colour)
                }
              />
            ))}
          </div>
        </FilterGroup>
      ) : null}

      <FilterGroup legend="Price (GH₵)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={options.minPrice ? String(Math.floor(options.minPrice)) : "Min"}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="h-10 w-full border border-line bg-transparent px-3 text-xs text-ink placeholder:text-ash-light focus:border-gold focus:outline-none"
            aria-label="Minimum price"
          />
          <span className="text-ash-light" aria-hidden="true">
            —
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={options.maxPrice ? String(Math.ceil(options.maxPrice)) : "Max"}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="h-10 w-full border border-line bg-transparent px-3 text-xs text-ink placeholder:text-ash-light focus:border-gold focus:outline-none"
            aria-label="Maximum price"
          />
        </div>
        <Button size="sm" variant="outline" className="mt-2.5 w-full" onClick={applyPrice}>
          Apply price
        </Button>
      </FilterGroup>

      {onApply ? (
        <Button className="w-full" onClick={onApply}>
          Show results
        </Button>
      ) : null}
    </div>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function FilterRadio({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-ash transition-colors hover:text-ink">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-[#175340]"
      />
      {label}
    </label>
  );
}

export function ClearFiltersLink({ href, className }: { href: string; className?: string }) {
  return (
    <a href={href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), className)}>
      Clear all filters
    </a>
  );
}
