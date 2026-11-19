"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requireSuperAdmin } from "@/lib/auth/session";
import { setSitePaused } from "@/lib/services/site";

const pauseSchema = z.object({
  paused: z.boolean(),
  reason: z.string().trim().max(500).optional(),
});

export async function setSiteStatusAction(payload: {
  paused: boolean;
  reason?: string;
}): Promise<ActionResult<{ status: "active" | "paused" }>> {
  await requireSuperAdmin();
  const parsed = pauseSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError("Please check the request and try again.");
  }
  try {
    const result = await setSitePaused(parsed.data.paused, parsed.data.reason);
    // Revalidate every storefront route so the change takes effect immediately.
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return actionOk(
      result.status === "paused"
        ? "Website paused. The storefront now shows the hosting-renewal notice."
        : "Website resumed. The storefront is live again.",
      result,
    );
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "The site status could not be updated.",
    );
  }
}