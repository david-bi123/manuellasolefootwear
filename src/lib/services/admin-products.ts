import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { InventoryMovement } from "@/lib/models/inventory-movement";
import { Product } from "@/lib/models/product";
import { Sale } from "@/lib/models/sale";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";
import type { ProductInput } from "@/lib/validators";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryName: string;
  gender: string;
  sizingSystem: string;
  image: string;
  priceFrom: number;
  totalStock: number;
  variantCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isArchived: boolean;
  updatedAt: string;
};

async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "product";
  let candidate = base;
  let counter = 2;
  while (
    await Product.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}

async function assertSkuAvailable(sku: string, excludeId?: string) {
  const exists = await Product.exists({
    sku: sku.toUpperCase(),
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (exists) throw new Error(`SKU "${sku.toUpperCase()}" is already used by another product.`);
}

/**
 * Generate a unique, human-readable SKU when the admin leaves the field blank.
 * Format: MS-<CATEGORY>-<ZERO-PADDED SEQUENCE>  e.g. MS-HEE-001.
 */
async function generateSku(categoryName?: string) {
  const base = (categoryName || "GEN")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase() || "GEN";
  const prefix = `MS-${base}-`;

  // Find the highest existing sequence for this prefix so numbers keep climbing.
  const prefixPattern = new RegExp(`^${prefix}`);
  const existing = await Product.find({ sku: prefixPattern })
    .select("sku")
    .lean();

  let max = 0;
  for (const doc of existing as any[]) {
    const seq = Number.parseInt(String(doc.sku).slice(prefix.length), 10);
    if (!Number.isNaN(seq) && seq > max) max = seq;
  }

  let candidate = `${prefix}${String(max + 1).padStart(3, "0")}`;
  while (await Product.exists({ sku: candidate })) {
    max += 1;
    candidate = `${prefix}${String(max + 1).padStart(3, "0")}`;
  }
  return candidate;
}

export async function getAdminProducts(filters: {
  q?: string;
  category?: string;
  gender?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await connectDB();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const query: Record<string, unknown> = {};

  if (filters.q) {
    query.$or = [
      { name: new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      { sku: new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
    ];
  }
  if (filters.category) query.category = filters.category;
  if (filters.gender) query.gender = filters.gender;
  if (filters.status === "published") query.isPublished = true;
  if (filters.status === "draft") query.isPublished = false;
  if (filters.status === "archived") query.isArchived = true;
  if (filters.status === "low") query["variants.stockQuantity"] = { $lte: 3, $gt: 0 };
  if (!filters.status || filters.status !== "archived") query.isArchived = false;

  const [docs, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("category", "name")
      .lean(),
    Product.countDocuments(query),
  ]);

  const items: AdminProductRow[] = (docs as any[]).map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    sku: doc.sku,
    categoryName: doc.category?.name ?? "Uncategorised",
    gender: doc.gender,
    sizingSystem: doc.sizingSystem,
    image: doc.images?.[0]?.url ?? "",
    priceFrom: doc.priceFrom ?? 0,
    totalStock: (doc.variants ?? []).reduce(
      (sum: number, variant: { stockQuantity: number }) => sum + (variant.stockQuantity ?? 0),
      0,
    ),
    variantCount: (doc.variants ?? []).length,
    isPublished: doc.isPublished,
    isFeatured: doc.isFeatured,
    isNewArrival: doc.isNewArrival,
    isArchived: doc.isArchived,
    updatedAt: new Date(doc.updatedAt).toISOString(),
  }));

  return { items, total, page, pages: Math.ceil(total / pageSize), pageSize };
}

export async function getAdminProduct(id: string) {
  await connectDB();
  const doc = await Product.findById(id).populate("category", "name").lean();
  if (!doc) return null;
  const product = doc as any;
  return {
    id: String(product._id),
    name: product.name as string,
    slug: product.slug as string,
    description: product.description as string,
    sku: product.sku as string,
    categoryId: String(product.category?._id ?? product.category),
    categoryName: product.category?.name ?? "",
    gender: product.gender as string,
    sizingSystem: product.sizingSystem as "UK" | "EU",
    images: (product.images ?? []).map((image: any) => ({
      url: image.url,
      publicId: image.publicId ?? "",
      alt: image.alt ?? "",
    })),
    variants: (product.variants ?? []).map((variant: any) => ({
      _id: String(variant._id),
      size: variant.size as string,
      colour: variant.colour as string,
      stockQuantity: variant.stockQuantity as number,
      costPrice: variant.costPrice as number,
      sellingPrice: variant.sellingPrice as number,
      salePrice: (variant.salePrice ?? null) as number | null,
      sku: (variant.sku ?? "") as string,
    })),
    isFeatured: Boolean(product.isFeatured),
    isNewArrival: Boolean(product.isNewArrival),
    isPublished: Boolean(product.isPublished),
    isArchived: Boolean(product.isArchived),
    lowStockThreshold: product.lowStockThreshold ?? 3,
    stats: {
      salesCount: await Sale.countDocuments({ "items.productId": product._id }),
    },
  };
}

export async function createProduct(adminId: string, input: ProductInput) {
  await connectDB();
  const category = await Category.findById(input.categoryId).lean();
  if (!category) throw new Error("Selected category no longer exists.");

  const sku = input.sku && input.sku.trim()
    ? input.sku.trim().toUpperCase()
    : await generateSku(category.name);

  await assertSkuAvailable(sku);
  const slug = await uniqueSlug(input.name);

  const doc = await Product.create({
    name: input.name,
    slug,
    description: input.description,
    sku,
    category: category._id,
    gender: input.gender,
    images: input.images,
    sizingSystem: input.sizingSystem,
    variants: input.variants.map((variant) => ({
      size: variant.size,
      colour: variant.colour,
      stockQuantity: variant.stockQuantity,
      costPrice: variant.costPrice,
      sellingPrice: variant.sellingPrice,
      salePrice: variant.salePrice,
      // Auto-fill variant SKU from the parent when left blank so sale records
      // always reference a stock-keeping unit.
      sku: variant.sku && variant.sku.trim() ? variant.sku.trim() : `${sku}-${variant.size}`,
    })),
    isFeatured: input.isFeatured,
    isNewArrival: input.isNewArrival,
    isPublished: input.isPublished,
    lowStockThreshold: input.lowStockThreshold,
  });

  const movements = (doc.variants as any[])
    .filter((variant) => variant.stockQuantity > 0)
    .map((variant) => ({
      productId: doc._id,
      variantId: variant._id,
      productName: doc.name,
      SKU: doc.sku,
      sizingSystem: doc.sizingSystem,
      size: variant.size,
      colour: variant.colour,
      movementType: "Initial stock",
      previousQuantity: 0,
      quantityChanged: variant.stockQuantity,
      newQuantity: variant.stockQuantity,
      reason: "Product created",
      referenceId: String(doc._id),
      createdBy: adminId,
    }));
  if (movements.length) await InventoryMovement.insertMany(movements);

  return { id: String(doc._id), slug: doc.slug };
}

export async function updateProduct(adminId: string, input: ProductInput) {
  await connectDB();
  if (!input.id) throw new Error("Missing product identifier.");
  const product = await Product.findById(input.id);
  if (!product) throw new Error("Product not found.");

  const category = await Category.findById(input.categoryId).lean();
  if (!category) throw new Error("Selected category no longer exists.");

  // Keep the existing SKU when the admin clears the field; never change a SKU
  // that sales and stock movements already reference.
  const sku = input.sku && input.sku.trim()
    ? input.sku.trim().toUpperCase()
    : product.sku;
  await assertSkuAvailable(sku, input.id);

  if (product.name !== input.name) {
    product.slug = await uniqueSlug(input.name, input.id);
  }

  const previousStock = new Map<string, { qty: number; size: string; colour: string }>();
  for (const variant of product.variants as any[]) {
    previousStock.set(String(variant._id), {
      qty: variant.stockQuantity,
      size: variant.size,
      colour: variant.colour,
    });
  }

  product.name = input.name;
  product.description = input.description;
  product.sku = sku;
  product.category = category._id as any;
  product.gender = input.gender;
  product.images = input.images as any;
  product.sizingSystem = input.sizingSystem;
  product.variants = input.variants.map((variant) => ({
    ...(variant._id ? { _id: variant._id } : {}),
    size: variant.size,
    colour: variant.colour,
    stockQuantity: variant.stockQuantity,
    costPrice: variant.costPrice,
    sellingPrice: variant.sellingPrice,
    salePrice: variant.salePrice,
    sku: variant.sku ?? "",
  })) as any;
  product.isFeatured = input.isFeatured;
  product.isNewArrival = input.isNewArrival;
  product.isPublished = input.isPublished;
  product.lowStockThreshold = input.lowStockThreshold;

  await product.save();

  const movements = (product.variants as any[])
    .map((variant) => {
      const previous = previousStock.get(String(variant._id));
      if (!previous) {
        return variant.stockQuantity > 0
          ? {
              productId: product._id,
              variantId: variant._id,
              productName: product.name,
              SKU: product.sku,
              sizingSystem: product.sizingSystem,
              size: variant.size,
              colour: variant.colour,
              movementType: "Initial stock",
              previousQuantity: 0,
              quantityChanged: variant.stockQuantity,
              newQuantity: variant.stockQuantity,
              reason: "Variant added while editing product",
              referenceId: String(product._id),
              createdBy: adminId,
            }
          : null;
      }
      if (previous.qty === variant.stockQuantity) return null;
      return {
        productId: product._id,
        variantId: variant._id,
        productName: product.name,
        SKU: product.sku,
        sizingSystem: product.sizingSystem,
        size: variant.size,
        colour: variant.colour,
        movementType: "Adjustment",
        previousQuantity: previous.qty,
        quantityChanged: variant.stockQuantity - previous.qty,
        newQuantity: variant.stockQuantity,
        reason: "Stock updated while editing product",
        referenceId: String(product._id),
        createdBy: adminId,
      };
    })
    .filter(Boolean);

  if (movements.length) await InventoryMovement.insertMany(movements);

  return { id: String(product._id), slug: product.slug };
}

export async function setProductFlags(
  id: string,
  flags: { isPublished?: boolean; isFeatured?: boolean; isNewArrival?: boolean; isArchived?: boolean },
) {
  await connectDB();
  const updated = await Product.findByIdAndUpdate(id, { $set: flags }, { new: true });
  if (!updated) throw new Error("Product not found.");
  return { isPublished: updated.isPublished, isArchived: updated.isArchived };
}

export async function deleteProduct(id: string) {
  await connectDB();
  const product = await Product.findById(id).lean();
  if (!product) throw new Error("Product not found.");

  const referenced = await Sale.countDocuments({ "items.productId": id });
  if (referenced > 0) {
    throw new Error(
      "This product appears in recorded sales and cannot be deleted. Archive it instead to keep sales history accurate.",
    );
  }

  const publicIds = (product.images ?? [])
    .map((image: any) => image.publicId)
    .filter(Boolean) as string[];

  await Product.deleteOne({ _id: id });
  await InventoryMovement.deleteMany({ productId: id });

  for (const publicId of publicIds) {
    const stillUsed = await Product.exists({ "images.publicId": publicId });
    if (!stillUsed) await destroyCloudinaryAsset(publicId);
  }

  return { deleted: true };
}

export async function getProductOptions() {
  await connectDB();
  const docs = await Product.find({ isArchived: false })
    .select("name sku sizingSystem variants category images")
    .populate("category", "name")
    .sort({ name: 1 })
    .lean();

  return (docs as any[]).map((doc) => ({
    id: String(doc._id),
    name: doc.name as string,
    sku: doc.sku as string,
    sizingSystem: doc.sizingSystem as string,
    categoryName: doc.category?.name ?? "",
    image: doc.images?.[0]?.url ?? "",
    variants: (doc.variants ?? []).map((variant: any) => ({
      id: String(variant._id),
      size: variant.size as string,
      colour: variant.colour as string,
      stockQuantity: variant.stockQuantity as number,
      sellingPrice: (variant.salePrice ?? variant.sellingPrice) as number,
      listPrice: variant.sellingPrice as number,
      costPrice: variant.costPrice as number,
      sku: (variant.sku ?? "") as string,
    })),
  }));
}
