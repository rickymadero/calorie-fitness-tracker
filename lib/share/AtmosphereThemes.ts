import type { AtmosphereId, AtmosphereTheme } from "@/lib/share/WorkoutShareModel";

/** Evolve green used across dark share atmospheres. */
export const EVOLVE_GREEN = "#2ecf87";

export const ATMOSPHERES: Record<AtmosphereId, AtmosphereTheme> = {
  midnight: {
    id: "midnight",
    name: "Evolve Green",
    background: ["#000010", "#070b14", "#04140e"],
    primaryAccent: EVOLVE_GREEN,
    secondaryAccent: "#67e8f9",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.55)",
    signalColor: EVOLVE_GREEN,
    glow: "rgba(46,207,135,0.58)",
  },
  void: {
    id: "void",
    name: "White Signal",
    background: ["#050505", "#0a0a0a", "#06140c"],
    primaryAccent: EVOLVE_GREEN,
    secondaryAccent: "#737373",
    textPrimary: "#fafafa",
    textSecondary: "rgba(250,250,250,0.5)",
    signalColor: "#ffffff",
    glow: "rgba(46,207,135,0.32)",
  },
  forest: {
    id: "forest",
    name: "Deep Forest",
    background: ["#04120c", "#0a1a12", "#06140e"],
    primaryAccent: EVOLVE_GREEN,
    secondaryAccent: "#86efac",
    textPrimary: "#f3fce8",
    textSecondary: "rgba(243,252,232,0.55)",
    signalColor: "#a3e635",
    glow: "rgba(163,230,53,0.3)",
  },
  electric: {
    id: "electric",
    name: "Electric",
    background: ["#030504", "#080c08", "#041208"],
    primaryAccent: "#c8ff3d",
    secondaryAccent: EVOLVE_GREEN,
    textPrimary: "#f7ffe8",
    textSecondary: "rgba(247,255,232,0.52)",
    signalColor: "#c8ff3d",
    glow: "rgba(200,255,61,0.32)",
  },
  carbon: {
    id: "carbon",
    name: "Carbon",
    background: ["#0a0a0f", "#121218", "#0c0c12"],
    primaryAccent: EVOLVE_GREEN,
    secondaryAccent: "#a3a3a3",
    textPrimary: "#f3f4f6",
    textSecondary: "rgba(243,244,246,0.5)",
    signalColor: "#e5e5e5",
    glow: "rgba(46,207,135,0.26)",
  },
  ocean: {
    id: "ocean",
    name: "Cyan Pulse",
    background: ["#030b12", "#061820", "#04141a"],
    primaryAccent: "#22d3ee",
    secondaryAccent: EVOLVE_GREEN,
    textPrimary: "#ecfeff",
    textSecondary: "rgba(236,254,255,0.52)",
    signalColor: "#67e8f9",
    glow: "rgba(34,211,238,0.34)",
  },
};

/** Curated atmospheres for the share panel — layout identical across all. */
export const ATMOSPHERE_LIST: AtmosphereTheme[] = [
  ATMOSPHERES.midnight,
  ATMOSPHERES.void,
  ATMOSPHERES.ocean,
  ATMOSPHERES.forest,
  ATMOSPHERES.carbon,
];

export function getAtmosphere(id: AtmosphereId): AtmosphereTheme {
  return ATMOSPHERES[id] ?? ATMOSPHERES.midnight;
}

export function resolveAtmosphereId(
  preferred: AtmosphereId | undefined,
): AtmosphereId {
  const id = preferred ?? "midnight";
  return ATMOSPHERES[id] ? id : "midnight";
}
