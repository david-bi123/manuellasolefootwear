import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { Product } from "@/lib/models/product";
import { escapeRegExp } from "@/lib/utils";

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  image: string;
  imageAlt: string;
  categoryName: string;
  categorySlug: string;
  gender: string;
  isNewArrival: boolean;
  isFeatured: boolean;
  sizingSystem: string;
  sizes: string[];
  colours: string[];
  totalStock: number;
};

export type ProductDetail = ProductCard & {
  description: string;
  sku: string;
  images: { url: string; alt: string }[];
  variants: {
    id: string;
    size: string;
    colour: string;
    stockQuantity: number;
    price: number;
    compareAt: number | null;
    sku: string;
  }[];
  lowStockThreshold: number;
};

export type ShopFilters = {
  q?: string;
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  colour?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  newOnly?: boolean;
};

function effectivePrice(variant: { salePrice?: number | null; sellingPrice: number }) {
  return variant.salePrice && variant.salePrice > 0 ? variant.salePrice : variant.sellingPrice;
}

type LeanProduct = {
  _id: unknown;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  images?: { url: string; alt?: string }[];
  variants?: {
    _id: unknown;
    size: string;
    colour: string;
    stockQuantity: number;
    sellingPrice: number;
    salePrice?: number | null;
    sku?: string;
  }[];
  category?: { name?: string; slug?: string } | unknown;
  gender: string;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  sizingSystem: string;
  lowStockThreshold?: number;
  priceFrom?: number;
};

function categoryOf(value: LeanProduct["category"]): { name: string; slug: string } {
  if (value && typeof value === "object" && "name" in value) {
    return { name: String(value.name ?? ""), slug: String((value as { slug?: string }).slug ?? "") };
  }
  return { name: "", slug: "" };
}

export function toCard(product: LeanProduct): ProductCard {
  const variants = product.variants ?? [];
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colours = [...new Set(variants.map((v) => v.colour))];
  const firstWithStock = variants.find((v) => v.stockQuantity > 0) ?? variants[0];
  const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0);
  const cheapest = variants.length
    ? variants.reduce((min, v) => (effectivePrice(v) < effectivePrice(min) ? v : min), variants[0])
    : undefined;
  const category = categoryOf(product.category);
  const price = product.priceFrom ?? (cheapest ? effectivePrice(cheapest) : 0);
  const compareAt = cheapest && cheapest.salePrice && cheapest.salePrice > 0 ? cheapest.sellingPrice : null;

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    price,
    compareAt,
    image: product.images?.[0]?.url ?? "",
    imageAlt: product.images?.[0]?.alt || `${product.name} footwear`,
    categoryName: category.name,
    categorySlug: category.slug,
    gender: product.gender,
    isNewArrival: Boolean(product.isNewArrival),
    isFeatured: Boolean(product.isFeatured),
    sizingSystem: product.sizingSystem,
    sizes,
    colours,
    totalStock,
  };
}

const POPULATE = { path: "category", select: "name slug" };

