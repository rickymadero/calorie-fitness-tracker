"use client";

import { useMemo } from "react";
import Link from "next/link";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function HelpSettingsPage() {
  const { t } = useAppTranslation("settings");

  const faqs = useMemo(() => {
    const raw = t("help.faqItems", { returnObjects: true });
    if (!Array.isArray(raw)) return [];
    return raw as { q: string; a: string }[];
  }, [t]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg pb-8">
      <SettingsBackHeader title={t("help.title")} href="/profile" />

      <div className="mb-6 rounded-2xl border border-border bg-muted-bg/40 px-4 py-5">
        <EvolveLogo href="/feed" size="sm" />
        <p className="mt-3 text-sm text-muted">{t("help.intro")}</p>
        <a
          href="mailto:support@evolve.fitness?subject=Evolve%20Support"
          className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent"
        >
          support@evolve.fitness
        </a>
      </div>

      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
        {t("help.faq")}
      </h2>
      <ul className="mt-3 space-y-3">
        {faqs.map((item) => (
          <li
            key={item.q}
            className="rounded-2xl border border-border px-4 py-3"
          >
            <p className="text-sm font-semibold">{item.q}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.a}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 text-sm">
        <Link href="/settings/about" className="block font-medium text-accent">
          {t("help.aboutLink")}
        </Link>
        <Link href="/settings/privacy" className="block font-medium text-accent">
          {t("help.privacyLink")}
        </Link>
      </div>
    </div>
  );
}
