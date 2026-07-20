/** Demo wearable/health connection prefs (web can't call native APIs). */

export type HealthSyncKey = "steps" | "workouts" | "recovery";

export type HealthProviderPrefs = {
  connected: boolean;
  steps: boolean;
  workouts: boolean;
  recovery: boolean;
  connectedAt?: string;
};

const DEFAULTS: HealthProviderPrefs = {
  connected: false,
  steps: true,
  workouts: true,
  recovery: true,
};

function canUse() {
  return typeof window !== "undefined";
}

function read(key: string): HealthProviderPrefs {
  if (!canUse()) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(key: string, prefs: HealthProviderPrefs) {
  if (!canUse()) return;
  localStorage.setItem(key, JSON.stringify(prefs));
}

export const appleHealthPrefs = {
  get: () => read("evolve.appleHealth"),
  set: (prefs: HealthProviderPrefs) => write("evolve.appleHealth", prefs),
};

export const garminConnectPrefs = {
  get: () => read("evolve.garminConnect"),
  set: (prefs: HealthProviderPrefs) => write("evolve.garminConnect", prefs),
};

/** @deprecated alias — prefer appleHealthPrefs */
export type AppleHealthPrefs = HealthProviderPrefs;
