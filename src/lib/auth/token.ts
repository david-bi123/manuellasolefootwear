import { jwtVerify } from "jose";

export const SESSION_COOKIE = "msf_session";

export function sessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Add a 32+ character random value to your environment.",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Verifies the cookie signature only (no database access). Safe for middleware. */
export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { issuer: "manuella-sole" });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
