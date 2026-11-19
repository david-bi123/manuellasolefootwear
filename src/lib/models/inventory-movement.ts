import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { MOVEMENT_TYPES } from "@/lib/constants";

export { MOVEMENT_TYPES };

const movementSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, required: true, index: true },
    productName: { type: String, required: true },
    SKU: { type: String, required: true },
    sizingSystem: { type: String, enum: ["UK", "EU"], required: true },
    size: { type: String, required: true },
    colour: { type: String, required: true },
    movementType: { type: String, enum: MOVEMENT_TYPES, required: true, index: true },
    previousQuantity: { type: Number, required: true, min: 0 },
    quantityChanged: { type: Number, required: true },
    newQuantity: { type: Number, required: true, min: 0 },
    reason: { type: String, default: "", maxlength: 500 },
    referenceId: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true },
);

movementSchema.index({ createdAt: -1 });

export type MovementDoc = InferSchemaType<typeof movementSchema> & { _id: string };

export const InventoryMovement: Model<InferSchemaType<typeof movementSchema>> =
  models.InventoryMovement ?? model("InventoryMovement", movementSchema);
