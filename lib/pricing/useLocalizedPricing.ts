"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { detectPricingRegion } from "@/lib/pricing/detectPricingRegion";
import {
  displayLocaleFromLanguage,
  formatPlanPrice,
} from "@/lib/pricing/formatPlanPrice";
import {
  getRegionalPlanPrice,
  PRICING_REGION_META,
  savingsPercent,
  type PricingRegion,
} from "@/lib/pricing/regions";

function subscribeNoop() {
  return () => {};
}

/** False during SSR; true in the browser after hydration. */
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export interface LocalizedPricing {
  region: PricingRegion;
  currency: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthlyEquivalent: number;
  temporaryUsdFallback: boolean;
  formattedMonthly: string;
  formattedAnnual: string;
  formattedAnnualMonthly: string;
  savingsPct: number;
  regionLabel: string;
  displayLocale: string;
}

/**
 * Automatic Pro pricing by region (timezone / country / locale).
 * No manual region picker — Mexico → MXN, United States → USD.
 */
export function useLocalizedPricing(): LocalizedPricing {
  const { user } = useAuth();
  const { myProfile } = useSocial();
  const { t, locale } = useAppTranslation("pricing");
  const clientReady = useIsClient();

  const displayLocale = displayLocaleFromLanguage(locale);
  const countryHint = myProfile?.countryCode || user?.country || null;

  const resolved = useMemo(() => {
    const browserLocales =
      clientReady && typeof navigator !== "undefined"
        ? ([...(navigator.languages ?? []), navigator.language].filter(
            Boolean,
          ) as string[])
        : [];

    const timeZone =
      clientReady && typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : null;

    return detectPricingRegion({
      country: countryHint,
      browserLocales,
      timeZone,
    });
  }, [countryHint, clientReady]);

  const price = getRegionalPlanPrice(resolved.region);

  const regionLabel = t(PRICING_REGION_META[resolved.region].labelKey, {
    defaultValue: PRICING_REGION_META[resolved.region].englishName,
  });

  return {
    region: resolved.region,
    currency: price.currency,
    monthlyPrice: price.monthlyPrice,
    annualPrice: price.annualPrice,
    annualMonthlyEquivalent: price.annualMonthlyEquivalent,
    temporaryUsdFallback: Boolean(price.temporaryUsdFallback),
    formattedMonthly: formatPlanPrice({
      amount: price.monthlyPrice,
      currency: price.currency,
      displayLocale,
    }),
    formattedAnnual: formatPlanPrice({
      amount: price.annualPrice,
      currency: price.currency,
      displayLocale,
    }),
    formattedAnnualMonthly: formatPlanPrice({
      amount: price.annualMonthlyEquivalent,
      currency: price.currency,
      displayLocale,
    }),
    savingsPct: savingsPercent(resolved.region),
    regionLabel,
    displayLocale,
  };
}
