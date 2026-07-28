import type { ShareMetric } from "@/lib/share/WorkoutShareModel";

/**
 * Format a share metric for display without duplicating units.
 * If `value` already ends with the unit (e.g. "4:30/km"), return value as-is.
 */
export function formatShareMetricDisplay(metric: ShareMetric): string {
  const value = metric.value.trim();
  const unit = metric.unit?.trim();
  if (!unit) return value;

  const valueLower = value.toLowerCase();
  const unitLower = unit.toLowerCase();
  if (valueLower.endsWith(unitLower)) return value;
  // Also catch "4:30 /km" already containing "/km"
  if (unitLower.startsWith("/") && valueLower.includes(unitLower)) {
    return value;
  }

  if (unit.startsWith("/")) return `${value}${unit}`;
  return `${value} ${unit}`;
}

/** Strip a trailing unit from a formatted string (e.g. "4:30/km" → "4:30"). */
export function stripTrailingUnit(formatted: string, unit: string): string {
  const u = unit.trim();
  if (!u) return formatted.trim();
  const re = new RegExp(
    `\\s*${u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`,
    "i",
  );
  return formatted.trim().replace(re, "");
}
