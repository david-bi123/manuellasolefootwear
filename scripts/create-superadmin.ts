/**
 * Create (or reset) the Samtech Labs super admin account.
 *
 * The super admin is the platform operator who can pause / resume the site
 * from Admin > Platform. Only super admins can sign in while the site is paused.
 *
 * Usage:
 *   npm run create-superadmin
 *
 * Reads SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD and SUPERADMIN_NAME from .env.local.
 */
import { loadEnv, connectForScript, disconnect } from "./_env";

loadEnv();

async function main() {
  const email = (process.env.SUPERADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD ?? "";
  const name = (process.env.SUPERADMIN_NAME ?? "Samtech Labs").trim();

  if (!email || !password) {
    console.error(
      "Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in .env.local before running this script.",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("SUPERADMIN_PASSWORD must be at least 8 characters.");
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
      existing.role = "superadmin";
      existing.isActive = true;
      existing.invitationStatus = "active";
      existing.invitationTokenHash = undefined;
      existing.invitationExpiresAt = undefined;
      await existing.save();
      console.log(`Super admin account updated: ${email}`);
    } else {
      await Admin.create({
        name,
        email,
        passwordHash,
        role: "superadmin",
        isActive: true,
        invitationStatus: "active",
      });
      console.log(`Super admin account created: ${email}`);
    }
  } finally {
    await disconnect(mongoose);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});