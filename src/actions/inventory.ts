"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { adjustStock } from "@/lib/services/inventory";
import { fieldErrorsFrom, inventoryAdjustSchema, type InventoryAdjustInput } from "@/lib/validators";

export async function adjustStockAction(
  payload: InventoryAdjustInput,
): Promise<ActionResult<{ newQuantity: number }>> {
  const user = await requirePermission("inventory.write");
  const parsed = inventoryAdjustSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError("Check the stock details.", fieldErrorsFrom(parsed.error));
  }
  try {
    await connectDB();
    const result = await adjustStock(user.id, parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/dashboard");
    revalidatePath("/shop");
    return actionOk(
      result.changed ? "Stock updated and movement recorded." : "No change was needed.",
      { newQuantity: result.newQuantity },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return actionError("Check the stock details.", fieldErrorsFrom(error));
    }
    return actionError(error instanceof Error ? error.message : "Stock update failed.");
  }
}
