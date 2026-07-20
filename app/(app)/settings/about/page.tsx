"use client";

import Link from "next/link";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function AboutSettingsPage() {
  const { t } = useAppTranslation(["common", "settings"]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg pb-8">
      <SettingsBackHeader title={t("about.title", { ns: "settings" })} href="/profile" />

      <div className="rounded-2xl border border-border bg-gradient-to-b from-accent-soft/40 to-transparent px-5 py-8 text-center">
        <div className="flex justify-center">
          <EvolveLogo href="/feed" size="md" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {t("about.body", { ns: "settings" })}
        </p>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted">
          {t("about.version", { ns: "settings" })}
        </p>
      </div>

      <ul className="mt-6 space-y-2 text-sm">
        <li>
          <Link
            href="/settings/help"
            className="flex min-h-11 items-center rounded-2xl border border-border px-4 font-medium transition hover:border-accent/40 hover:text-accent"
          >
            {t("about.helpLink", { ns: "settings" })}
          </Link>
        </li>
        <li>
          <a
            href="mailto:hello@evolve.fitness"
            className="flex min-h-11 items-center rounded-2xl border border-border px-4 font-medium transition hover:border-accent/40 hover:text-accent"
          >
            {t("about.contact", { ns: "settings" })}
          </a>
        </li>
        <li>
          <Link
            href="/pricing"
            className="flex min-h-11 items-center rounded-2xl border border-border px-4 font-medium transition hover:border-accent/40 hover:text-accent"
          >
            {t("about.plans", { ns: "settings" })}
          </Link>
        </li>
      </ul>

      <p className="mt-8 text-center text-xs text-muted">
        {t("about.tagline", { ns: "settings" })}
      </p>
    </div>
  );
}
