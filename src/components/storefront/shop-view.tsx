import Link from "next/link";
import { ArrowRight, Footprints, MessageCircle } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ShopToolbar, FilterSidebar, type FilterOptions } from "@/components/storefront/shop-filters";
import { Pagination } from "@/components/storefront/pagination";
import { listProducts, getShopFacets, getCategoriesWithCounts } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function ShopView({
  basePath,
  searchParams,
  title,
  eyebrow,
  description,
  lockedGender,
  lockedCategory,
  newOnly,
  allowCategoryFilter = true,
  allowGenderFilter = true,
}: {
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  title: string;
  eyebrow?: string;
  description?: string;
  lockedGender?: string;
  lockedCategory?: string;
  newOnly?: boolean;
  allowCategoryFilter?: boolean;
  allowGenderFilter?: boolean;
}) {
  const params = {
    q: single(searchParams.q),
    category: lockedCategory ?? single(searchParams.category),
    gender: lockedGender ?? single(searchParams.gender),
    minPrice: single(searchParams.minPrice),
    maxPrice: single(searchParams.maxPrice),
    size: single(searchParams.size),
    colour: single(searchParams.colour),
    sort: single(searchParams.sort),
    page: Number(single(searchParams.page) ?? 1) || 1,
  };

  const [result, facets, categories, settings] = await Promise.all([
    listProducts({
      q: params.q,
      category: params.category,
      gender: params.gender,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      size: params.size,
      colour: params.colour,
      sort: params.sort,
      page: params.page,
      pageSize: 12,
      newOnly,
    }).catch(() => ({ items: [], total: 0, page: 1, pages: 0, pageSize: 12 })),
    getShopFacets().catch(() => ({ sizes: [], colours: [], minPrice: 0, maxPrice: 0 })),
    getCategoriesWithCounts().catch(() => []),
    getSettings(),
  ]);

  const options: FilterOptions = {
    categories: categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      count: category.productCount,
    })),
    sizes: facets.sizes,
    colours: facets.colours,
    minPrice: facets.minPrice,
    maxPrice: facets.maxPrice,
    lockedCategory,
    lockedGender,
  };

  const wa = settings.whatsappNumber;
  const waLink = wa
    ? `https://wa.me/${normaliseWhatsAppNumber(wa)}?text=${encodeURIComponent(
        `Hello ${settings.businessName}! I am looking for a pair and would love some help.`,
      )}`
    : "/contact";

  const queryForPagination = {
    q: params.q,
    category: !lockedCategory ? params.category : undefined,
    gender: !lockedGender ? params.gender : undefined,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    size: params.size,
    colour: params.colour,
    sort: params.sort,
  };

  const hasFilters = Boolean(
    params.q || params.minPrice || params.maxPrice || params.size || params.colour ||
      (!lockedCategory && params.category) || (!lockedGender && params.gender),
  );

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-editorial grain">
        <div className="shell relative z-10 py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-[10px] uppercase tracking-[0.16em] text-ash-light">
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span className="mx-2 text-line-dark">/</span>
            <span className="text-ash">{title}</span>
          </nav>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              {eyebrow ? (
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-gold" aria-hidden="true" />
                  <p className="eyebrow text-gold-deep">{eyebrow}</p>
                </div>
              ) : null}
              <h1 className="mt-4 font-display text-[40px] leading-[1.02] tracking-[-0.02em] text-ink sm:text-[56px]">
                {title}
              </h1>
              {description ? (
                <p className="mt-5 max-w-xl text-[13.5px] leading-[1.85] text-ash">{description}</p>
              ) : null}
            </div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-ash">
              <span className="font-display text-[26px] text-ink tabular-nums">{result.total}</span>{" "}
              {result.total === 1 ? "style" : "styles"} available
            </p>
          </div>
        </div>
      </section>

      {/* Category rail — browse the shop category by category */}
      <div className="shell pb-10 pt-10 lg:pt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-gold-deep">Collections</p>
            <h2 className="mt-2 font-display text-[26px] leading-tight text-ink sm:text-[30px]">
              Browse by category
            </h2>
          </div>
          {categories.length ? (
            <p className="hidden text-[10px] uppercase tracking-[0.16em] text-ash-light sm:block">
              Swipe to explore
            </p>
          ) : null}
        </div>
        <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {categories.map((category) => {
            const active = params.category === category.slug;
            return (
              <Link
                key={category.slug}
                href={`/shop?category=${category.slug}`}
                aria-current={active ? "true" : undefined}
                className="group w-[140px] shrink-0 sm:w-[176px]"
              >
                <div
                  className={
                    "relative aspect-[3/4] overflow-hidden rounded-xl bg-cream shadow-soft ring-1 ring-ink/5 transition-all duration-300 group-hover:shadow-lift " +
                    (active ? "ring-2 ring-champagne-deep" : "")
                  }
                >
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image}
                      alt={`${category.name} collection`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <Footprints className="h-7 w-7 text-line-dark" aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5">
                    <div>
                      <p className="font-display text-[18px] leading-tight text-ivory">
                        {category.name}
                      </p>
                      <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.14em] text-ivory/65">
                        {category.productCount} {category.productCount === 1 ? "style" : "styles"}
                      </p>
                    </div>
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-ivory/40 text-ivory transition-all duration-300 group-hover:border-champagne group-hover:bg-champagne group-hover:text-ink">
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="shell grid gap-10 py-10 lg:grid-cols-[220px_1fr] lg:gap-12 lg:py-14">
        <aside className="hidden lg:block" aria-label="Product filters">
          <FilterSidebar options={options} />
        </aside>

        <div>
          <ShopToolbar options={options} total={result.total} basePath={basePath} />

          {result.items.length ? (
            <>
              <RevealGroup className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 xl:grid-cols-3">
                {result.items.map((product) => (
                  <RevealItem key={product.id}>
                    <ProductCard product={product} />
                  </RevealItem>
                ))}
              </RevealGroup>
              <Pagination
                page={result.page}
                pages={result.pages}
                basePath={basePath}
                params={queryForPagination}
              />
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-line bg-cream/40 px-6 py-16 text-center">
              <Footprints className="mx-auto h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-5 font-display text-2xl text-ink">No pairs match these filters.</p>
              <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ash">
                {hasFilters
                  ? "Try a different size, colour or price range — or tell us what you are looking for and we will help you find it."
                  : "The collection is being updated. Check back shortly or message us on WhatsApp."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={basePath}
                  className="inline-flex h-11 items-center bg-ink px-6 text-[10px] uppercase tracking-[0.14em] text-ivory"
                >
                  View all styles
                </Link>
                <a
                  href={waLink}
                  target={wa ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 border border-ink/25 px-6 text-[10px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          )}

          <div className="mt-14 border-t border-line pt-8">
            <p className="mx-auto max-w-xl text-center text-[11px] leading-relaxed text-ash">
              Prices are in Ghana cedis (GH₵). Sizing follows each product&apos;s stated UK or EU
              system. Orders are finalised personally on WhatsApp — nothing is charged online.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
