"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import {
  createProduct,
  deleteProduct,
  setProductFlags,
  updateProduct,
} from "@/lib/services/admin-products";
import { fieldErrorsFrom, productSchema, type ProductInput } from "@/lib/validators";

function revalidateStorefront(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/product/${slug}`);
}

function handleError<T = undefined>(error: unknown): ActionResult<T> {
  if (error instanceof z.ZodError) {
    return actionError("Please correct the highlighted fields.", fieldErrorsFrom(error));
  }
  if (error instanceof Error) {
    if (error.message.includes("E11000")) {
      return actionError("That SKU or slug is already in use. Choose a different value.");
    }
    return actionError(error.message);
  }
  return actionError("Something went wrong. Please try again.");
}

export async function saveProductAction(
  payload: ProductInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requirePermission("products.write");
  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError("Please correct the highlighted fields.", fieldErrorsFrom(parsed.error));
  }

  try {
    await connectDB();
    const result = parsed.data.id
      ? await updateProduct(user.id, parsed.data)
      : await createProduct(user.id, parsed.data);
    revalidateStorefront(result.slug);
    return actionOk(
      parsed.data.id ? "Product updated successfully." : "Product created successfully.",
      result,
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function setProductFlagsAction(
  id: string,
  flags: { isPublished?: boolean; isFeatured?: boolean; isNewArrival?: boolean; isArchived?: boolean },
): Promise<ActionResult> {
  await requirePermission("products.write");
  try {
    await connectDB();
    await setProductFlags(id, flags);
    revalidateStorefront();
    return actionOk("Product updated.");
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requirePermission("products.write");
  try {
    await connectDB();
    await deleteProduct(id);
    revalidateStorefront();
    return actionOk("Product deleted.");
  } catch (error) {
    return handleError(error);
  }
}
