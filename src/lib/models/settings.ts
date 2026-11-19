import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const settingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "primary" },
    businessName: { type: String, default: "Manuella Sole Footwear", trim: true },
    tagline: { type: String, default: "Step Into Your Style.", trim: true },
    whatsappNumber: { type: String, default: "", trim: true },
    businessEmail: { type: String, default: "", trim: true, lowercase: true },
    businessPhone: { type: String, default: "", trim: true },
    businessAddress: { type: String, default: "", trim: true },
    socialMediaLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      x: { type: String, default: "" },
    },
    currency: { type: String, default: "GHS", trim: true },
    announcementText: {
      type: String,
      default: "Complimentary styling advice on WhatsApp — order directly from our collection.",
      trim: true,
    },
    announcementEnabled: { type: Boolean, default: true },
    promoHeading: { type: String, default: "The Art of the Perfect Step", trim: true },
    promoBody: {
      type: String,
      default:
        "Handpicked silhouettes, considered details and materials made to be worn every day. Discover the pair that belongs in your rotation.",
      trim: true,
    },
    promoImage: { type: String, default: "" },
    promoLink: { type: String, default: "/shop" },
    lowStockThreshold: { type: Number, default: 3, min: 0 },
    logoUrl: { type: String, default: "" },
    // ------------------------------------------------------------------
    // Hosting / subscription control (managed by Samtech Labs super admins)
    // ------------------------------------------------------------------
    // "active" serves the storefront normally. "paused" replaces the public
    // site with a "contact the developer to renew hosting" notice and only
    // lets a super admin sign in.
    siteStatus: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
      index: true,
    },
    pausedAt: { type: Date, default: null },
    pausedReason: {
      type: String,
      default: "This website is temporarily unavailable. Please contact the developer to renew hosting.",
      trim: true,
      maxlength: 500,
    },
    // Public contact details shown on the paused screen.
    developerName: { type: String, default: "Samtech Labs", trim: true, maxlength: 120 },
    developerEmail: { type: String, default: "", trim: true, maxlength: 160 },
    developerPhone: { type: String, default: "", trim: true, maxlength: 40 },
    developerWhatsapp: { type: String, default: "", trim: true, maxlength: 20 },
  },
  { timestamps: true },
);

export type SettingsDoc = InferSchemaType<typeof settingsSchema> & { _id: string };

export const BusinessSettings: Model<InferSchemaType<typeof settingsSchema>> =
  models.BusinessSettings ?? model("BusinessSettings", settingsSchema);
