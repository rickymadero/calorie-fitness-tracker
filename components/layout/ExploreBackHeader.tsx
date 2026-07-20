"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSwipeBack } from "@/components/nav/swipeGestures";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

/** Back chrome for EvoFit tool pages — no solid bar over the page wash. */
export function ExploreBackHeader({
  title,
  href = "/explore",
}: {
  title: string;
  href?: string;
}) {
  useSwipeBack(href);
  const { t } = useAppTranslation("common");
  const backToExplore = href === "/explore";

  return (
    <div className="mb-4 flex items-center gap-1">
      <Link
        href={href}
        className="evolve-press inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ChevronLeft size={18} />
        {backToExplore ? t("nav.evofit") : t("buttons.back")}
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-center font-display text-base font-semibold">
        {title}
      </h1>
      <span className="inline-block min-w-11" aria-hidden />
    </div>
  );
}
