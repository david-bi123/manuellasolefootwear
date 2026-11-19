import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { InventoryMovement } from "@/lib/models/inventory-movement";
import { Product } from "@/lib/models/product";
import { escapeRegExp } from "@/lib/utils";
import type { InventoryAdjustInput } from "@/lib/validators";

export type InventoryRow = {
  productId: string;
  productName: string;
  SKU: string;
  variantId: string;
  variantSku: string;
  sizingSystem: string;
  size: string;
  colour: string;
  stockQuantity: number;
  lowStockThreshold: number;
  costPrice: number;
  sellingPrice: number;
  salePrice: number | null;
  image: string;
  categoryName: string;
  status: "In stock" | "Low stock" | "Out of stock";
};

export type InventoryFilters = {
  q?: string;
  productId?: string;
  size?: string;
  colour?: string;
  status?: "low" | "out" | "in";
  page?: number;
  pageSize?: number;
};

export async function listInventory(filters: InventoryFilters = {}) {
  await connectDB();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 25));

  const productMatch: Record<string, unknown> = { isArchived: false };
  if (filters.productId) productMatch._id = new Types.ObjectId(filters.productId);
  if (filters.q) {
    const rx = new RegExp(escapeRegExp(filters.q), "i");
    productMatch.$or = [{ name: rx }, { sku: rx }];
  }

  const variantMatch: Record<string, unknown> = {};
  if (filters.size) variantMatch.size = filters.size;
  if (filters.colour) variantMatch.colour = new RegExp(`^${escapeRegExp(filters.colour)}$`, "i");
  if (filters.status === "out") variantMatch.stockQuantity = 0;
  if (filters.status === "in") variantMatch.stockQuantity = { $gt: 0 };
  if (filters.status === "low") {
    variantMatch.$expr = {
      $and: [{ $gt: ["$stockQuantity", 0] }, { $lte: ["$stockQuantity", "$lowStockThreshold"] }],
    };
  }

  const pipeline: any[] = [
    { $match: productMatch },
    { $unwind: "$variants" },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDoc",
      },
    },
    {
      $project: {
        productId: { $toString: "$_id" },
        productName: "$name",
        SKU: "$sku",
        variantId: { $toString: "$variants._id" },
        variantSku: { $ifNull: ["$variants.sku", ""] },
        sizingSystem: "$sizingSystem",
        size: "$variants.size",
        colour: "$variants.colour",
        stockQuantity: "$variants.stockQuantity",
        lowStockThreshold: { $ifNull: ["$lowStockThreshold", 3] },
        costPrice: "$variants.costPrice",
        sellingPrice: "$variants.sellingPrice",
        salePrice: "$variants.salePrice",
        image: { $ifNull: [{ $first: "$images.url" }, ""] },
        categoryName: { $ifNull: [{ $first: "$categoryDoc.name" }, "Uncategorised"] },
        sizeValue: { $convert: { input: "$variants.size", to: "double", onError: 0, onNull: 0 } },
        updatedAt: 1,
      },
    },
    { $match: variantMatch },
    { $sort: { productName: 1, colour: 1, sizeValue: 1 } },
    {
      $facet: {
        items: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
        total: [{ $count: "count" }],
      },
    },
  ];

  const [result] = await Product.aggregate(pipeline);
  const items: InventoryRow[] = (result?.items ?? []).map((row: any) => ({
    ...row,
    status:
      row.stockQuantity === 0
        ? "Out of stock"
        : row.stockQuantity <= row.lowStockThreshold
          ? "Low stock"
          : "In stock",
  }));
  const total = result?.total?.[0]?.count ?? 0;

  return { items, total, page, pages: Math.ceil(total / pageSize), pageSize };
}

