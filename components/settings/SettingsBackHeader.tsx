"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSwipeBack } from "@/components/nav/swipeGestures";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export function SettingsBackHeader({
  title,
  href = "/profile",
}: {
  title: string;
  href?: string;
}) {
  useSwipeBack(href);
  const { t } = useAppTranslation("common");

  return (
    <div className="mb-5 flex items-center gap-1">
      <Link
        href={href}
        className="evolve-press inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ChevronLeft size={18} />
        {t("buttons.back")}
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-center font-display text-base font-semibold">
        {title}
      </h1>
      <span className="inline-block min-w-11" aria-hidden />
    </div>
  );
}
