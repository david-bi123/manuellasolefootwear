"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { BusinessSettings } from "@/lib/models/settings";
import {
  categorySchema,
  fieldErrorsFrom,
  productSchema,
  settingsSchema,
  type SettingsInput,
} from "@/lib/validators";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

export async function saveSettingsAction(payload: SettingsInput): Promise<ActionResult> {
  await requirePermission("settings.write");
  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError("Please correct the highlighted fields.", fieldErrorsFrom(parsed.error));
  }
  try {
    await connectDB();
    const data = parsed.data;
    await BusinessSettings.findOneAndUpdate(
      { key: "primary" },
      {
        $set: {
          ...data,
          socialMediaLinks: {
            instagram: data.socialMediaLinks.instagram ?? "",
            facebook: data.socialMediaLinks.facebook ?? "",
            tiktok: data.socialMediaLinks.tiktok ?? "",
            x: data.socialMediaLinks.x ?? "",
          },
        },
        $setOnInsert: { key: "primary" },
      },
      { upsert: true, new: true },
    );
    revalidatePath("/", "layout");
    revalidatePath("/contact");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/dashboard");
    return actionOk("Business settings saved.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return actionError("Please correct the highlighted fields.", fieldErrorsFrom(error));
    }
    return actionError(error instanceof Error ? error.message : "Settings could not be saved.");
  }
}

export async function createSignatureAction(): Promise<
  ActionResult<{ timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string }>
> {
  await requirePermission("products.write");
  if (!isCloudinaryConfigured()) {
    return actionError(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the server.",
    );
  }
  const { createUploadSignature } = await import("@/lib/cloudinary");
  try {
    const data = createUploadSignature();
    return actionOk(undefined, data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Could not prepare the upload.");
  }
}
