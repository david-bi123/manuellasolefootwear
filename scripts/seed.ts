/**
 * Seed the database with a minimal but realistic catalogue so the storefront
 * is not empty on first launch.
 *
 * Usage:
 *   npm run seed
 *
 * Safe to run more than once — it only inserts data that does not already exist.
 */
import { loadEnv, connectForScript, disconnect } from "./_env";
import { GENDERS, SIZING_SYSTEMS } from "@/lib/models/product";

loadEnv();

type Gender = (typeof GENDERS)[number];
type Sizing = (typeof SIZING_SYSTEMS)[number];

const CATEGORIES: {
  name: string;
  gender: Gender;
  slug: string;
  description: string;
}[] = [
  { name: "Heels", gender: "Women", slug: "heels", description: "Elevated heels for every occasion." },
  { name: "Boots", gender: "Women", slug: "boots", description: "Ankle and knee boots in refined finishes." },
  { name: "Loafers", gender: "Men", slug: "loafers", description: "Everyday loafers and slip-ons." },
  { name: "Formal", gender: "Men", slug: "formal", description: "Oxfords and derbies for the office and beyond." },
];

const PRODUCTS: {
  name: string;
  sku: string;
  categorySlug: string;
  gender: Gender;
  sizingSystem: Sizing;
  description: string;
  variants: {
    size: string;
    colour: string;
    stockQuantity: number;
    costPrice: number;
    sellingPrice: number;
  }[];
  isFeatured: boolean;
  isNewArrival: boolean;
}[] = [
  {
    name: "Nude Patent Peep-Toe Heels",
    sku: "MS-HEEL-001",
    categorySlug: "heels",
    gender: "Women",
    sizingSystem: "EU",
    description:
      "A timeless peep-toe heel in patent nude. Considered proportions and a comfortable mid heel make it a pair you can wear from morning meetings to evening events.",
    variants: [
      { size: "37", colour: "Nude", stockQuantity: 8, costPrice: 120, sellingPrice: 320 },
      { size: "38", colour: "Nude", stockQuantity: 6, costPrice: 120, sellingPrice: 320 },
      { size: "39", colour: "Nude", stockQuantity: 4, costPrice: 120, sellingPrice: 320 },
    ],
    isFeatured: true,
    isNewArrival: true,
  },
  {
    name: "Classic Leather Loafers",
    sku: "MS-LOAF-001",
    categorySlug: "loafers",
    gender: "Men",
    sizingSystem: "UK",
    description:
      "A clean leather loafer with a flexible sole and cushioned footbed. Dresses up denim and finishes a suit with equal ease.",
    variants: [
      { size: "7", colour: "Black", stockQuantity: 5, costPrice: 140, sellingPrice: 380 },
      { size: "8", colour: "Black", stockQuantity: 5, costPrice: 140, sellingPrice: 380 },
      { size: "9", colour: "Black", stockQuantity: 3, costPrice: 140, sellingPrice: 380 },
    ],
    isFeatured: true,
    isNewArrival: false,
  },
  {
    name: "Ankle Chelsea Boots",
    sku: "MS-BOOT-001",
    categorySlug: "boots",
    gender: "Women",
    sizingSystem: "EU",
    description:
      "A streamlined Chelsea boot in supple leather with an elastic side panel. A pull-on silhouette built for daily wear.",
    variants: [
      { size: "38", colour: "Taupe", stockQuantity: 4, costPrice: 180, sellingPrice: 460 },
      { size: "39", colour: "Taupe", stockQuantity: 4, costPrice: 180, sellingPrice: 460 },
    ],
    isFeatured: false,
    isNewArrival: true,
  },
  {
    name: "Oxford Derby Shoes",
    sku: "MS-FORM-001",
    categorySlug: "formal",
    gender: "Men",
    sizingSystem: "UK",
    description:
      "A polished Oxford with a closed lacing system and a slim profile. The pair for interviews, weddings and everything formal.",
    variants: [
      { size: "8", colour: "Brown", stockQuantity: 4, costPrice: 160, sellingPrice: 420 },
      { size: "9", colour: "Brown", stockQuantity: 4, costPrice: 160, sellingPrice: 420 },
    ],
    isFeatured: false,
    isNewArrival: false,
  },
];

async function main() {
  const mongoose = await connectForScript();
  try {
    const { Category } = await import("@/lib/models/category");
    const { Product } = await import("@/lib/models/product");
    const { BusinessSettings } = await import("@/lib/models/settings");
    const { slugify } = await import("@/lib/utils");

    // Settings (only if none exist yet)
    const settingsCount = await BusinessSettings.countDocuments();
    if (settingsCount === 0) {
      await BusinessSettings.create({ key: "primary" });
      console.log("Created default business settings.");
    }

    // Categories
    const slugToId = new Map<string, string>();
    for (const category of CATEGORIES) {
      let doc = await Category.findOne({ slug: category.slug });
      if (!doc) {
        doc = await Category.create(category);
        console.log(`  + category: ${category.name}`);
      }
      slugToId.set(category.slug, String(doc._id));
    }

    // Products
    for (const product of PRODUCTS) {
      const existing = await Product.findOne({ sku: product.sku });
      if (existing) continue;
      const categoryId = slugToId.get(product.categorySlug);
      if (!categoryId) continue;

      const slug = slugify(product.name);
      const prices = product.variants.map((v) => v.sellingPrice);
      await Product.create({
        name: product.name,
        slug,
        description: product.description,
        sku: product.sku,
        category: categoryId,
        gender: product.gender,
        sizingSystem: product.sizingSystem,
        images: [],
        variants: product.variants,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isPublished: true,
        lowStockThreshold: 3,
        priceFrom: Math.min(...prices),
      });
      console.log(`  + product: ${product.name}`);
    }

    console.log("\nSeed complete.");
  } finally {
    await disconnect(mongoose);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});