"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

interface PageHeaderProps {
  title?: string;
  /** Custom title content (e.g. brand logo) — replaces the text title when set */
  titleContent?: React.ReactNode;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

/**
 * Mobile page chrome. Sticky stays transparent — opaque bars read as a
 * solid black banner over the page wash in dark mode / mobile preview.
 */
export function PageHeader({
  title,
  titleContent,
  subtitle,
  backHref,
  backLabel,
  actions,
  sticky = false,
  className = "",
}: PageHeaderProps) {
  const { t } = useAppTranslation("common");
  const resolvedBack = backLabel ?? t("buttons.back");

  return (
    <div
      className={`${
        sticky ? "sticky top-0 z-30 min-w-0 max-w-full pt-1" : "min-w-0 max-w-full"
      } ${className}`}
    >
      {backHref && (
        <Link
          href={backHref}
          className="mb-1 -ml-1 inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ChevronLeft size={18} />
          {resolvedBack}
        </Link>
      )}
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="min-w-0 flex-1 overflow-x-hidden">
          {titleContent ? (
            <div className="flex min-h-11 items-center">{titleContent}</div>
          ) : (
            <h1 className="font-display text-[1.625rem] font-bold leading-tight tracking-tight sm:text-3xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="relative z-40 flex shrink-0 items-center gap-2 overflow-visible">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
