/**
 * Share-card location formatting — city/region only, never invent or
 * expose precise coordinates / private street addresses as-is for Stories.
 */

/** Reject strings that look like lat/lng or raw GPS. */
function looksLikeCoordinates(value: string): boolean {
  const v = value.trim();
  if (/^-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/.test(v)) return true;
  if (/^-?\d+(\.\d+)?\s*°/.test(v)) return true;
  if (/^\s*\d+\.\d+\s+\d+\.\d+\s*$/.test(v)) return true;
  return false;
}

/**
 * Returns an uppercase display label, or null when the row should be hidden.
 */
export function formatShareLocationLabel(
  raw?: string | null,
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  if (looksLikeCoordinates(trimmed)) return null;
  // Street-ish lines with house numbers — prefer not to put on Stories.
  if (/^\d{1,6}\s+\S+/.test(trimmed) && /,/.test(trimmed) === false) {
    // e.g. "123 Main St" without city — hide
    if (/\b(st|street|ave|avenue|rd|road|blvd|lane|ln|dr|drive)\b/i.test(trimmed)) {
      return null;
    }
  }
  return trimmed.toUpperCase();
}
