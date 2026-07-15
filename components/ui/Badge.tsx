interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "accent"
    | "success"
    | "warning"
    | "steel"
    | "bronze"
    | "slate";
  className?: string;
}

const variants = {
  default: "bg-muted-bg text-muted",
  accent: "bg-accent-soft text-accent-dim dark:text-accent",
  success: "bg-accent-soft text-accent-dim dark:text-accent",
  warning: "bg-bronze-soft text-bronze-fg",
  steel: "bg-steel-soft text-steel-fg",
  bronze: "bg-bronze-soft text-bronze-fg",
  slate: "bg-slate-soft text-slate-fg",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-transform duration-200 active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
