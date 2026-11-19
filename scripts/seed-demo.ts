/**
 * Seeds a realistic demo catalogue (4 categories + 13 products) and runs an
 * end-to-end functional test of the core flows:
 *
 *   - Product creation (auto SKU) ......... via createProduct()
 *   - Recording a sale (stock deduction) .. via createSale()
 *   - Recording a return (stock restore) .. via returnSaleItems()
 *   - Stock adjustment (add / remove) ..... via adjustStock()
 *   - Cancelling a sale (stock restore) ... via cancelSale()
 *
 * All test sales / movements are cleaned up and stock is restored to the
 * original seeded quantities, so the database is left clean for manual testing.
 *
 * Usage:  npm run seed:demo
 */
import { loadEnv, connectForScript, disconnect } from "./_env";

loadEnv();

type VariantSeed = {
  size: string;
  colour: string;
  stockQuantity: number;
  costPrice: number;
  sellingPrice: number;
  salePrice?: number | null;
};

type ProductSeed = {
  name: string;
  categorySlug: string;
  gender: "Men" | "Women" | "Unisex";
  sizingSystem: "UK" | "EU";
  description: string;
  image: string;
  variants: VariantSeed[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
};

const CATEGORIES = [
  { name: "Heels", slug: "heels", gender: "Women", image: "/images/categories/heels.jpg", sortOrder: 1,
    description: "Sculpted courts, peep-toes and block heels chosen for balance and all-day wear." },
  { name: "Boots", slug: "boots", gender: "Unisex", image: "/images/categories/boots.jpg", sortOrder: 2,
    description: "Chelsea, brogue and buckle boots in suede and burnished leather." },
  { name: "Loafers", slug: "loafers", gender: "Unisex", image: "/images/categories/loafers.jpg", sortOrder: 3,
    description: "Penny, tassel and driving loafers with soft linings and flexible soles." },
  { name: "Formal", slug: "formal", gender: "Men", image: "/images/categories/formal.jpg", sortOrder: 4,
    description: "Oxfords, derbies and monk straps with clean lines and honest construction." },
];

const PRODUCTS: ProductSeed[] = [
  {
    name: "Amara Peep-Toe Pump", categorySlug: "heels", gender: "Women", sizingSystem: "EU",
    image: "/images/products/amara-peep-toe-pump.jpg", isFeatured: true, isNewArrival: true,
    description: "A refined peep-toe pump with a sculpted mid heel. Smooth leather upper, cushioned footbed and a considered silhouette that carries from desk to dinner.",
    variants: [
      { size: "37", colour: "Nude", stockQuantity: 8, costPrice: 120, sellingPrice: 320 },
      { size: "38", colour: "Nude", stockQuantity: 6, costPrice: 120, sellingPrice: 320 },
      { size: "39", colour: "Nude", stockQuantity: 4, costPrice: 120, sellingPrice: 320 },
      { size: "40", colour: "Black", stockQuantity: 3, costPrice: 125, sellingPrice: 335 },
    ],
  },
  {
    name: "Celine Court Heel", categorySlug: "heels", gender: "Women", sizingSystem: "EU",
    image: "/images/products/celine-court-heel.jpg", isFeatured: true,
    description: "A timeless closed court heel in supple leather. A slim profile and balanced heel height make it the pair you reach for on long days.",
    variants: [
      { size: "37", colour: "Black", stockQuantity: 5, costPrice: 110, sellingPrice: 295 },
      { size: "38", colour: "Black", stockQuantity: 5, costPrice: 110, sellingPrice: 295 },
      { size: "39", colour: "Nude", stockQuantity: 4, costPrice: 110, sellingPrice: 295, salePrice: 249 },
    ],
  },
  {
    name: "Nia Chelsea Boot", categorySlug: "boots", gender: "Women", sizingSystem: "EU",
    image: "/images/products/nia-chelsea-boot.jpg", isNewArrival: true,
    description: "A streamlined Chelsea boot in supple leather with an elastic side panel. A pull-on silhouette built for daily wear.",
    variants: [
      { size: "38", colour: "Taupe", stockQuantity: 4, costPrice: 180, sellingPrice: 460 },
      { size: "39", colour: "Taupe", stockQuantity: 4, costPrice: 180, sellingPrice: 460 },
      { size: "40", colour: "Black", stockQuantity: 2, costPrice: 185, sellingPrice: 475 },
    ],
  },
  {
    name: "Adaeze Brogue Boot", categorySlug: "boots", gender: "Women", sizingSystem: "EU",
    image: "/images/products/adaeze-brogue-boot.jpg",
    description: "A brogue-detailed ankle boot with a grounded heel and burnished finish. Decorative perforations meet everyday durability.",
    variants: [
      { size: "38", colour: "Brown", stockQuantity: 3, costPrice: 190, sellingPrice: 480 },
      { size: "39", colour: "Brown", stockQuantity: 3, costPrice: 190, sellingPrice: 480 },
    ],
  },
  {
    name: "Efua Penny Loafer", categorySlug: "loafers", gender: "Women", sizingSystem: "EU",
    image: "/images/products/efua-penny-loafer.jpg", isFeatured: true,
    description: "A classic penny loafer with a soft leather lining and flexible sole. The easiest pair in the wardrobe to dress up or down.",
    variants: [
      { size: "37", colour: "Tan", stockQuantity: 5, costPrice: 130, sellingPrice: 340 },
      { size: "38", colour: "Tan", stockQuantity: 5, costPrice: 130, sellingPrice: 340 },
      { size: "39", colour: "Black", stockQuantity: 3, costPrice: 130, sellingPrice: 340 },
    ],
  },
  {
    name: "Mensah Derby", categorySlug: "formal", gender: "Men", sizingSystem: "UK",
    image: "/images/products/mensah-derby.jpg", isFeatured: true,
    description: "A polished derby with an open lacing system and a slim profile. The pair for interviews, weddings and everything formal.",
    variants: [
      { size: "7", colour: "Black", stockQuantity: 4, costPrice: 160, sellingPrice: 420 },
      { size: "8", colour: "Black", stockQuantity: 4, costPrice: 160, sellingPrice: 420 },
      { size: "9", colour: "Brown", stockQuantity: 3, costPrice: 165, sellingPrice: 435 },
    ],
  },
  {
    name: "Osei Oxford", categorySlug: "formal", gender: "Men", sizingSystem: "UK",
    image: "/images/products/osei-oxford.jpg",
    description: "A structured Oxford with closed lacing and a clean toe. Made to be worn often and repaired rather than replaced.",
    variants: [
      { size: "7", colour: "Black", stockQuantity: 3, costPrice: 170, sellingPrice: 445 },
      { size: "8", colour: "Black", stockQuantity: 3, costPrice: 170, sellingPrice: 445 },
      { size: "9", colour: "Black", stockQuantity: 2, costPrice: 170, sellingPrice: 445 },
    ],
  },
  {
    name: "Kwame Suede Loafer", categorySlug: "loafers", gender: "Men", sizingSystem: "UK",
    image: "/images/products/kwame-suede-loafer.jpg", isNewArrival: true,
    description: "A soft suede loafer with a cushioned footbed and a flexible sole. Relaxed enough for weekends, sharp enough for the office.",
    variants: [
      { size: "8", colour: "Sand", stockQuantity: 4, costPrice: 150, sellingPrice: 390 },
      { size: "9", colour: "Sand", stockQuantity: 4, costPrice: 150, sellingPrice: 390 },
      { size: "10", colour: "Brown", stockQuantity: 2, costPrice: 150, sellingPrice: 390 },
    ],
  },
  {
    name: "Kofi Buckle Boot", categorySlug: "boots", gender: "Men", sizingSystem: "UK",
    image: "/images/products/kofi-buckle-boot.jpg",
    description: "A buckle-detail boot in burnished leather with a sturdy sole. Rugged enough for winter, refined enough for the city.",
    variants: [
      { size: "8", colour: "Brown", stockQuantity: 3, costPrice: 200, sellingPrice: 520 },
      { size: "9", colour: "Brown", stockQuantity: 3, costPrice: 200, sellingPrice: 520 },
    ],
  },
  {
    name: "Adwoa Block Heel", categorySlug: "heels", gender: "Women", sizingSystem: "EU",
    image: "/images/categories/heels.jpg", isNewArrival: true,
    description: "A comfortable block heel with an ankle strap and a supportive footbed. All-day wear without the compromise.",
    variants: [
      { size: "38", colour: "Rose", stockQuantity: 4, costPrice: 115, sellingPrice: 305 },
      { size: "39", colour: "Rose", stockQuantity: 4, costPrice: 115, sellingPrice: 305 },
      { size: "40", colour: "Nude", stockQuantity: 2, costPrice: 115, sellingPrice: 305 },
    ],
  },
  {
    name: "Yaa Ankle Boot", categorySlug: "boots", gender: "Women", sizingSystem: "EU",
    image: "/images/categories/boots.jpg",
    description: "A sleek ankle boot with a mid heel and a smooth leather finish. An easy staple that works with denim and tailoring alike.",
    variants: [
      { size: "37", colour: "Black", stockQuantity: 3, costPrice: 175, sellingPrice: 450 },
      { size: "38", colour: "Black", stockQuantity: 3, costPrice: 175, sellingPrice: 450 },
    ],
  },
  {
    name: "Esi Driving Loafer", categorySlug: "loafers", gender: "Women", sizingSystem: "EU",
    image: "/images/categories/loafers.jpg",
    description: "A soft driving loafer with a pebbled sole and a supple upper. Made for slipping on and going.",
    variants: [
      { size: "37", colour: "Cream", stockQuantity: 4, costPrice: 125, sellingPrice: 330 },
      { size: "38", colour: "Cream", stockQuantity: 4, costPrice: 125, sellingPrice: 330 },
    ],
  },
  {
    name: "Kojo Monk Strap", categorySlug: "formal", gender: "Men", sizingSystem: "UK",
    image: "/images/categories/formal.jpg",
    description: "A double monk-strap shoe with a clean last and a burnished finish. A distinctive alternative to the classic lace-up.",
    variants: [
      { size: "8", colour: "Tan", stockQuantity: 2, costPrice: 185, sellingPrice: 485 },
      { size: "9", colour: "Tan", stockQuantity: 2, costPrice: 185, sellingPrice: 485 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------
const results: { name: string; ok: boolean; detail: string }[] = [];
function check(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${name} — ${detail}`);
}

async function main() {
  const mongoose = await connectForScript();
  try {
    const { Category } = await import("@/lib/models/category");
    const { Product } = await import("@/lib/models/product");
    const { Sale } = await import("@/lib/models/sale");
    const { InventoryMovement } = await import("@/lib/models/inventory-movement");
    const { Admin } = await import("@/lib/models/admin");
    const { createProduct } = await import("@/lib/services/admin-products");
    const { createSale, returnSaleItems, cancelSale } = await import("@/lib/services/sales");
    const { adjustStock } = await import("@/lib/services/inventory");

    const owner = await Admin.findOne({ role: "owner" }).lean();
    if (!owner) throw new Error("No owner account found. Run npm run create-owner first.");
    const ownerId = String((owner as any)._id);

    // ---- Seed categories -------------------------------------------------
    console.log("\nSeeding categories…");
    const slugToId = new Map<string, string>();
    for (const c of CATEGORIES) {
      let doc = await Category.findOne({ slug: c.slug });
      if (!doc) {
        doc = await Category.create(c as any);
        console.log(`  + category ${c.name}`);
      }
      slugToId.set(c.slug, String((doc as any)._id));
    }

    // ---- Seed products ---------------------------------------------------
    console.log("\nSeeding products…");
    let createdCount = 0;
    for (const p of PRODUCTS) {
      const existing = await Product.findOne({ name: p.name });
      if (existing) {
        console.log(`  = exists  ${p.name}`);
        continue;
      }
      await createProduct(ownerId, {
        name: p.name,
        description: p.description,
        sku: "", // auto-generate
        categoryId: slugToId.get(p.categorySlug)!,
        gender: p.gender,
        sizingSystem: p.sizingSystem,
        images: [{ url: p.image, publicId: "", alt: p.name }],
        variants: p.variants.map((v) => ({
          size: v.size,
          colour: v.colour,
          stockQuantity: v.stockQuantity,
          costPrice: v.costPrice,
          sellingPrice: v.sellingPrice,
          salePrice: v.salePrice ?? null,
          sku: "",
        })),
        isFeatured: p.isFeatured ?? false,
        isNewArrival: p.isNewArrival ?? false,
        isPublished: true,
        lowStockThreshold: 3,
      });
      createdCount += 1;
      console.log(`  + product ${p.name}`);
    }
    console.log(`Created ${createdCount} new products.`);

    const productCount = await Product.countDocuments({});
    const variantCount = await Product.aggregate([
      { $group: { _id: null, n: { $sum: { $size: "$variants" } } } },
    ]);
    console.log(`Catalogue now: ${productCount} products, ${variantCount[0]?.n ?? 0} variants.`);

    // =====================================================================
    // FUNCTIONAL TESTS
    // =====================================================================
    console.log("\nRunning functional tests…");
    const testStart = new Date();

    // Snapshot stock of the variants we will touch so we can restore exactly.
    const allProducts = await Product.find({}).lean();
    const snapshot = new Map<string, number>();
    for (const prod of allProducts as any[]) {
      for (const v of prod.variants) snapshot.set(String(v._id), v.stockQuantity);
    }

    // Pick two in-stock variants from the first product for testing.
    const target = (allProducts as any[]).find((p) => p.variants.some((v: any) => v.stockQuantity >= 5));
    if (!target) throw new Error("Need a product with a variant in stock (>=5) to test.");
    const vA = target.variants.find((v: any) => v.stockQuantity >= 5);
    const vB = target.variants.find((v: any) => String(v._id) !== String(vA._id) && v.stockQuantity >= 2);
    const stockA0 = snapshot.get(String(vA._id))!;

    // ---- TEST 1: create a sale, stock decrements, movement recorded ------
    const sale1 = await createSale(ownerId, {
      customerName: "Test Customer",
      customerPhone: "024000000",
      items: [{ productId: String(target._id), variantId: String(vA._id), quantity: 2 }],
      discount: 10,
      paymentMethod: "Mobile Money",
      paymentStatus: "Paid",
      notes: "Automated test sale",
    });
    const prodAfterSale = await Product.findById(target._id).lean();
    const vAAfter = (prodAfterSale as any).variants.find((v: any) => String(v._id) === String(vA._id));
    check(
      "Sale records & deducts stock",
      vAAfter.stockQuantity === stockA0 - 2,
      `stock ${stockA0} → ${vAAfter.stockQuantity} (expected ${stockA0 - 2})`,
    );
    const saleDoc = await Sale.findById(sale1.id).lean();
    check(
      "Sale totals computed correctly",
      (saleDoc as any).total === (saleDoc as any).subtotal - (saleDoc as any).discount,
      `total ${(saleDoc as any).total} = subtotal ${(saleDoc as any).subtotal} − discount ${(saleDoc as any).discount}`,
    );

    // ---- TEST 2: return the items, stock restores ------------------------
    const saleItem = (saleDoc as any).items[0];
    await returnSaleItems(ownerId, sale1.id, [{ itemId: String(saleItem._id), quantity: 2 }], "Customer changed mind");
    const prodAfterReturn = await Product.findById(target._id).lean();
    const vAAfterReturn = (prodAfterReturn as any).variants.find((v: any) => String(v._id) === String(vA._id));
    const saleAfterReturn = await Sale.findById(sale1.id).lean();
    check(
      "Return restores stock",
      vAAfterReturn.stockQuantity === stockA0,
      `stock back to ${vAAfterReturn.stockQuantity} (expected ${stockA0})`,
    );
    check(
      "Return updates sale status & refund",
      (saleAfterReturn as any).saleStatus === "Returned" && (saleAfterReturn as any).refundAmount > 0,
      `status ${(saleAfterReturn as any).saleStatus}, refund ${(saleAfterReturn as any).refundAmount}`,
    );

    // ---- TEST 3: stock adjustment (add then remove) ----------------------
    const adj1 = await adjustStock(ownerId, {
      productId: String(target._id), variantId: String(vA._id), mode: "add", quantity: 5, reason: "Test restock",
    });
    check("Stock adjust (add)", adj1.newQuantity === stockA0 + 5, `${stockA0} → ${adj1.newQuantity}`);
    const adj2 = await adjustStock(ownerId, {
      productId: String(target._id), variantId: String(vA._id), mode: "remove", quantity: 5, reason: "Test restock revert",
    });
    check("Stock adjust (remove)", adj2.newQuantity === stockA0, `${adj1.newQuantity} → ${adj2.newQuantity}`);

    // ---- TEST 4: cancel a sale, stock restores ---------------------------
    const sale2 = await createSale(ownerId, {
      customerName: "Cancel Test",
      customerPhone: "",
      items: [{ productId: String(target._id), variantId: String(vB._id), quantity: 1 }],
      discount: 0,
      paymentMethod: "Cash",
      paymentStatus: "Pending",
      notes: "Automated test cancellation",
    });
    const prodAfterSale2 = await Product.findById(target._id).lean();
    const vBAfterSale = (prodAfterSale2 as any).variants.find((v: any) => String(v._id) === String(vB._id));
    const stockB0 = snapshot.get(String(vB._id))!;
    const deducted = vBAfterSale.stockQuantity === stockB0 - 1;
    await cancelSale(ownerId, sale2.id, "Automated test cancellation");
    const prodAfterCancel = await Product.findById(target._id).lean();
    const vBAfterCancel = (prodAfterCancel as any).variants.find((v: any) => String(v._id) === String(vB._id));
    const cancelled = await Sale.findById(sale2.id).lean();
    check("Sale deducts then cancel restores", deducted && vBAfterCancel.stockQuantity === stockB0,
      `stock ${stockB0} → ${vBAfterSale.stockQuantity} → ${vBAfterCancel.stockQuantity}`);
    check("Cancelled sale flagged", (cancelled as any).saleStatus === "Cancelled", `status ${(cancelled as any).saleStatus}`);

    // ---- TEST 5: insufficient stock is rejected -------------------------
    let rejected = false;
    try {
      await createSale(ownerId, {
        customerName: "Over sell",
        customerPhone: "",
        items: [{ productId: String(target._id), variantId: String(vA._id), quantity: 9999 }],
        discount: 0,
        paymentMethod: "Cash",
        paymentStatus: "Pending",
        notes: "Automated oversell test",
      });
    } catch {
      rejected = true;
    }
    check("Overselling is blocked", rejected, rejected ? "sale rejected as expected" : "ERROR: sale went through");

    // =====================================================================
    // CLEANUP — remove test data, restore stock to seeded quantities
    // =====================================================================
    console.log("\nCleaning up test data…");
    await Sale.deleteMany({ _id: { $in: [sale1.id, sale2.id] } });

    const afterIds = new Set(
      (await InventoryMovement.find({}, "_id").lean() as any[]).map((d) => String(d._id)),
    );
    const beforeIds = new Set(
      (await InventoryMovement.find({ createdAt: { $lt: testStart } }, "_id").lean() as any[]).map(
        (d) => String(d._id),
      ),
    );
    const testMovementIds = [...afterIds].filter((id) => !beforeIds.has(id));
    if (testMovementIds.length) {
      await InventoryMovement.deleteMany({ _id: { $in: testMovementIds } });
    }
    console.log(`  removed ${testMovementIds.length} test inventory movements`);

    for (const [variantId, qty] of snapshot) {
      await Product.updateOne(
        { "variants._id": variantId },
        { $set: { "variants.$.stockQuantity": qty } },
      );
    }
    console.log("  restored all variant stock to seeded quantities");

    // Verify stock is back to the snapshot.
    const verify = await Product.find({}).lean();
    let stockOk = true;
    for (const prod of verify as any[]) {
      for (const v of prod.variants) {
        if (snapshot.has(String(v._id)) && snapshot.get(String(v._id)) !== v.stockQuantity) stockOk = false;
      }
    }
    check("Stock fully restored after cleanup", stockOk, stockOk ? "all variants match seed" : "MISMATCH");

    // ---- Report ----------------------------------------------------------
    const passed = results.filter((r) => r.ok).length;
    const failed = results.length - passed;
    console.log("\n" + "=".repeat(60));
    console.log(`TEST REPORT: ${passed} passed, ${failed} failed`);
    console.log("=".repeat(60));
    if (failed > 0) {
      console.log("\nFailures:");
      results.filter((r) => !r.ok).forEach((r) => console.log(`  ✗ ${r.name} — ${r.detail}`));
      process.exitCode = 1;
    } else {
      console.log("\nAll systems operational ✓");
    }

    const finalProducts = await Product.countDocuments({});
    const finalSales = await Sale.countDocuments({});
    console.log(`\nFinal state: ${finalProducts} products, ${finalSales} sales (clean).`);
  } finally {
    await disconnect(mongoose);
  }
}

main().catch((e) => {
  console.error("\nFATAL:", e instanceof Error ? e.message : e);
  process.exit(1);
});