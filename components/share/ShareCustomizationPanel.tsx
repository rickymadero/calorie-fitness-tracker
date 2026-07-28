import type { AtmosphereTheme } from "@/lib/share/WorkoutShareModel";
import type { HeroMetricKey, ShareMetric } from "@/lib/share/WorkoutShareModel";
import type { AtmosphereId } from "@/lib/share/WorkoutShareModel";

interface ShareCustomizationPanelProps {
  title: string;
  onTitleChange: (v: string) => void;
  availableHeroes: ShareMetric[];
  heroKey: HeroMetricKey;
  onHeroChange: (k: HeroMetricKey) => void;
  atmospheres: AtmosphereTheme[];
  atmosphereId: AtmosphereId;
  onAtmosphereChange: (id: AtmosphereId) => void;
  showDate: boolean;
  showLocation: boolean;
  hasLocation: boolean;
  showRouteContext: boolean;
  hasRoute: boolean;
  onShowDate: (v: boolean) => void;
  onShowLocation: (v: boolean) => void;
  onShowRouteContext: (v: boolean) => void;
  labels: {
    titleField: string;
    heroLabel: string;
    atmosphereLabel: string;
    showDate: string;
    showLocation: string;
    showRouteContext: string;
  };
}

export function ShareCustomizationPanel({
  title,
  onTitleChange,
  availableHeroes,
  heroKey,
  onHeroChange,
  atmospheres,
  atmosphereId,
  onAtmosphereChange,
  showDate,
  showLocation,
  hasLocation,
  showRouteContext,
  hasRoute,
  onShowDate,
  onShowLocation,
  onShowRouteContext,
  labels,
}: ShareCustomizationPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-muted-bg/40 p-3">
      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {labels.titleField}
        </span>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value.slice(0, 48))}
          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent"
        />
      </label>

      {availableHeroes.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {labels.heroLabel}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {availableHeroes.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => onHeroChange(m.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  heroKey === m.key
                    ? "bg-accent text-accent-fg"
                    : "border border-border bg-background text-muted hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {labels.atmosphereLabel}
        </p>
        <div className="mt-1.5 grid grid-cols-5 gap-2">
          {atmospheres.map((a) => (
            <button
              key={a.id}
              type="button"
              title={a.name}
              onClick={() => onAtmosphereChange(a.id)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                atmosphereId === a.id
                  ? "border-accent"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
              style={{
                background: `linear-gradient(160deg, ${a.background[0]}, ${a.background[2]})`,
              }}
            >
              <span
                className="absolute bottom-1 left-1 h-2 w-2 rounded-full"
                style={{ background: a.primaryAccent }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted">
        <Toggle
          checked={showDate}
          onChange={onShowDate}
          label={labels.showDate}
        />
        {hasLocation && (
          <Toggle
            checked={showLocation}
            onChange={onShowLocation}
            label={labels.showLocation}
          />
        )}
        {hasRoute && (
          <Toggle
            checked={showRouteContext}
            onChange={onShowRouteContext}
            label={labels.showRouteContext}
          />
        )}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}
