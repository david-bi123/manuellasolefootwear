import { cache } from "react";
import { connectDB } from "@/lib/db";
import { BusinessSettings } from "@/lib/models/settings";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

export type StoreSettings = {
  businessName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappRaw: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  socialMediaLinks: { instagram: string; facebook: string; tiktok: string; x: string };
  currency: string;
  announcementText: string;
  announcementEnabled: boolean;
  promoHeading: string;
  promoBody: string;
  promoImage: string;
  promoLink: string;
  lowStockThreshold: number;
  logoUrl: string;
  siteStatus: "active" | "paused";
  pausedReason: string;
  developerName: string;
  developerEmail: string;
  developerPhone: string;
  developerWhatsapp: string;
};

const FALLBACK: StoreSettings = {
  businessName: "Manuella Sole Footwear",
  tagline: "Step Into Your Style.",
  whatsappNumber: "",
  whatsappRaw: "",
  businessEmail: "",
  businessPhone: "",
  businessAddress: "",
  socialMediaLinks: { instagram: "", facebook: "", tiktok: "", x: "" },
  currency: "GHS",
  announcementText: "Complimentary styling advice on WhatsApp — order directly from our collection.",
  announcementEnabled: true,
  promoHeading: "The Art of the Perfect Step",
  promoBody:
    "Handpicked silhouettes, considered details and materials made to be worn every day. Discover the pair that belongs in your rotation.",
  promoImage: "",
  promoLink: "/shop",
  lowStockThreshold: 3,
  logoUrl: "",
  siteStatus: "active",
  pausedReason:
    "This website is temporarily unavailable. Please contact the developer to renew hosting.",
  developerName: "Samtech Labs",
  developerEmail: "",
  developerPhone: "",
  developerWhatsapp: "",
};

function toStoreSettings(doc: Record<string, unknown> | null): StoreSettings {
  if (!doc) {
    const raw = process.env.WHATSAPP_NUMBER ?? "";
    return {
      ...FALLBACK,
      whatsappRaw: normaliseWhatsAppNumber(raw),
      whatsappNumber: normaliseWhatsAppNumber(raw),
    };
  }

  const raw = String(doc.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? "");
  const social = (doc.socialMediaLinks ?? {}) as Record<string, string>;

  return {
    businessName: String(doc.businessName ?? FALLBACK.businessName),
    tagline: String(doc.tagline ?? FALLBACK.tagline),
    whatsappRaw: raw,
    whatsappNumber: normaliseWhatsAppNumber(raw),
    businessEmail: String(doc.businessEmail ?? ""),
    businessPhone: String(doc.businessPhone ?? ""),
    businessAddress: String(doc.businessAddress ?? ""),
    socialMediaLinks: {
      instagram: social.instagram ?? "",
      facebook: social.facebook ?? "",
      tiktok: social.tiktok ?? "",
      x: social.x ?? "",
    },
    currency: String(doc.currency ?? "GHS"),
    announcementText: String(doc.announcementText ?? ""),
    announcementEnabled: Boolean(doc.announcementEnabled ?? true),
    promoHeading: String(doc.promoHeading ?? FALLBACK.promoHeading),
    promoBody: String(doc.promoBody ?? FALLBACK.promoBody),
    promoImage: String(doc.promoImage ?? ""),
    promoLink: String(doc.promoLink ?? "/shop"),
    lowStockThreshold: Number(doc.lowStockThreshold ?? 3),
    logoUrl: String(doc.logoUrl ?? ""),
    siteStatus: doc.siteStatus === "paused" ? "paused" : "active",
    pausedReason: String(doc.pausedReason ?? FALLBACK.pausedReason),
    developerName: String(doc.developerName ?? FALLBACK.developerName),
    developerEmail: String(doc.developerEmail ?? ""),
    developerPhone: String(doc.developerPhone ?? ""),
    developerWhatsapp: String(doc.developerWhatsapp ?? ""),
  };
}

export const getSettings = cache(async (): Promise<StoreSettings> => {
  try {
    await connectDB();
    const doc = await BusinessSettings.findOne({ key: "primary" }).lean();
    return toStoreSettings(doc as Record<string, unknown> | null);
  } catch (error) {
    console.error("[settings] falling back to defaults:", (error as Error).message);
    return toStoreSettings(null);
  }
});
