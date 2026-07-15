import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional back link (mobile-friendly chevron). */
  backHref?: string;
  backLabel?: string;
  /** Trailing actions (buttons, menus). */
  actions?: React.ReactNode;
  /** Make the header stick under the status bar while scrolling. */
  sticky?: boolean;
  className?: string;
}

/**
 * Consistent, mobile-first page chrome used across app screens.
 * Handles safe-area top inset, optional sticky behavior, back nav, and actions.
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  actions,
  sticky = false,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`${
        sticky
          ? "sticky top-0 z-30 -mx-5 border-b border-border/70 bg-background/85 px-5 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl"
          : ""
      } ${className}`}
    >
      {backHref && (
        <Link
          href={backHref}
          className="mb-1 -ml-1 inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ChevronLeft size={18} />
          {backLabel}
        </Link>
      )}
      <div className="flex items-start justify-between gap-3 pb-1">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>
        )}
      </div>
    </div>
  );
}
