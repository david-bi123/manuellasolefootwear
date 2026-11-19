import { cache } from "react";
import { connectDB } from "@/lib/db";
import { BusinessSettings } from "@/lib/models/settings";

export type SiteStatus = {
  /** "active" serves the storefront; "paused" shows the hosting-renewal notice. */
  status: "active" | "paused";
  pausedAt: string | null;
  pausedReason: string;
  developerName: string;
  developerEmail: string;
  developerPhone: string;
  developerWhatsapp: string;
  /** Whether any real data source is available at all. */
  databaseConnected: boolean;
};

const DEFAULT_REASON =
  "This website is temporarily unavailable. Please contact the developer to renew hosting.";

function normalise(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export const getSiteStatus = cache(async (): Promise<SiteStatus> => {
  let doc: Record<string, unknown> | null = null;
  let databaseConnected = true;
  try {
    await connectDB();
    doc = (await BusinessSettings.findOne({ key: "primary" }).lean()) as Record<
      string,
      unknown
    > | null;
  } catch (error) {
    databaseConnected = false;
    console.error("[site] could not load site status:", (error as Error).message);
  }

  if (!doc) {
    return {
      status: "active",
      pausedAt: null,
      pausedReason: DEFAULT_REASON,
      developerName: normalise(process.env.DEVELOPER_NAME) || "Samtech Labs",
      developerEmail: normalise(process.env.DEVELOPER_EMAIL),
      developerPhone: normalise(process.env.DEVELOPER_PHONE),
      developerWhatsapp: normalise(process.env.DEVELOPER_WHATSAPP),
      databaseConnected,
    };
  }

  return {
    status: doc.siteStatus === "paused" ? "paused" : "active",
    pausedAt: doc.pausedAt ? new Date(doc.pausedAt as Date).toISOString() : null,
    pausedReason: normalise(doc.pausedReason) || DEFAULT_REASON,
    developerName: normalise(doc.developerName) || "Samtech Labs",
    developerEmail: normalise(doc.developerEmail),
    developerPhone: normalise(doc.developerPhone),
    developerWhatsapp: normalise(doc.developerWhatsapp),
    databaseConnected,
  };
});

export async function setSitePaused(paused: boolean, reason?: string) {
  await connectDB();
  const updates: Record<string, unknown> = {
    siteStatus: paused ? "paused" : "active",
    pausedAt: paused ? new Date() : null,
  };
  if (typeof reason === "string" && reason.trim()) {
    updates.pausedReason = reason.trim().slice(0, 500);
  }
  await BusinessSettings.findOneAndUpdate(
    { key: "primary" },
    { $set: updates, $setOnInsert: { key: "primary" } },
    { upsert: true, new: true },
  );
  return { status: paused ? ("paused" as const) : ("active" as const) };
}