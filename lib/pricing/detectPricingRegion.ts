import { normalizeCountryCode } from "@/lib/geo/countryFlag";
import {
  isPricingRegion,
  pricingRegionFromCountryCode,
  type PricingRegion,
  type PricingRegionSource,
} from "@/lib/pricing/regions";

const TZ_TO_REGION: Record<string, PricingRegion> = {
  "America/Mexico_City": "MX",
  "America/Cancun": "MX",
  "America/Merida": "MX",
  "America/Monterrey": "MX",
  "America/Matamoros": "MX",
  "America/Mazatlan": "MX",
  "America/Chihuahua": "MX",
  "America/Ojinaga": "MX",
  "America/Hermosillo": "MX",
  "America/Tijuana": "MX",
  "America/Bahia_Banderas": "MX",
  "America/Ciudad_Juarez": "MX",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "America/Detroit": "US",
  "America/Indiana/Indianapolis": "US",
  "America/Boise": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "Europe/London": "GB",
  "Europe/Dublin": "EU",
  "Europe/Paris": "EU",
  "Europe/Berlin": "EU",
  "Europe/Madrid": "EU",
  "Europe/Rome": "EU",
  "Europe/Amsterdam": "EU",
  "America/Sao_Paulo": "LATAM",
  "America/Buenos_Aires": "LATAM",
  "America/Argentina/Buenos_Aires": "LATAM",
  "America/Bogota": "LATAM",
  "America/Lima": "LATAM",
  "America/Santiago": "LATAM",
};

export interface DetectPricingRegionInput {
  /** Explicit saved billing/pricing region (settings or localStorage). */
  savedRegion?: string | null;
  savedSource?: PricingRegionSource | null;
  /** Profile / social country (ISO or name). */
  country?: string | null;
  /** navigator.language / Intl locale, e.g. en-MX */
  browserLocales?: string[];
  /** Intl resolved timezone */
  timeZone?: string | null;
}

export interface DetectPricingRegionResult {
  region: PricingRegion;
  source: PricingRegionSource;
  /** Which priority step resolved the region */
  reason:
    | "saved_manual"
    | "saved_region"
    | "country"
    | "browser_locale"
    | "timezone"
    | "default";
}

function regionFromLocaleTag(tag: string): PricingRegion | null {
  const parts = tag.replace("_", "-").split("-");
  if (parts.length < 2) return null;
  const regionPart = parts[parts.length - 1];
  if (!regionPart || regionPart.length !== 2) return null;
  if (!/^[A-Za-z]{2}$/.test(regionPart)) return null;
  return pricingRegionFromCountryCode(regionPart.toUpperCase());
}

function regionFromTimezone(tz: string | null | undefined): PricingRegion | null {
  if (!tz) return null;
  if (TZ_TO_REGION[tz]) return TZ_TO_REGION[tz];
  if (tz.startsWith("America/Mexico")) return "MX";
  if (tz.startsWith("America/Argentina")) return "LATAM";
  if (tz.startsWith("Europe/") && tz !== "Europe/London") return "EU";
  return null;
}

/**
 * Resolve pricing region. Language is never used for currency.
 * Manual saved region always wins.
 *
 * Browser tags like `en-US` often mean UI language, not residence (common for
 * English speakers in Mexico). Prefer timezone over locale-region when both exist.
 */
export function detectPricingRegion(
  input: DetectPricingRegionInput = {},
): DetectPricingRegionResult {
  const saved = input.savedRegion?.trim();
  if (saved && isPricingRegion(saved)) {
    if (input.savedSource === "manual") {
      return { region: saved, source: "manual", reason: "saved_manual" };
    }
    return { region: saved, source: "auto", reason: "saved_region" };
  }

  const fromCountry = pricingRegionFromCountryCode(
    normalizeCountryCode(input.country) ?? input.country,
  );
  if (fromCountry) {
    return { region: fromCountry, source: "auto", reason: "country" };
  }

  const tz =
    input.timeZone !== undefined
      ? input.timeZone
      : typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : null;
  const fromTz = regionFromTimezone(tz);
  if (fromTz) {
    return { region: fromTz, source: "auto", reason: "timezone" };
  }

  const locales =
    input.browserLocales !== undefined
      ? input.browserLocales
      : typeof navigator !== "undefined"
        ? [...(navigator.languages ?? []), navigator.language].filter(Boolean)
        : [];

  for (const tag of locales) {
    const fromLocale = regionFromLocaleTag(String(tag));
    if (fromLocale) {
      return { region: fromLocale, source: "auto", reason: "browser_locale" };
    }
  }

  return { region: "DEFAULT", source: "auto", reason: "default" };
}
