"use client";

export type SecondaryMetricItem = {
  key: string;
  label: string;
  value: string;
  hint?: string;
};

export function SecondaryMetricsGrid({
  items,
}: {
  items: SecondaryMetricItem[];
}) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border border-border bg-card px-3 py-3 text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {item.label}
          </p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums leading-tight">
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-0.5 text-[10px] text-muted">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
