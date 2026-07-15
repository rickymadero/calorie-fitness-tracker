interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: "accent" | "protein" | "carbs" | "fat";
  size?: "sm" | "md";
  className?: string;
}

const colors = {
  accent: "bg-accent",
  protein: "bg-[#60a5fa]",
  carbs: "bg-[#fbbf24]",
  fat: "bg-[#f472b6]",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue,
  color = "accent",
  size = "md",
  className = "",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="text-muted">
              {Math.round(value)}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-ring-track ${size === "sm" ? "h-1.5" : "h-2.5"}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