export async function listProducts(filters: ShopFilters = {}) {
  await connectDB();

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 12));
  const query: Record<string, unknown> = { isPublished: true, isArchived: false };

  if (filters.q) {
    const rx = new RegExp(escapeRegExp(filters.q), "i");
    query.$or = [{ name: rx }, { sku: rx }, { description: rx }];
  }
  if (filters.gender && ["Men", "Women", "Unisex"].includes(filters.gender)) {
    query.gender = filters.gender === "Unisex" ? "Unisex" : { $in: [filters.gender, "Unisex"] };
  }
  if (filters.category) {
    const category = await Category.findOne({ slug: filters.category, isActive: true }).select("_id").lean();
    if (!category) return { items: [] as ProductCard[], total: 0, page, pages: 0, pageSize };
    query.category = category._id;
  }
  if (filters.newOnly) query.isNewArrival = true;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const range: Record<string, number> = {};
    if (filters.minPrice !== undefined) range.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) range.$lte = filters.maxPrice;
    query.priceFrom = range;
  }

  if (filters.size || filters.colour) {
    const elem: Record<string, unknown> = { stockQuantity: { $gt: 0 } };
    if (filters.size) elem.size = filters.size;
    if (filters.colour) elem.colour = new RegExp(`^${escapeRegExp(filters.colour)}$`, "i");
    query.variants = { $elemMatch: elem };
  } else {
    query["variants.stockQuantity"] = { $gt: 0 };
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  switch (filters.sort) {
    case "price-asc":
      sort = { priceFrom: 1 };
      break;
    case "price-desc":
      sort = { priceFrom: -1 };
      break;
    case "oldest":
      sort = { createdAt: 1 };
      break;
    case "name":
      sort = { name: 1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const [docs, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate(POPULATE)
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    items: (docs as unknown as LeanProduct[]).map(toCard),
    total,
    page,
    pages: Math.ceil(total / pageSize),
    pageSize,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  await connectDB();
  const doc = await Product.findOne({ slug, isPublished: true, isArchived: false })
    .populate(POPULATE)
    .lean();
  if (!doc) return null;

  const product = doc as unknown as LeanProduct;
  const card = toCard(product);

  return {
    ...card,
    description: product.description ?? "",
    sku: product.sku,
    images: (product.images ?? []).map((image) => ({
      url: image.url,
      alt: image.alt || `${product.name} footwear`,
    })),
    variants: (product.variants ?? []).map((variant) => ({
      id: String(variant._id),
      size: variant.size,
      colour: variant.colour,
      stockQuantity: variant.stockQuantity,
      price: effectivePrice(variant),
      compareAt:
        variant.salePrice && variant.salePrice > 0 && variant.salePrice < variant.sellingPrice
          ? variant.sellingPrice
          : null,
      sku: variant.sku ?? "",
    })),
    lowStockThreshold: product.lowStockThreshold ?? 3,
  };
}

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 4) {
  await connectDB();
  const category = await Category.findOne({ slug: categorySlug }).select("_id").lean();
  if (!category) return [];
  const docs = await Product.find({
    _id: { $ne: excludeId },
    category: category._id,
    isPublished: true,
    isArchived: false,
    "variants.stockQuantity": { $gt: 0 },
  })
    .limit(limit)
    .populate(POPULATE)
    .lean();
  return (docs as unknown as LeanProduct[]).map(toCard);
}

export async function getFeaturedProducts(limit = 4) {
  await connectDB();
  const docs = await Product.find({
    isFeatured: true,
    isPublished: true,
    isArchived: false,
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate(POPULATE)
    .lean();
  if (docs.length) return (docs as unknown as LeanProduct[]).map(toCard);
  const fallback = await Product.find({ isPublished: true, isArchived: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate(POPULATE)
    .lean();
  return (fallback as unknown as LeanProduct[]).map(toCard);
}

export async function getNewArrivals(limit = 8) {
  await connectDB();
  const docs = await Product.find({ isPublished: true, isArchived: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate(POPULATE)
    .lean();
  return (docs as unknown as LeanProduct[]).map(toCard);
}

export async function getActiveCategories() {
  await connectDB();
  return Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
}

export async function getCategoriesWithCounts() {
  await connectDB();
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { isPublished: true, isArchived: false } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((entry) => [String(entry._id), entry.count as number]));
  return categories.map((category) => ({
    ...category,
    _id: String(category._id),
    productCount: map.get(String(category._id)) ?? 0,
  }));
}

/** Sizes and colours available in the published catalogue, used by shop filters. */
export async function getShopFacets() {
  await connectDB();
  const rows = await Product.aggregate<{
    _id: null;
    sizes: string[];
    colours: string[];
    min: number;
    max: number;
  }>([
    { $match: { isPublished: true, isArchived: false } },
    { $unwind: "$variants" },
    { $match: { "variants.stockQuantity": { $gt: 0 } } },
    {
      $group: {
        _id: null,
        sizes: { $addToSet: "$variants.size" },
        colours: { $addToSet: "$variants.colour" },
        min: { $min: "$priceFrom" },
        max: { $max: "$priceFrom" },
      },
    },
  ]);

  const facet = rows[0];
  const sortSizes = (values: string[]) =>
    [...values].sort((a, b) => {
      const na = Number(a.replace(/[^\d.]/g, ""));
      const nb = Number(b.replace(/[^\d.]/g, ""));
      if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return na - nb;
      return a.localeCompare(b);
    });

  return {
    sizes: sortSizes(facet?.sizes ?? []),
    colours: (facet?.colours ?? []).sort((a, b) => a.localeCompare(b)),
    minPrice: facet?.min ?? 0,
    maxPrice: facet?.max ?? 0,
  };
}

export async function getPublishedProductCount() {
  await connectDB();
  return Product.countDocuments({ isPublished: true, isArchived: false });
}

export async function getStorefrontSitemapProducts() {
  await connectDB();
  return Product.find({ isPublished: true, isArchived: false })
    .select("slug updatedAt")
    .sort({ updatedAt: -1 })
    .limit(2000)
    .lean();
}
