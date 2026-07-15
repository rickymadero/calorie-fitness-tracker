import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      elevated,
      padding = "md",
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={`rounded-apex-lg border border-border ${elevated ? "bg-card-elevated shadow-apex-lg" : "bg-card shadow-apex"} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = "Card";
