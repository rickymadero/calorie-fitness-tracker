"use client";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  value,
  max,
  size = 160,
  strokeWidth = 10,
  label,
  sublabel,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = circumference * (1 - pct);
  const remaining = Math.max(0, max - value);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label ? (
          <>
            <span className="font-display text-3xl font-bold tracking-tight">{label}</span>
            {sublabel && <span className="mt-0.5 text-xs text-muted">{sublabel}</span>}
          </>
        ) : (
          <>
            <span className="font-display text-3xl font-bold tracking-tight">
              {remaining}
            </span>
            <span className="mt-0.5 text-xs text-muted">kcal left</span>
          </>
        )}
      </div>
    </div>
  );
}
