import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: Cache | undefined;
}

const cache: Cache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cache;

export function isDatabaseConfigured() {
  return Boolean(MONGODB_URI && MONGODB_URI.trim().length > 0);
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Add your MongoDB Atlas connection string to .env.local.",
    );
  }

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    // NOTE: sanitizeFilter is intentionally disabled. In Mongoose 9 it corrupts
    // legitimate operator queries on ObjectId paths ($in / $ne / $elemMatch /
    // $gte), which breaks core flows such as recording a sale. All user input is
    // validated with Zod (strict objectId regex, enums, clamped numbers) before
    // it reaches any query, so query-selector injection is already prevented.
    mongoose.set("sanitizeFilter", false);
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export function isTransactionUnsupportedError(error: unknown) {  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Transaction numbers are only allowed") ||
    message.includes("Transactions are not supported") ||
    message.includes("replica set") ||
    message.includes("mongos")
  );
}

/**
 * Runs `work` in a MongoDB transaction when the deployment supports it (replica
 * set / Atlas). Standalone servers transparently fall back to the same callback
 * executed with `session = null`; callers must therefore perform their own
 * compensation in that mode.
 */
export async function runWithTransaction<T>(
  work: (session: mongoose.ClientSession | null) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T | undefined;
    let completed = false;
    await session.withTransaction(async () => {
      result = await work(session);
      completed = true;
    });
    if (!completed) throw new Error("The transaction could not be committed.");
    return result as T;
  } catch (error) {
    if (isTransactionUnsupportedError(error)) {
      return work(null);
    }
    throw error;
  } finally {
    await session.endSession();
  }
}
