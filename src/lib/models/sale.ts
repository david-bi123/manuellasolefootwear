import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PAYMENT_METHODS, PAYMENT_STATUSES, SALE_STATUSES } from "@/lib/constants";

export { PAYMENT_METHODS, PAYMENT_STATUSES, SALE_STATUSES };

const saleItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    SKU: { type: String, required: true },
    categoryName: { type: String, default: "", index: true },
    sizingSystem: { type: String, enum: ["UK", "EU"], required: true },
    size: { type: String, required: true },
    colour: { type: String, required: true },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    returnedQuantity: { type: Number, default: 0, min: 0 },
    unitSellingPrice: { type: Number, required: true, min: 0 },
    unitCostPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    grossProfit: { type: Number, required: true },
  },
  { _id: true },
);

const saleSchema = new Schema(
  {
    saleReference: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, trim: true, maxlength: 120, default: "" },
    customerPhone: { type: String, trim: true, maxlength: 40, default: "" },
    items: {
      type: [saleItemSchema],
      validate: {
        validator: (items: unknown[]) => Array.isArray(items) && items.length > 0,
        message: "A sale must contain at least one item.",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    grossProfit: { type: Number, required: true },
    grossProfitMargin: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0, min: 0 },
    refundCost: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, required: true, index: true },
    saleStatus: { type: String, enum: SALE_STATUSES, default: "Completed", index: true },
    amountPaid: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: "" },
    saleDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

saleSchema.index({ createdAt: -1 });
saleSchema.index({ customerName: "text", saleReference: "text", customerPhone: "text" });

export type SaleItem = InferSchemaType<typeof saleItemSchema> & { _id: string };
export type SaleDoc = InferSchemaType<typeof saleSchema> & { _id: string };

export const Sale: Model<InferSchemaType<typeof saleSchema>> = models.Sale ?? model("Sale", saleSchema);
