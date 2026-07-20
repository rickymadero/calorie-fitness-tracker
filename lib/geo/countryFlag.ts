/** ISO 3166-1 alpha-2 → flag emoji + display name helpers */

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  GB: "United Kingdom",
  IE: "Ireland",
  FR: "France",
  DE: "Germany",
  ES: "Spain",
  IT: "Italy",
  PT: "Portugal",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  BR: "Brazil",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  AU: "Australia",
  NZ: "New Zealand",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  SG: "Singapore",
  PH: "Philippines",
  TH: "Thailand",
  VN: "Vietnam",
  ID: "Indonesia",
  MY: "Malaysia",
  ZA: "South Africa",
  NG: "Nigeria",
  KE: "Kenya",
  EG: "Egypt",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IL: "Israel",
  TR: "Turkey",
  RU: "Russia",
  UA: "Ukraine",
  CZ: "Czechia",
  GR: "Greece",
  HU: "Hungary",
  RO: "Romania",
  CR: "Costa Rica",
  PA: "Panama",
  PR: "Puerto Rico",
};

/** Readable country list for profile editor */
export const COUNTRY_OPTIONS = Object.entries(COUNTRY_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_NAMES).map(([code, name]) => [
    name.toLowerCase(),
    code,
  ]),
);

/** Extra aliases (auth country field, cities) */
const ALIASES: Record<string, string> = {
  usa: "US",
  "united states of america": "US",
  america: "US",
  uk: "GB",
  "great britain": "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "south korea": "KR",
  korea: "KR",
  "republic of korea": "KR",
  brasil: "BR",
  "u.s.": "US",
  "u.s.a.": "US",
};

export function countryName(code?: string | null): string | undefined {
  if (!code) return undefined;
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

export function flagEmoji(code?: string | null): string | undefined {
  const cc = normalizeCountryCode(code);
  if (!cc || cc.length !== 2) return undefined;
  const A = 0x1f1e6;
  const chars = [...cc.toUpperCase()];
  if (
    chars.length !== 2 ||
    chars[0]! < "A" ||
    chars[0]! > "Z" ||
    chars[1]! < "A" ||
    chars[1]! > "Z"
  ) {
    return undefined;
  }
  return String.fromCodePoint(
    A + (chars[0]!.charCodeAt(0) - 65),
    A + (chars[1]!.charCodeAt(0) - 65),
  );
}

export function normalizeCountryCode(
  input?: string | null,
): string | undefined {
  if (!input) return undefined;
  const raw = input.trim();
  if (!raw) return undefined;
  if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase();
  const lower = raw.toLowerCase();
  if (ALIASES[lower]) return ALIASES[lower];
  if (NAME_TO_CODE[lower]) return NAME_TO_CODE[lower];
  return undefined;
}

/** Infer ISO code from free-text location like "Austin, TX" or "Miami, FL". */
export function inferCountryCodeFromLocation(
  location?: string | null,
): string | undefined {
  if (!location) return undefined;
  const lower = location.toLowerCase();
  // US state abbreviations / common city patterns
  if (
    /\b(tx|ca|ny|fl|co|or|wa|az|il|ma|ga|nc|pa|oh|mi|nj|va|tn|mo|in|wi|mn|md|sc|al|la|ky|ok|ct|ut|ia|nv|ar|ms|ks|nm|ne|wv|id|hi|nh|me|ri|mt|de|sd|nd|ak|vt|wy)\b/.test(
      lower,
    ) ||
    /\b(austin|denver|miami|portland|seattle|boulder|nyc|los angeles|chicago)\b/.test(
      lower,
    )
  ) {
    return "US";
  }
  return normalizeCountryCode(location);
}
