/**
 * Create (or reset) the client owner account.
 *
 * Usage:
 *   npm run create-owner
 *
 * Reads OWNER_EMAIL, OWNER_PASSWORD and OWNER_NAME from .env.local.
 */
import { loadEnv, connectForScript, disconnect } from "./_env";

loadEnv();

async function main() {
  const email = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD ?? "";
  const name = (process.env.OWNER_NAME ?? "Manuella Owner").trim();

  if (!email || !password) {
    console.error("Set OWNER_EMAIL and OWNER_PASSWORD in .env.local before running this script.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("OWNER_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const mongoose = await connectForScript();
  try {
    const { Admin } = await import("@/lib/models/admin");
    const { hashPassword } = await import("@/lib/auth/password");

    const existing = await Admin.findOne({ email });
    const passwordHash = await hashPassword(password);

    if (existing) {
      existing.name = name;
      existing.passwordHash = passwordHash;
      existing.role = "owner";
      existing.isActive = true;
      existing.invitationStatus = "active";
      existing.invitationTokenHash = undefined;
      existing.invitationExpiresAt = undefined;
      await existing.save();
      console.log(`Owner account updated: ${email}`);
    } else {
      await Admin.create({
        name,
        email,
        passwordHash,
        role: "owner",
        isActive: true,
        invitationStatus: "active",
      });
      console.log(`Owner account created: ${email}`);
    }
  } finally {
    await disconnect(mongoose);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});