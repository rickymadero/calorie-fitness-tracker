/**
 * Static Evolve wordmark for share chrome (no navigation).
 * Mirrors EvolveLogo.tsx strike-line treatment.
 */
export function EvolveBranding({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: { type: "text-lg", line: "h-[2px] top-[55%]", track: "tracking-[0.18em]" },
    md: { type: "text-2xl", line: "h-[2.5px] top-[55%]", track: "tracking-[0.2em]" },
    lg: { type: "text-4xl", line: "h-[3px] top-[54%]", track: "tracking-[0.22em]" },
  }[size];

  return (
    <div className="flex items-center justify-center py-1" aria-hidden>
      <span className="relative inline-block">
        <span
          className={`relative z-[1] font-display font-black uppercase text-white ${dims.type} ${dims.track}`}
        >
          Evolve
        </span>
        <span
          className={`pointer-events-none absolute inset-x-0 ${dims.line} z-[2] overflow-hidden rounded-full`}
        >
          <span className="absolute inset-0 bg-white/35" />
          <span
            className="absolute inset-y-0 left-0 w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #fff 12%, #fff 88%, transparent 100%)",
            }}
          />
          <span className="absolute inset-y-0 right-[8%] w-[18%] rounded-full bg-accent" />
        </span>
      </span>
    </div>
  );
}
