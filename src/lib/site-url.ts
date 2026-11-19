/**
 * Resolves the absolute site URL used for canonical links, OpenGraph tags,
 * sitemap/robots, JSON-LD and WhatsApp deep links.
 *
 * Priority:
 *   1. APP_SITE_URL          — the variable configured in Vercel / .env.local
 *   2. NEXT_PUBLIC_SITE_URL  — legacy name, kept for backwards compatibility
 *   3. VERCEL_URL            — auto-provided by Vercel for each deployment
 *   4. http://localhost:3000 — local development fallback
 */
export function getSiteUrl() {
  const candidates = [
    process.env.APP_SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];
  const url = candidates.find((value) => value && value.trim().length > 0);
  return (url ?? "http://localhost:3000").trim().replace(/\/$/, "");
}

/** True when a real site URL is configured (i.e. not the localhost fallback). */
export function isSiteUrlConfigured() {
  return Boolean(
    process.env.APP_SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      process.env.VERCEL_URL?.trim(),
  );
}
