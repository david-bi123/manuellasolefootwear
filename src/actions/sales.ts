"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import {
  cancelSale,
  createSale,
  returnSaleItems,
  updatePaymentStatus,
} from "@/lib/services/sales";
import {
  cancelSaleSchema,
  fieldErrorsFrom,
  returnSaleSchema,
  saleSchema,
  type SaleInput,
} from "@/lib/validators";

function handleError<T = undefined>(error: unknown): ActionResult<T> {
  if (error instanceof z.ZodError) {
    return actionError("Please check the sale details.", fieldErrorsFrom(error));
  }
  return actionError(error instanceof Error ? error.message : "The sale could not be saved.");
}

export async function createSaleAction(
  payload: SaleInput,
): Promise<ActionResult<{ id: string; saleReference: string; total: number }>> {
  const user = await requirePermission("sales.write");
  const parsed = saleSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError("Please check the sale details.", fieldErrorsFrom(parsed.error));
  }

  try {
    await connectDB();
    const result = await createSale(user.id, parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/admin/sales");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/reports");
    revalidatePath("/shop");
    return actionOk(`Sale ${result.saleReference} recorded.`, result);
  } catch (error) {
    return handleError(error);
  }
}

export async function cancelSaleAction(
  saleId: string,
  reason: string,
): Promise<ActionResult> {
  const user = await requirePermission("sales.write");
  const parsed = cancelSaleSchema.safeParse({ saleId, reason });
  if (!parsed.success) {
    return actionError("Add a reason before cancelling the sale.", fieldErrorsFrom(parsed.error));
  }
  try {
    await connectDB();
    await cancelSale(user.id, parsed.data.saleId, parsed.data.reason);
    revalidatePath("/admin/sales");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/reports");
    return actionOk("Sale cancelled and stock restored.");
  } catch (error) {
    return handleError(error);
  }
}

export async function returnSaleAction(
  saleId: string,
  items: { itemId: string; quantity: number }[],
  reason: string,
): Promise<ActionResult> {
  const user = await requirePermission("sales.write");
  const parsed = returnSaleSchema.safeParse({ saleId, items, reason });
  if (!parsed.success) {
    return actionError("Check the return quantities.", fieldErrorsFrom(parsed.error));
  }
  try {
    await connectDB();
    const result = await returnSaleItems(user.id, parsed.data.saleId, parsed.data.items, parsed.data.reason);
    revalidatePath("/admin/sales");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/reports");
    return actionOk("Return recorded and stock restored.");
  } catch (error) {
    return handleError(error);
  }
}

export async function updatePaymentStatusAction(
  saleId: string,
  paymentStatus: "Paid" | "Partially Paid" | "Pending",
  amountPaid?: number,
): Promise<ActionResult> {
  const user = await requirePermission("sales.write");
  try {
    await connectDB();
    await updatePaymentStatus(user.id, saleId, paymentStatus, amountPaid);
    revalidatePath("/admin/sales");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");
    return actionOk("Payment status updated.");
  } catch (error) {
    return handleError(error);
  }
}