export async function getInventorySummary() {
  await connectDB();
  const rows = await Product.aggregate([
    { $match: { isArchived: false } },
    { $unwind: "$variants" },
    {
      $group: {
        _id: null,
        totalVariants: { $sum: 1 },
        totalUnits: { $sum: "$variants.stockQuantity" },
        retailValue: {
          $sum: {
            $multiply: [
              "$variants.stockQuantity",
              { $ifNull: ["$variants.salePrice", "$variants.sellingPrice"] },
            ],
          },
        },
        costValue: {
          $sum: { $multiply: ["$variants.stockQuantity", "$variants.costPrice"] },
        },
        lowStock: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: ["$variants.stockQuantity", 0] },
                  { $lte: ["$variants.stockQuantity", { $ifNull: ["$lowStockThreshold", 3] }] },
                ],
              },
              1,
              0,
            ],
          },
        },
        outOfStock: {
          $sum: { $cond: [{ $eq: ["$variants.stockQuantity", 0] }, 1, 0] },
        },
      },
    },
  ]);

  const row = rows[0] ?? {};
  return {
    totalVariants: row.totalVariants ?? 0,
    totalUnits: row.totalUnits ?? 0,
    retailValue: row.retailValue ?? 0,
    costValue: row.costValue ?? 0,
    lowStock: row.lowStock ?? 0,
    outOfStock: row.outOfStock ?? 0,
  };
}

export async function adjustStock(adminId: string, input: InventoryAdjustInput) {
  await connectDB();
  const product = await Product.findOne({ _id: input.productId, "variants._id": input.variantId });
  if (!product) throw new Error("Product variant not found.");

  const variant = (product.variants as any[]).find((v) => String(v._id) === input.variantId);
  if (!variant) throw new Error("Product variant not found.");

  const previous = variant.stockQuantity as number;
  let next: number;
  if (input.mode === "add") next = previous + input.quantity;
  else if (input.mode === "remove") next = previous - input.quantity;
  else next = input.quantity;

  if (next < 0) {
    throw new Error(`Only ${previous} unit(s) available — stock cannot become negative.`);
  }
  if (next === previous) return { changed: false, newQuantity: next };

  const result = await Product.updateOne(
    { _id: input.productId, "variants._id": input.variantId },
    { $set: { "variants.$.stockQuantity": next } },
  );
  if (result.modifiedCount !== 1) throw new Error("Stock update failed. Please try again.");

  await InventoryMovement.create({
    productId: product._id,
    variantId: input.variantId,
    productName: product.name,
    SKU: product.sku,
    sizingSystem: product.sizingSystem,
    size: variant.size,
    colour: variant.colour,
    movementType: input.mode === "add" ? "Restock" : "Adjustment",
    previousQuantity: previous,
    quantityChanged: next - previous,
    newQuantity: next,
    reason: input.reason,
    referenceId: String(product._id),
    createdBy: adminId,
  });

  return { changed: true, newQuantity: next };
}

export async function listMovements(filters: {
  productId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  await connectDB();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const query: Record<string, unknown> = {};
  if (filters.productId) query.productId = filters.productId;
  if (filters.type) query.movementType = filters.type;

  const [docs, total] = await Promise.all([
    InventoryMovement.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("createdBy", "name role")
      .lean(),
    InventoryMovement.countDocuments(query),
  ]);

  return {
    items: (docs as any[]).map((doc) => ({
      id: String(doc._id),
      productName: doc.productName,
      SKU: doc.SKU,
      sizingSystem: doc.sizingSystem,
      size: doc.size,
      colour: doc.colour,
      movementType: doc.movementType,
      previousQuantity: doc.previousQuantity,
      quantityChanged: doc.quantityChanged,
      newQuantity: doc.newQuantity,
      reason: doc.reason,
      referenceId: doc.referenceId,
      createdAt: new Date(doc.createdAt).toISOString(),
      adminName: doc.createdBy?.name ?? "System",
    })),
    total,
    page,
    pages: Math.ceil(total / pageSize),
    pageSize,
  };
}

export async function getLowStockVariants(limit = 8) {
  await connectDB();
  const rows = await Product.aggregate([
    { $match: { isArchived: false } },
    { $unwind: "$variants" },
    {
      $match: {
        $expr: {
          $lte: ["$variants.stockQuantity", { $ifNull: ["$lowStockThreshold", 3] }],
        },
      },
    },
    { $sort: { "variants.stockQuantity": 1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        productId: { $toString: "$_id" },
        productName: "$name",
        size: "$variants.size",
        colour: "$variants.colour",
        sizingSystem: "$sizingSystem",
        stockQuantity: "$variants.stockQuantity",
        threshold: { $ifNull: ["$lowStockThreshold", 3] },
      },
    },
  ]);
  return rows;
}
