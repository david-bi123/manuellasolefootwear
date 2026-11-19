/**
 * Database + environment sanity check.
 *
 * Usage:
 *   npm run test:db
 *
 * Verifies that the app can connect to MongoDB and that every model loads,
 * then prints a short report. Exits non-zero on failure so it is CI friendly.
 */
import { loadEnv, connectForScript, disconnect } from "./_env";

loadEnv();

type Check = { name: string; ok: boolean; detail: string };

async function main() {
  const checks: Check[] = [];

  const hasUri = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());
  checks.push({
    name: "MONGODB_URI",
    ok: hasUri,
    detail: hasUri ? "configured" : "missing — add it to .env.local",
  });

  const secret = process.env.SESSION_SECRET ?? "";
  checks.push({
    name: "SESSION_SECRET",
    ok: secret.length >= 32,
    detail: secret.length >= 32 ? "configured (32+ chars)" : "missing or too short",
  });

  if (!hasUri) {
    report(checks);
    process.exit(1);
  }

  const mongoose = await connectForScript();
  try {
    checks.push({ name: "MongoDB connection", ok: mongoose.connection.readyState === 1, detail: "connected" });

    // Import every model so its schema compiles.
    await Promise.all([
      import("@/lib/models/admin"),
      import("@/lib/models/category"),
      import("@/lib/models/product"),
      import("@/lib/models/sale"),
      import("@/lib/models/inventory-movement"),
      import("@/lib/models/counter"),
      import("@/lib/models/settings"),
    ]);
    checks.push({ name: "Models", ok: true, detail: "all schemas loaded" });

    const { Admin } = await import("@/lib/models/admin");
    const { Product } = await import("@/lib/models/product");
    const { BusinessSettings } = await import("@/lib/models/settings");

    const [admins, products, settings] = await Promise.all([
      Admin.countDocuments(),
      Product.countDocuments(),
      BusinessSettings.countDocuments(),
    ]);

    checks.push({
      name: "Admin accounts",
      ok: true,
      detail: `${admins} account(s)${admins === 0 ? " — run npm run create-owner" : ""}`,
    });
    checks.push({
      name: "Products",
      ok: true,
      detail: `${products} product(s)${products === 0 ? " — run npm run seed" : ""}`,
    });
    checks.push({ name: "Settings", ok: true, detail: `${settings} settings document(s)` });
  } finally {
    await disconnect(mongoose);
  }

  report(checks);
  const failed = checks.some((check) => !check.ok);
  process.exit(failed ? 1 : 0);
}

function report(checks: Check[]) {
  console.log("\nManuella Sole — environment check\n");
  for (const check of checks) {
    const icon = check.ok ? "\u2713" : "\u2717";
    console.log(`  ${icon} ${check.name.padEnd(22)} ${check.detail}`);
  }
  console.log("");
}

main().catch((error) => {
  console.error("\n✗ Check failed:", error instanceof Error ? error.message : error, "\n");
  process.exit(1);
});