import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PERMISSIONS, ROLES } from "@/lib/roles";

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "staff", required: true },
    permissions: {
      type: [{ type: String, enum: PERMISSIONS }],
      default: [],
    },
    isActive: { type: Boolean, default: true, index: true },
    invitationStatus: {
      type: String,
      enum: ["active", "pending", "revoked"],
      default: "active",
    },
    invitationTokenHash: { type: String, select: false },
    invitationExpiresAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export type AdminDoc = InferSchemaType<typeof adminSchema> & { _id: string };

export const Admin: Model<InferSchemaType<typeof adminSchema>> =
  models.Admin ?? model("Admin", adminSchema);
