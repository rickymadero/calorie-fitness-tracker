import type { ActivityType } from "@/lib/types/posts";

/**
 * Athletic activity colors — muted steel / bronze / green / slate.
 * No pastel rainbow.
 */
export const ACTIVITY_COLORS: Record<
  ActivityType,
  { badge: string; soft: string; ink: string }
> = {
  running: {
    badge: "bg-bronze-soft text-bronze-fg",
    soft: "bg-bronze-soft",
    ink: "text-bronze",
  },
  walking: {
    badge: "bg-slate-soft text-slate-fg",
    soft: "bg-slate-soft",
    ink: "text-slate",
  },
  cycling: {
    badge: "bg-steel-soft text-steel-fg",
    soft: "bg-steel-soft",
    ink: "text-steel",
  },
  swimming: {
    badge: "bg-steel-soft text-steel-fg",
    soft: "bg-steel-soft",
    ink: "text-steel",
  },
  gym: {
    badge: "bg-slate-soft text-slate-fg",
    soft: "bg-slate-soft",
    ink: "text-slate",
  },
  yoga: {
    badge: "bg-accent-soft text-accent-dim dark:text-accent",
    soft: "bg-accent-soft",
    ink: "text-accent-dim dark:text-accent",
  },
  sports: {
    badge: "bg-bronze-soft text-bronze-fg",
    soft: "bg-bronze-soft",
    ink: "text-bronze",
  },
  hiking: {
    badge: "bg-accent-soft text-accent-dim dark:text-accent",
    soft: "bg-accent-soft",
    ink: "text-accent-dim dark:text-accent",
  },
  custom: {
    badge: "bg-muted-bg text-muted",
    soft: "bg-muted-bg",
    ink: "text-muted",
  },
};

/** Avatar accents: green / steel / bronze / slate only */
const AVATAR_PALETTES = [
  "bg-accent-soft text-accent-dim dark:text-accent",
  "bg-steel-soft text-steel-fg",
  "bg-bronze-soft text-bronze-fg",
  "bg-slate-soft text-slate-fg",
] as const;

export function avatarPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
}
