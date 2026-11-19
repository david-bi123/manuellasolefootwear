import { Schema, model, models, type Model } from "mongoose";

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter: Model<{ _id: string; seq: number }> =
  models.Counter ?? model("Counter", counterSchema);
