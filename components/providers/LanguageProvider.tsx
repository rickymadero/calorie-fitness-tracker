"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import {
  applyDocumentLang,
  ensureI18n,
  i18n,
  LANGUAGE_META,
  type I18nLocale,
  STORAGE_KEY,
} from "@/lib/i18n/i18n";

interface LanguageContextValue {
  locale: string;
  setLocale: (code: string) => void;
  ready: boolean;
  languages: typeof LANGUAGE_META;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function LanguageBridge({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const [locale, setLocaleState] = useState(i18nInstance.language || "en");

  useEffect(() => {
    const onChange = (lng: string) => {
      setLocaleState(lng);
      applyDocumentLang(lng);
    };
    onChange(i18nInstance.language);
    i18nInstance.on("languageChanged", onChange);
    return () => {
      i18nInstance.off("languageChanged", onChange);
    };
  }, [i18nInstance]);

  const setLocale = useCallback(
    (code: string) => {
      const next = LANGUAGE_META.some((l) => l.code === code) ? code : "en";
      void i18nInstance.changeLanguage(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      applyDocumentLang(next);
    },
    [i18nInstance],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      ready: true,
      languages: LANGUAGE_META,
    }),
    [locale, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void ensureI18n().then(() => {
      applyDocumentLang(i18n.language);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return <div className="min-h-dvh bg-background" />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageBridge>{children}</LanguageBridge>
    </I18nextProvider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Convenience: combine Language context + i18next t */
export function useAppTranslation(ns?: string | string[]) {
  const lang = useLanguage();
  const { t, i18n: i18nInstance } = useTranslation(ns);
  return { ...lang, t, i18n: i18nInstance };
}

export type { I18nLocale };
