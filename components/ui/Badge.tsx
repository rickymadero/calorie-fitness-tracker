interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning";
  className?: string;
}

const variants = {
  default: "bg-muted-bg text-muted",
  accent: "bg-accent-soft text-accent-dim dark:text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
