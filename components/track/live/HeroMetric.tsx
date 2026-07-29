"use client";

type HeroMetricProps = {
  value: string;
  unit: string;
  label: string;
  paused?: boolean;
};

export function HeroMetric({ value, unit, label, paused }: HeroMetricProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-4 py-8 text-center shadow-apex">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-[4.25rem] font-bold leading-none tracking-tight tabular-nums sm:text-[5rem]">
        {value}
        {unit ? (
          <span className="ml-2 align-baseline text-2xl font-semibold text-muted sm:text-3xl">
            {unit}
          </span>
        ) : null}
      </p>
      {paused ? (
        <p className="mt-3 text-sm font-medium text-accent-dim dark:text-accent">
          Paused
        </p>
      ) : null}
    </div>
  );
}
