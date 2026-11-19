"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/services/categories";
import { categorySchema, fieldErrorsFrom, type CategoryInput } from "@/lib/validators";

function handleError<T = undefined>(error: unknown): ActionResult<T> {
  if (error instanceof z.ZodError) {
    return actionError("Please correct the highlighted fields.", fieldErrorsFrom(error));
  }
  if (error instanceof Error && error.message.includes("E11000")) {
    return actionError("A category with that slug already exists.");
  }
  return actionError(error instanceof Error ? error.message : "Something went wrong.");
}

export async function saveCategoryAction(
  payload: CategoryInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requirePermission("categories.write");
  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) {
    return actionError("Please correct the highlighted fields.", fieldErrorsFrom(parsed.error));
  }
  try {
    await connectDB();
    const result = parsed.data.id
      ? await updateCategory(parsed.data)
      : await createCategory(parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return actionOk(parsed.data.id ? "Category updated." : "Category created.", result);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requirePermission("categories.write");
  try {
    await connectDB();
    await deleteCategory(id);
    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");
    return actionOk("Category deleted.");
  } catch (error) {
    return handleError(error);
  }
}
