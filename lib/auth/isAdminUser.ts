/** Client/server admin allowlist for /admin tools (no DB role column yet). */

export function isAdminUser(user: { email?: string | null } | null): boolean {
  if (!user?.email) return false;
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) {
    // Deny by default in production until an allowlist is configured.
    return process.env.NODE_ENV !== "production";
  }
  return allowed.includes(user.email.trim().toLowerCase());
}
