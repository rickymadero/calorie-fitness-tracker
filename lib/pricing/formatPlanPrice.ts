/**
 * Format Pro plan amounts with Intl — language drives separators/placement,
 * currency code is always explicit to avoid $ ambiguity (USD vs MXN).
 */

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  MXN: "$",
  CAD: "$",
  GBP: "£",
  EUR: "€",
};

function fractionDigits(amount: number, currency: string): number {
  if (currency === "JPY" || currency === "KRW") return 0;
  if (Number.isInteger(amount)) return 0;
  return 2;
}

export function formatPlanPrice({
  amount,
  currency,
  displayLocale,
}: {
  amount: number;
  currency: string;
  displayLocale: string;
}): string {
  const digits = fractionDigits(amount, currency);
  const number = new Intl.NumberFormat(displayLocale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);

  const symbol = CURRENCY_SYMBOL[currency] ?? "";
  if (symbol) {
    return `${symbol}${number} ${currency}`;
  }

  // Fallback: full currency style + ISO code if not already present
  const styled = new Intl.NumberFormat(displayLocale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);

  return styled.includes(currency) ? styled : `${styled} ${currency}`;
}

/** Map app language codes (en, es, pt-BR, …) to a BCP-47 locale for Intl. */
export function displayLocaleFromLanguage(language: string | undefined): string {
  const lang = (language || "en").trim();
  if (!lang) return "en-US";
  if (lang === "en") return "en-US";
  if (lang === "es") return "es-MX";
  if (lang === "pt-BR") return "pt-BR";
  if (lang === "zh-CN") return "zh-CN";
  if (lang === "zh-TW") return "zh-TW";
  return lang;
}
