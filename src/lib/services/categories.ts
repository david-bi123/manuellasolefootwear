import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/category";
import { Product } from "@/lib/models/product";
import { slugify } from "@/lib/utils";
import type { CategoryInput } from "@/lib/validators";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  gender: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export async function listCategoriesWithCounts(): Promise<AdminCategory[]> {
  await connectDB();
  const [docs, counts] = await Promise.all([
    Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
    Product.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);
  const map = new Map(counts.map((row) => [String(row._id), row.count as number]));
  return (docs as any[]).map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description ?? "",
    image: doc.image ?? "",
    gender: doc.gender,
    sortOrder: doc.sortOrder ?? 0,
    isActive: doc.isActive,
    productCount: map.get(String(doc._id)) ?? 0,
  }));
}

async function uniqueCategorySlug(name: string, excludeId?: string) {
  const base = slugify(name) || "category";
  let candidate = base;
  let n = 2;
  while (
    await Category.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

export async function createCategory(input: CategoryInput) {
  await connectDB();
  const slug = await uniqueCategorySlug(input.name);
  const doc = await Category.create({
    name: input.name,
    slug,
    description: input.description,
    image: input.image,
    gender: input.gender,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  });
  return { id: String(doc._id), slug: doc.slug };
}

export async function updateCategory(input: CategoryInput) {
  await connectDB();
  if (!input.id) throw new Error("Missing category identifier.");
  const doc = await Category.findById(input.id);
  if (!doc) throw new Error("Category not found.");
  if (doc.name !== input.name) doc.slug = await uniqueCategorySlug(input.name, input.id);
  doc.name = input.name;
  doc.description = input.description;
  doc.image = input.image;
  doc.gender = input.gender;
  doc.sortOrder = input.sortOrder;
  doc.isActive = input.isActive;
  await doc.save();
  return { id: String(doc._id), slug: doc.slug };
}

export async function deleteCategory(id: string) {
  await connectDB();
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new Error(
      `This category contains ${productCount} product(s). Move them to another category or deactivate this category instead.`,
    );
  }
  await Category.deleteOne({ _id: id });
  return { deleted: true };
}
