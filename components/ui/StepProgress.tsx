interface StepProgressProps {
  current: number;
  total: number;
  label?: string;
}

export function StepProgress({ current, total, label }: StepProgressProps) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-muted">
          {label ?? `Step ${current + 1} of ${total}`}
        </span>
        <span className="text-muted">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ring-track">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
