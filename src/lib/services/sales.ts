import mongoose from "mongoose";
import { connectDB, runWithTransaction } from "@/lib/db";
import { Counter } from "@/lib/models/counter";
import { InventoryMovement } from "@/lib/models/inventory-movement";
import { Product } from "@/lib/models/product";
import { Sale, type SaleItem } from "@/lib/models/sale";
import type { SaleInput } from "@/lib/validators";

type PreparedItem = {
  productId: string;
  variantId: string;
  productName: string;
  SKU: string;
  categoryName: string;
  sizingSystem: "UK" | "EU";
  size: string;
  colour: string;
  image: string;
  quantity: number;
  unitSellingPrice: number;
  unitCostPrice: number;
  subtotal: number;
  discount: number;
  totalCost: number;
  grossProfit: number;
  stockAvailable: number;
};

export type SaleListItem = {
  id: string;
  saleReference: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  total: number;
  netTotal: number;
  grossProfit: number;
  paymentMethod: string;
  paymentStatus: string;
  saleStatus: string;
  saleDate: string;
  createdByName: string;
};

async function nextSaleReference(session: mongoose.ClientSession | null, year: number) {
  const counter = await Counter.findOneAndUpdate(
    { _id: `sale-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session: session ?? undefined },
  ).lean();
  return `MS-${year}-${String(counter?.seq ?? 1).padStart(4, "0")}`;
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Records a sale, deducts stock atomically and writes inventory movements.
 * Uses a transaction on replica sets; on standalone MongoDB it compensates
 * manually if any step fails so a sale can never half-consume inventory.
 */
export async function createSale(adminId: string, input: SaleInput) {
  await connectDB();

  const variantIds = input.items.map((item) => item.variantId);
  if (new Set(variantIds).size !== variantIds.length) {
    throw new Error("Each size and colour combination can only appear once per sale.");
  }

  const products = await Product.find({
    _id: { $in: input.items.map((item) => item.productId) },
    isArchived: false,
  })
    .populate("category", "name")
    .lean();

  const prepared: PreparedItem[] = [];

  for (const item of input.items) {
    const product = (products as any[]).find((p) => String(p._id) === item.productId);
    if (!product) throw new Error("One of the selected products no longer exists.");
    const variant = (product.variants ?? []).find(
      (v: any) => String(v._id) === item.variantId,
    );
    if (!variant) throw new Error(`The selected variant of ${product.name} no longer exists.`);

    if (variant.stockQuantity < item.quantity) {
      throw new Error(
        `${product.name} — ${product.sizingSystem} ${variant.size} / ${variant.colour} has only ${variant.stockQuantity} unit(s) in stock.`,
      );
    }

    const unitSellingPrice = variant.salePrice && variant.salePrice > 0 ? variant.salePrice : variant.sellingPrice;
    const subtotal = round(unitSellingPrice * item.quantity);

    prepared.push({
      productId: String(product._id),
      variantId: String(variant._id),
      productName: product.name,
      SKU: product.sku,
      categoryName: product.category?.name ?? "",
      sizingSystem: product.sizingSystem,
      size: variant.size,
      colour: variant.colour,
      image: product.images?.[0]?.url ?? "",
      quantity: item.quantity,
      unitSellingPrice,
      unitCostPrice: variant.costPrice ?? 0,
      subtotal,
      discount: 0,
      totalCost: round((variant.costPrice ?? 0) * item.quantity),
      grossProfit: 0,
      stockAvailable: variant.stockQuantity,
    });
  }

  const subtotal = round(prepared.reduce((sum, item) => sum + item.subtotal, 0));
  const discount = round(Math.min(input.discount ?? 0, subtotal));
  const total = round(subtotal - discount);
  const totalCost = round(prepared.reduce((sum, item) => sum + item.totalCost, 0));

  // Allocate the sale-level discount across items proportionally to subtotal so
  // per-item profit always reconciles with the sale totals.
  for (const item of prepared) {
    const share = subtotal > 0 ? item.discount + round((item.subtotal / subtotal) * discount) : 0;
    item.discount = Math.min(share, item.subtotal);
    item.grossProfit = round(item.subtotal - item.discount - item.totalCost);
  }

  // Correct any rounding drift on the final item so totals add up exactly.
  const drift = round(discount - prepared.reduce((sum, item) => sum + item.discount, 0));
  if (drift !== 0 && prepared.length) {
    const last = prepared[prepared.length - 1];
    last.discount = round(last.discount + drift);
    last.grossProfit = round(last.subtotal - last.discount - last.totalCost);
  }

  const grossProfit = round(total - totalCost);
  const grossProfitMargin = total > 0 ? round((grossProfit / total) * 100) : 0;

  let amountPaid = 0;
  if (input.paymentStatus === "Paid") amountPaid = total;
  else if (input.paymentStatus === "Partially Paid") {
    amountPaid = round(input.amountPaid ?? 0);
    if (amountPaid <= 0 || amountPaid >= total) {
      throw new Error("For a partially paid sale, enter an amount greater than zero and below the total.");
    }
  }

  const saleDate = input.saleDate ? new Date(input.saleDate) : new Date();
  if (Number.isNaN(saleDate.getTime())) throw new Error("Invalid sale date.");
  if (saleDate.getTime() > Date.now() + 86_400_000) {
    throw new Error("The sale date cannot be in the future.");
  }

  const reference = await nextSaleReference(null, saleDate.getFullYear());

  const saleDoc = {
    saleReference: reference,
    customerName: input.customerName ?? "",
    customerPhone: input.customerPhone ?? "",
    items: prepared.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      SKU: item.SKU,
      categoryName: item.categoryName,
      sizingSystem: item.sizingSystem,
      size: item.size,
      colour: item.colour,
      image: item.image,
      quantity: item.quantity,
      returnedQuantity: 0,
      unitSellingPrice: item.unitSellingPrice,
      unitCostPrice: item.unitCostPrice,
      discount: item.discount,
      subtotal: item.subtotal,
      totalCost: item.totalCost,
      grossProfit: item.grossProfit,
    })),
    subtotal,
    discount,
    total,
    totalCost,
    grossProfit,
    grossProfitMargin,
    refundAmount: 0,
    refundCost: 0,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    saleStatus: "Completed" as const,
    amountPaid,
    notes: input.notes ?? "",
    createdBy: adminId,
    saleDate,
  };

  try {
    return await runWithTransaction(async (session) => {
      const decremented: { productId: string; variantId: string; quantity: number }[] = [];

      try {
        for (const item of prepared) {
          const updated = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              variants: {
                $elemMatch: { _id: item.variantId, stockQuantity: { $gte: item.quantity } },
              },
            },
            { $inc: { "variants.$.stockQuantity": -item.quantity } },
            { new: true, session: session ?? undefined },
          ).lean();

          if (!updated) {
            throw new Error(
              `Stock for ${item.productName} (${item.sizingSystem} ${item.size} / ${item.colour}) changed while recording this sale. Please review and try again.`,
            );
          }
          decremented.push({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          });
        }

        const [sale] = await Sale.create([saleDoc], { session: session ?? undefined });

        await InventoryMovement.insertMany(
          prepared.map((item, index) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            SKU: item.SKU,
            sizingSystem: item.sizingSystem,
            size: item.size,
            colour: item.colour,
            movementType: "Sale" as const,
            previousQuantity: item.stockAvailable,
            quantityChanged: -item.quantity,
            newQuantity: item.stockAvailable - item.quantity,
            reason: `Sale ${reference}${index === 0 && (input.customerName ?? "").trim() ? ` — ${input.customerName}` : ""}`,
            referenceId: String(sale._id),
            createdBy: adminId,
          })),
          { session: session ?? undefined },
        );

        return {
          id: String(sale._id),
          saleReference: sale.saleReference,
          total: sale.total,
          grossProfit: sale.grossProfit,
        };
      } catch (error) {
        if (!session) {
          // Standalone fallback: undo any stock already deducted.
          for (const entry of decremented) {
            await Product.updateOne(
              { _id: entry.productId, "variants._id": entry.variantId },
              { $inc: { "variants.$.stockQuantity": entry.quantity } },
            );
          }
        }
        throw error;
      }
    });
  } catch (error) {
    // The counter may have advanced without a sale; references are allowed to skip.
    throw error instanceof Error ? error : new Error("The sale could not be recorded.");
  }
}

export async function listSales(filters: {
  q?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  saleStatus?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  await connectDB();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const query: Record<string, unknown> = {};

  if (filters.q) {
    const rx = new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ saleReference: rx }, { customerName: rx }, { customerPhone: rx }];
  }
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  if (filters.saleStatus) query.saleStatus = filters.saleStatus;
  if (filters.from || filters.to) {
    const range: Record<string, Date> = {};
    if (filters.from) range.$gte = new Date(filters.from);
    if (filters.to) {
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      range.$lte = end;
    }
    query.saleDate = range;
  }

  const [docs, total] = await Promise.all([
    Sale.find(query)
      .sort({ saleDate: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("createdBy", "name")
      .select(
        "saleReference customerName customerPhone items total refundAmount grossProfit refundCost totalCost paymentMethod paymentStatus saleStatus saleDate createdBy",
      )
      .lean(),
    Sale.countDocuments(query),
  ]);

  const items: SaleListItem[] = (docs as any[]).map((doc) => ({
    id: String(doc._id),
    saleReference: doc.saleReference,
    customerName: doc.customerName || "Walk-in customer",
    customerPhone: doc.customerPhone ?? "",
    itemCount: (doc.items ?? []).reduce(
      (sum: number, item: any) => sum + (item.quantity - (item.returnedQuantity ?? 0)),
      0,
    ),
    total: doc.total,
    netTotal: round(doc.total - (doc.refundAmount ?? 0)),
    grossProfit: round(
      doc.total - (doc.refundAmount ?? 0) - (doc.totalCost - (doc.refundCost ?? 0)),
    ),
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    saleStatus: doc.saleStatus,
    saleDate: new Date(doc.saleDate).toISOString(),
    createdByName: doc.createdBy?.name ?? "—",
  }));

  return { items, total, page, pages: Math.ceil(total / pageSize), pageSize };
}

export async function getSale(id: string) {
  await connectDB();
  const doc = await Sale.findById(id)
    .populate("createdBy", "name email")
    .populate("lastModifiedBy", "name email")
    .lean();
  if (!doc) return null;
  const sale = doc as any;
  return {
    id: String(sale._id),
    saleReference: sale.saleReference,
    customerName: sale.customerName ?? "",
    customerPhone: sale.customerPhone ?? "",
    items: (sale.items ?? []).map((item: any) => ({
      id: String(item._id),
      productId: String(item.productId),
      variantId: String(item.variantId),
      productName: item.productName,
      SKU: item.SKU,
      categoryName: item.categoryName ?? "",
      sizingSystem: item.sizingSystem,
      size: item.size,
      colour: item.colour,
      image: item.image ?? "",
      quantity: item.quantity,
      returnedQuantity: item.returnedQuantity ?? 0,
      unitSellingPrice: item.unitSellingPrice,
      unitCostPrice: item.unitCostPrice,
      discount: item.discount ?? 0,
      subtotal: item.subtotal,
      totalCost: item.totalCost,
      grossProfit: item.grossProfit,
    })),
    subtotal: sale.subtotal,
    discount: sale.discount,
    total: sale.total,
    totalCost: sale.totalCost,
    grossProfit: sale.grossProfit,
    grossProfitMargin: sale.grossProfitMargin,
    refundAmount: sale.refundAmount ?? 0,
    refundCost: sale.refundCost ?? 0,
    paymentMethod: sale.paymentMethod,
    paymentStatus: sale.paymentStatus,
    saleStatus: sale.saleStatus,
    amountPaid: sale.amountPaid ?? 0,
    notes: sale.notes ?? "",
    saleDate: new Date(sale.saleDate).toISOString(),
    createdAt: new Date(sale.createdAt).toISOString(),
    cancelledAt: sale.cancelledAt ? new Date(sale.cancelledAt).toISOString() : null,
    cancellationReason: sale.cancellationReason ?? "",
    createdByName: sale.createdBy?.name ?? "—",
    createdByEmail: sale.createdBy?.email ?? "",
  };
}

export type SaleDetail = NonNullable<Awaited<ReturnType<typeof getSale>>>;

export async function cancelSale(adminId: string, saleId: string, reason: string) {
  await connectDB();
  return runWithTransaction(async (session) => {
    const sale = await Sale.findById(saleId).session(session ?? null).lean();
    if (!sale) throw new Error("Sale not found.");
    if (sale.saleStatus === "Cancelled") throw new Error("This sale is already cancelled.");
    if (sale.saleStatus === "Returned") {
      throw new Error("Every item on this sale has already been returned.");
    }

    const cancelled = await Sale.findOneAndUpdate(
      { _id: saleId, saleStatus: { $in: ["Completed", "Partially Returned"] } },
      {
        $set: {
          saleStatus: "Cancelled",
          cancelledAt: new Date(),
          cancellationReason: reason,
          lastModifiedBy: adminId,
        },
      },
      { new: true, session: session ?? undefined },
    );
    if (!cancelled) throw new Error("This sale can no longer be cancelled.");

    const restorations = (sale.items as any[])
      .map((item) => ({
        item,
        remaining: item.quantity - (item.returnedQuantity ?? 0),
      }))
      .filter((entry) => entry.remaining > 0);

    for (const { item, remaining } of restorations) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.stockQuantity": remaining } },
        { new: true, session: session ?? undefined },
      ).lean();
      const updatedVariant = (updated?.variants as any[])?.find(
        (variant) => String(variant._id) === String(item.variantId),
      );
      if (!updated) {
        throw new Error(
          `Could not restore stock for ${item.productName} — the product or variant no longer exists.`,
        );
      }
      await InventoryMovement.create(
        [
          {
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            SKU: item.SKU,
            sizingSystem: item.sizingSystem,
            size: item.size,
            colour: item.colour,
            movementType: "Cancellation",
            previousQuantity: (updatedVariant?.stockQuantity ?? 0) - remaining,
            quantityChanged: remaining,
            newQuantity: updatedVariant?.stockQuantity ?? remaining,
            reason: `Sale ${sale.saleReference} cancelled — ${reason}`,
            referenceId: String(sale._id),
            createdBy: adminId,
          },
        ],
        { session: session ?? undefined },
      );
    }

    return { cancelled: true };
  });
}

export async function returnSaleItems(
  adminId: string,
  saleId: string,
  returns: { itemId: string; quantity: number }[],
  reason: string,
) {
  await connectDB();
  return runWithTransaction(async (session) => {
    const sale = await Sale.findById(saleId).session(session ?? null).lean();
    if (!sale) throw new Error("Sale not found.");
    if (sale.saleStatus === "Cancelled") throw new Error("Cancelled sales cannot be returned.");
    if (sale.saleStatus === "Returned") throw new Error("Every item on this sale has already been returned.");

    const updatedItems = (sale.items as any[]).map((item) => ({ ...item }));

    for (const entry of returns) {
      const item = updatedItems.find((candidate) => String(candidate._id) === entry.itemId);
      if (!item) throw new Error("A selected item does not belong to this sale.");
      const remaining = item.quantity - (item.returnedQuantity ?? 0);
      if (entry.quantity > remaining) {
        throw new Error(
          `Only ${remaining} unit(s) of ${item.productName} (${item.size}/${item.colour}) can still be returned.`,
        );
      }
      if (entry.quantity === 0) continue;

      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.stockQuantity": entry.quantity } },
        { new: true, session: session ?? undefined },
      ).lean();
      if (!updated) {
        throw new Error(
          `${item.productName} (${item.size}/${item.colour}) no longer exists, so stock cannot be restored.`,
        );
      }
      const updatedVariant = (updated.variants as any[]).find(
        (variant) => String(variant._id) === String(item.variantId),
      );

      await InventoryMovement.create(
        [
          {
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            SKU: item.SKU,
            sizingSystem: item.sizingSystem,
            size: item.size,
            colour: item.colour,
            movementType: "Return",
            previousQuantity: (updatedVariant?.stockQuantity ?? entry.quantity) - entry.quantity,
            quantityChanged: entry.quantity,
            newQuantity: updatedVariant?.stockQuantity ?? entry.quantity,
            reason: `Return on ${sale.saleReference} — ${reason}`,
            referenceId: String(sale._id),
            createdBy: adminId,
          },
        ],
        { session: session ?? undefined },
      );

      item.returnedQuantity = (item.returnedQuantity ?? 0) + entry.quantity;
    }

    const refundAmount = round(
      updatedItems.reduce((sum, item) => {
        const perUnitDiscount = item.quantity > 0 ? item.discount / item.quantity : 0;
        return sum + (item.returnedQuantity ?? 0) * (item.unitSellingPrice - perUnitDiscount);
      }, 0),
    );
    const refundCost = round(
      updatedItems.reduce(
        (sum, item) => sum + (item.returnedQuantity ?? 0) * item.unitCostPrice,
        0,
      ),
    );
    const allReturned = updatedItems.every((item) => item.returnedQuantity >= item.quantity);
    const anyReturned = updatedItems.some((item) => (item.returnedQuantity ?? 0) > 0);

    await Sale.updateOne(
      { _id: saleId },
      {
        $set: {
          items: updatedItems,
          refundAmount,
          refundCost,
          saleStatus: allReturned ? "Returned" : anyReturned ? "Partially Returned" : "Completed",
          lastModifiedBy: adminId,
        },
      },
      { session: session ?? undefined },
    );

    return { refundAmount, refundCost, allReturned };
  });
}

export async function updatePaymentStatus(
  adminId: string,
  saleId: string,
  paymentStatus: "Paid" | "Partially Paid" | "Pending",
  amountPaid?: number,
) {
  await connectDB();
  const sale = await Sale.findById(saleId).lean();
  if (!sale) throw new Error("Sale not found.");
  if (sale.saleStatus === "Cancelled") throw new Error("Cancelled sales cannot be updated.");

  const net = round(sale.total - (sale.refundAmount ?? 0));
  let paid = amountPaid ?? sale.amountPaid ?? 0;
  if (paymentStatus === "Paid") paid = net;
  if (paymentStatus === "Pending") paid = 0;
  if (paymentStatus === "Partially Paid" && (paid <= 0 || paid >= net)) {
    throw new Error("Enter an amount greater than zero and lower than the outstanding total.");
  }

  await Sale.updateOne(
    { _id: saleId },
    { $set: { paymentStatus, amountPaid: round(paid), lastModifiedBy: adminId } },
  );
  return { updated: true };
}

export type SaleItemSnapshot = SaleItem;
