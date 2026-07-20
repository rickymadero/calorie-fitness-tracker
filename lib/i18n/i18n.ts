"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../../public/locales/en/common.json";
import enAuth from "../../public/locales/en/auth.json";
import enFeed from "../../public/locales/en/feed.json";
import enProfile from "../../public/locales/en/profile.json";
import enSettings from "../../public/locales/en/settings.json";
import enExplore from "../../public/locales/en/explore.json";
import enSocial from "../../public/locales/en/social.json";
import enPosts from "../../public/locales/en/posts.json";
import enStories from "../../public/locales/en/stories.json";
import enPricing from "../../public/locales/en/pricing.json";
import enFood from "../../public/locales/en/food.json";
import enWorkouts from "../../public/locales/en/workouts.json";
import enPlans from "../../public/locales/en/plans.json";
import enProgress from "../../public/locales/en/progress.json";
import enRecipes from "../../public/locales/en/recipes.json";
import enAdmin from "../../public/locales/en/admin.json";

export const I18N_LOCALES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt-BR",
  "ru",
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "hi",
  "ar",
  "tr",
  "vi",
] as const;

export type I18nLocale = (typeof I18N_LOCALES)[number];

export const I18N_NAMESPACES = [
  "common",
  "auth",
  "feed",
  "profile",
  "settings",
  "explore",
  "social",
  "posts",
  "stories",
  "pricing",
  "food",
  "workouts",
  "plans",
  "progress",
  "recipes",
  "admin",
] as const;

export const LANGUAGE_META: {
  code: I18nLocale;
  native: string;
  english: string;
  flag: string;
}[] = [
  { code: "en", native: "English", english: "English", flag: "🇺🇸" },
  { code: "es", native: "Español", english: "Spanish", flag: "🇪🇸" },
  { code: "fr", native: "Français", english: "French", flag: "🇫🇷" },
  { code: "de", native: "Deutsch", english: "German", flag: "🇩🇪" },
  { code: "it", native: "Italiano", english: "Italian", flag: "🇮🇹" },
  {
    code: "pt-BR",
    native: "Português (Brasil)",
    english: "Portuguese",
    flag: "🇧🇷",
  },
  { code: "ru", native: "Русский", english: "Russian", flag: "🇷🇺" },
  {
    code: "zh-CN",
    native: "简体中文",
    english: "Chinese (Simplified)",
    flag: "🇨🇳",
  },
  {
    code: "zh-TW",
    native: "繁體中文",
    english: "Chinese (Traditional)",
    flag: "🇹🇼",
  },
  { code: "ja", native: "日本語", english: "Japanese", flag: "🇯🇵" },
  { code: "ko", native: "한국어", english: "Korean", flag: "🇰🇷" },
  { code: "hi", native: "हिन्दी", english: "Hindi", flag: "🇮🇳" },
  { code: "ar", native: "العربية", english: "Arabic", flag: "🇸🇦" },
  { code: "tr", native: "Türkçe", english: "Turkish", flag: "🇹🇷" },
  { code: "vi", native: "Tiếng Việt", english: "Vietnamese", flag: "🇻🇳" },
];

export const RTL_LOCALES = new Set<string>(["ar"]);

export const STORAGE_KEY = "evolve.settings.language";

const enResources = {
  common: enCommon,
  auth: enAuth,
  feed: enFeed,
  profile: enProfile,
  settings: enSettings,
  explore: enExplore,
  social: enSocial,
  posts: enPosts,
  stories: enStories,
  pricing: enPricing,
  food: enFood,
  workouts: enWorkouts,
  plans: enPlans,
  progress: enProgress,
  recipes: enRecipes,
  admin: enAdmin,
};

async function loadLocaleBundles(lng: string) {
  const results = await Promise.all(
    I18N_NAMESPACES.map(async (ns) => {
      try {
        const res = await fetch(`/locales/${lng}/${ns}.json`, {
          cache: "force-cache",
        });
        if (!res.ok) return null;
        const data = await res.json();
        return [ns, data] as const;
      } catch {
        return null;
      }
    }),
  );
  for (const row of results) {
    if (!row) continue;
    const [ns, data] = row;
    i18n.addResourceBundle(lng, ns, data, true, true);
  }
}

let initPromise: Promise<typeof i18n> | null = null;

export function ensureI18n() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!i18n.isInitialized) {
      await i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources: { en: enResources },
          fallbackLng: "en",
          supportedLngs: [...I18N_LOCALES, "en"],
          ns: [...I18N_NAMESPACES],
          defaultNS: "common",
          interpolation: { escapeValue: false },
          detection: {
            order: ["localStorage", "navigator"],
            lookupLocalStorage: STORAGE_KEY,
            caches: ["localStorage"],
          },
          react: { useSuspense: false },
        });
    }

    await Promise.all(
      I18N_LOCALES.filter((l) => l !== "en").map((lng) =>
        loadLocaleBundles(lng),
      ),
    );

    return i18n;
  })();
  return initPromise;
}

export function applyDocumentLang(lng: string) {
  if (typeof document === "undefined") return;
  const base = lng.split("-")[0];
  document.documentElement.lang = lng;
  document.documentElement.dir = RTL_LOCALES.has(base) || RTL_LOCALES.has(lng)
    ? "rtl"
    : "ltr";
}

export { i18n };
