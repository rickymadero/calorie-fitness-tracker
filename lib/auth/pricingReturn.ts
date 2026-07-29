/**
 * Safe in-app path only. Blocks protocol-relative (`//evil.com`) and absolute URLs.
 */
export function safeAppPath(
  raw: string | null | undefined,
  fallback = "/feed",
): string {
  if (!raw) return fallback;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("://")) return fallback;
  return path;
}

/** Safe in-app return path after pricing / plan selection. */
export function safeReturnPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const path = safeAppPath(raw, "");
  if (!path || path.startsWith("/pricing")) return null;
  return path;
}

/** Build /pricing URL that returns the user to `returnTo` after choosing a plan. */
export function pricingHref(returnTo?: string | null): string {
  const next = safeReturnPath(returnTo);
  if (!next) return "/pricing";
  return `/pricing?next=${encodeURIComponent(next)}`;
}
