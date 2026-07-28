/**
 * Fixed regional Pro prices. Language formats labels/numbers; region picks currency.
 * CA / GB / EU / LATAM use USD list prices until regional amounts are approved.
 */

export type PricingRegion =
  | "MX"
  | "US"
  | "CA"
  | "GB"
  | "EU"
  | "LATAM"
  | "DEFAULT";

export type PricingRegionSource = "manual" | "auto";

export interface RegionalPlanPrice {
  currency: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthlyEquivalent: number;
  /** Region is configured but still charged/shown with USD list prices. */
  temporaryUsdFallback?: boolean;
}

/** Official USD list (also DEFAULT and temporary fallbacks). */
export const USD_PRO_PRICE: RegionalPlanPrice = {
  currency: "USD",
  monthlyPrice: 12.99,
  annualPrice: 95.88,
  annualMonthlyEquivalent: 7.99,
};

export const PRO_PRICING: Record<PricingRegion, RegionalPlanPrice> = {
  MX: {
    currency: "MXN",
    monthlyPrice: 249,
    annualPrice: 1788,
    annualMonthlyEquivalent: 149,
  },
  US: { ...USD_PRO_PRICE },
  CA: { ...USD_PRO_PRICE, temporaryUsdFallback: true },
  GB: { ...USD_PRO_PRICE, temporaryUsdFallback: true },
  EU: { ...USD_PRO_PRICE, temporaryUsdFallback: true },
  LATAM: { ...USD_PRO_PRICE, temporaryUsdFallback: true },
  DEFAULT: { ...USD_PRO_PRICE },
};

export const PRICING_REGION_META: Record<
  PricingRegion,
  { labelKey: string; englishName: string }
> = {
  MX: { labelKey: "regions.MX", englishName: "Mexico" },
  US: { labelKey: "regions.US", englishName: "United States" },
  CA: { labelKey: "regions.CA", englishName: "Canada" },
  GB: { labelKey: "regions.GB", englishName: "United Kingdom" },
  EU: { labelKey: "regions.EU", englishName: "Eurozone" },
  LATAM: { labelKey: "regions.LATAM", englishName: "Latin America" },
  DEFAULT: { labelKey: "regions.DEFAULT", englishName: "International" },
};

const EU_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

const LATAM_COUNTRY_CODES = new Set([
  "AR",
  "BO",
  "BR",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "SV",
  "GT",
  "HN",
  "NI",
  "PA",
  "PY",
  "PE",
  "UY",
  "VE",
  "PR",
]);

export function isPricingRegion(value: unknown): value is PricingRegion {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PRO_PRICING, value)
  );
}

export function getRegionalPlanPrice(region: PricingRegion): RegionalPlanPrice {
  return PRO_PRICING[region] ?? PRO_PRICING.DEFAULT;
}

/** Map ISO country → pricing region (architecture ready for future CAD/GBP/EUR). */
export function pricingRegionFromCountryCode(
  countryCode: string | null | undefined,
): PricingRegion | null {
  if (!countryCode) return null;
  const cc = countryCode.trim().toUpperCase();
  if (cc.length !== 2) return null;
  if (cc === "MX") return "MX";
  if (cc === "US") return "US";
  if (cc === "CA") return "CA";
  if (cc === "GB") return "GB";
  if (EU_COUNTRY_CODES.has(cc)) return "EU";
  if (LATAM_COUNTRY_CODES.has(cc)) return "LATAM";
  return null;
}

export function savingsPercent(region: PricingRegion = "US"): number {
  const p = getRegionalPlanPrice(region);
  if (p.monthlyPrice <= 0) return 0;
  return Math.round((1 - p.annualMonthlyEquivalent / p.monthlyPrice) * 100);
}
