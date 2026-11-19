/**
 * Shared helpers for the maintenance scripts in this folder.
 *
 * tsx does not load .env files automatically, so every script calls
 * `loadEnv()` first. Node 20.6+ ships `process.loadEnvFile`, which reads
 * .env.local (falling back to .env) without any extra dependency.
 */
import { resolve } from "node:path";

export function loadEnv() {
  const cwd = process.cwd();
  for (const name of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(resolve(cwd, name));
      return;
    } catch {
      // try the next candidate
    }
  }
}

export async function connectForScript() {
  const { connectDB } = await import("@/lib/db");
  await connectDB();
  const mongoose = (await import("mongoose")).default;
  return mongoose;
}

export async function disconnect(mongoose: { connection: { close: () => Promise<void> } }) {
  await mongoose.connection.close();
}