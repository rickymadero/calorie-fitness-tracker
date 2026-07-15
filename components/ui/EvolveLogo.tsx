import Link from "next/link";

/**
 * Evolve logo — wordmark with a clean accent line cutting through the letters.
 */
export function EvolveLogo({
  href = "/",
  size = "md",
  light,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  /** Invert for dark / photo backgrounds */
  light?: boolean;
}) {
  const dims = {
    sm: { type: "text-lg", line: "h-[2px] top-[55%]", track: "tracking-[0.18em]" },
    md: { type: "text-2xl", line: "h-[2.5px] top-[55%]", track: "tracking-[0.2em]" },
    lg: { type: "text-4xl", line: "h-[3px] top-[54%]", track: "tracking-[0.22em]" },
  }[size];

  const ink = light ? "text-white" : "text-foreground";
  const line = light ? "bg-white" : "bg-foreground";
  const soft = light ? "bg-white/35" : "bg-foreground/25";

  return (
    <Link
      href={href}
      className="group inline-flex items-center"
      aria-label="Evolve home"
    >
      <span className="relative inline-block">
        <span
          className={`relative z-[1] font-display font-black uppercase ${dims.type} ${dims.track} ${ink}`}
        >
          Evolve
        </span>
        {/* Cool strike line through the wordmark */}
        <span
          className={`pointer-events-none absolute left-[-4%] right-[-4%] ${dims.line} z-[2] overflow-hidden rounded-full`}
          aria-hidden
        >
          <span className={`absolute inset-0 ${soft}`} />
          <span
            className={`absolute inset-y-0 left-0 w-full origin-left scale-x-100 ${line} transition duration-500 group-hover:scale-x-110`}
            style={{
              background: light
                ? "linear-gradient(90deg, transparent 0%, #fff 12%, #fff 88%, transparent 100%)"
                : "linear-gradient(90deg, transparent 0%, var(--foreground) 12%, var(--foreground) 88%, transparent 100%)",
            }}
          />
          {/* Accent tip on the line */}
          <span className="absolute inset-y-0 right-[8%] w-[18%] rounded-full bg-accent" />
        </span>
      </span>
    </Link>
  );
}
