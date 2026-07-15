import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

/**
 * Mobile page chrome. No negative horizontal margins — those blew past
 * the 390px iPhone iframe and clipped feed cards on both sides.
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
          ? "sticky top-0 z-30 border-b border-border/70 bg-background/90 pt-1 backdrop-blur-xl"
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
      <div className="flex items-start justify-between gap-3 pb-2">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[1.625rem] font-bold leading-tight tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2 pt-0.5">{actions}</div>
        )}
      </div>
    </div>
  );
}
