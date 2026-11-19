import { z } from "zod";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/models/sale";

const objectId = z
  .string()
  .regex(/^[a-f0-9]{24}$/i, "Invalid identifier");

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value ?? "");

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required").max(200),
});

export const variantSchema = z
  .object({
    _id: z.string().optional(),
    size: z.string().trim().min(1, "Size is required").max(12),
    colour: z.string().trim().min(1, "Colour is required").max(40),
    stockQuantity: z.coerce.number().int().min(0).max(100_000),
    costPrice: z.coerce.number().min(0).max(10_000_000),
    sellingPrice: z.coerce.number().gt(0, "Selling price must be greater than zero").max(10_000_000),
    salePrice: z
      .union([z.coerce.number().min(0).max(10_000_000), z.null(), z.literal("")])
      .optional()
      .transform((value) => (value === "" || value === null || value === undefined ? null : Number(value))),
    sku: optionalText(60),
  })
  .refine((variant) => variant.salePrice === null || variant.salePrice < variant.sellingPrice, {
    message: "Sale price must be lower than the selling price",
    path: ["salePrice"],
  });

export const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(3, "Product name is required").max(160),
    description: z.string().trim().min(20, "Description should be at least 20 characters").max(5000),
    sku: optionalText(60),
    categoryId: objectId,
    gender: z.enum(["Men", "Women", "Unisex"]),
    sizingSystem: z.enum(["UK", "EU"]),
    images: z
      .array(
        z.object({
          url: z.string().url("Each image needs a valid URL"),
          publicId: optionalText(200),
          alt: optionalText(200),
        }),
      )
      .min(1, "Add at least one product image")
      .max(8, "A maximum of 8 images is supported"),
    variants: z.array(variantSchema).min(1, "Add at least one size and colour variant").max(200),
    isFeatured: z.boolean().default(false),
    isNewArrival: z.boolean().default(false),
    isPublished: z.boolean().default(true),
    lowStockThreshold: z.coerce.number().int().min(0).max(1000).default(3),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    value.variants.forEach((variant, index) => {
      const key = `${variant.size.toLowerCase()}::${variant.colour.toLowerCase()}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate variant: ${value.sizingSystem} ${variant.size} / ${variant.colour}`,
          path: ["variants", index, "size"],
        });
      }
      seen.add(key);
    });
  });

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Category name is required").max(80),
  description: optionalText(400),
  image: z.union([z.string().url(), z.literal("")]).optional().transform((v) => v ?? ""),
  gender: z.enum(["Men", "Women", "Unisex"]),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export const saleItemInputSchema = z.object({
  productId: objectId,
  variantId: objectId,
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(999),
});

export const saleSchema = z.object({
  customerName: optionalText(120),
  customerPhone: optionalText(40),
  items: z.array(saleItemInputSchema).min(1, "Add at least one product to the sale"),
  discount: z.coerce.number().min(0).max(10_000_000).default(0),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  amountPaid: z.coerce.number().min(0).max(10_000_000).optional(),
  saleDate: z.string().optional(),
  notes: optionalText(1000),
});

export const inventoryAdjustSchema = z.object({
  productId: objectId,
  variantId: objectId,
  mode: z.enum(["add", "remove", "set"]),
  quantity: z.coerce.number().int().min(0).max(100_000),
  reason: z.string().trim().min(3, "Add a short reason for this adjustment").max(500),
});

export const cancelSaleSchema = z.object({
  saleId: objectId,
  reason: z.string().trim().min(3, "A cancellation reason is required").max(500),
});

export const returnSaleSchema = z.object({
  saleId: objectId,
  reason: z.string().trim().min(3, "A return reason is required").max(500),
  items: z
    .array(z.object({ itemId: objectId, quantity: z.coerce.number().int().min(1).max(999) }))
    .min(1, "Select at least one item to return"),
});

export const paymentStatusSchema = z.object({
  saleId: objectId,
  paymentStatus: z.enum(PAYMENT_STATUSES),
  amountPaid: z.coerce.number().min(0).max(10_000_000).optional(),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  tagline: optionalText(160),
  whatsappNumber: z
    .string()
    .trim()
    .min(8, "Enter the WhatsApp number in international format")
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Only digits, spaces and + are allowed"),
  businessEmail: z.union([z.email(), z.literal("")]).optional().transform((v) => v ?? ""),
  businessPhone: optionalText(40),
  businessAddress: optionalText(300),
  socialMediaLinks: z
    .object({
      instagram: z.union([z.url(), z.literal("")]).optional(),
      facebook: z.union([z.url(), z.literal("")]).optional(),
      tiktok: z.union([z.url(), z.literal("")]).optional(),
      x: z.union([z.url(), z.literal("")]).optional(),
    })
    .default({}),
  currency: z.string().trim().min(3).max(5).default("GHS"),
  announcementText: optionalText(240),
  announcementEnabled: z.boolean().default(true),
  promoHeading: optionalText(160),
  promoBody: optionalText(600),
  promoImage: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((v) => v ?? ""),
  promoLink: optionalText(300),
  lowStockThreshold: z.coerce.number().int().min(0).max(1000).default(3),
  logoUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((v) => v ?? ""),
});

export const inviteSchema = z.object({
  name: z.string().trim().min(2, "Enter the team member's name").max(120),
  email: z.email("Enter a valid email address").transform((v) => v.toLowerCase().trim()),
  role: z.enum(["admin", "staff"]),
});

export const acceptInviteSchema = z
  .object({
    token: z.string().min(20),
    name: z.string().trim().min(2).max(120),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
