import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { GENDERS, SIZING_SYSTEMS } from "@/lib/constants";

export { GENDERS, SIZING_SYSTEMS };
export type SizingSystem = (typeof SIZING_SYSTEMS)[number];

const variantSchema = new Schema(
  {
    size: { type: String, required: true, trim: true, maxlength: 12 },
    colour: { type: String, required: true, trim: true, maxlength: 40 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    costPrice: { type: Number, required: true, min: 0, default: 0 },
    sellingPrice: { type: Number, required: true, min: 0, default: 0 },
    salePrice: { type: Number, min: 0, default: null },
    sku: { type: String, trim: true, maxlength: 60, default: "" },
  },
  { _id: true },
);

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    alt: { type: String, default: "" },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    gender: { type: String, enum: GENDERS, required: true, index: true },
    images: { type: [imageSchema], default: [] },
    sizingSystem: { type: String, enum: SIZING_SYSTEMS, required: true, default: "EU" },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (variants: unknown[]) => Array.isArray(variants) && variants.length > 0,
        message: "At least one size and colour variant is required.",
      },
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    lowStockThreshold: { type: Number, default: 3, min: 0 },
    viewCount: { type: Number, default: 0 },
    /** Denormalised lowest effective selling price, kept in sync on save. */
    priceFrom: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", sku: "text" });
productSchema.index({ isPublished: 1, isArchived: 1, createdAt: -1 });
productSchema.index({ "variants.stockQuantity": 1 });

productSchema.pre("save", function () {
  const prices = (this.variants ?? []).map((variant) =>
    variant.salePrice && variant.salePrice > 0 ? variant.salePrice : variant.sellingPrice,
  );
  this.priceFrom = prices.length ? Math.min(...prices) : 0;
});

productSchema.pre("validate", function () {
  if (Array.isArray(this.variants)) {
    const seen = new Set<string>();
    for (const variant of this.variants) {
      const key = `${String(variant.size).trim().toLowerCase()}::${String(variant.colour)
        .trim()
        .toLowerCase()}`;
      if (seen.has(key)) {
        this.invalidate(
          "variants",
          `Duplicate variant for size ${variant.size} / ${variant.colour}.`,
        );
        break;
      }
      seen.add(key);
    }
  }
});

export type ProductVariant = InferSchemaType<typeof variantSchema> & { _id: string };
export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: string };

export const Product: Model<InferSchemaType<typeof productSchema>> =
  models.Product ?? model("Product", productSchema);
