import { createHash, randomBytes } from "crypto";

export function createInvitationToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}
