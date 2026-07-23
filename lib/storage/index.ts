import type {
  NutritionPlan,
  OnboardingData,
  RegisterDraft,
  UserProfile,
} from "@/lib/types";

const KEYS = {
  user: "evolve.user",
  onboarding: "evolve.onboarding",
  nutritionPlan: "evolve.nutritionPlan",
  registerDraft: "evolve.registerDraft",
  theme: "evolve.theme",
  /** Non-destructive flag: leftover localStorage demo data may need a future migration. */
  localDataBridge: "evolve.localDataBridge",
} as const;

export type LocalDataBridge = {
  pending: boolean;
  previousUserId?: string;
  notedAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function getJSON<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setJSON(key: string, value: unknown) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: string) {
  if (!canUseStorage()) return;
  localStorage.removeItem(key);
}

export const storage = {
  getUser: () => getJSON<UserProfile>(KEYS.user),
  setUser: (user: UserProfile) => setJSON(KEYS.user, user),
  clearUser: () => remove(KEYS.user),

  getOnboarding: () => getJSON<OnboardingData>(KEYS.onboarding),
  setOnboarding: (data: OnboardingData) => setJSON(KEYS.onboarding, data),
  clearOnboarding: () => remove(KEYS.onboarding),

  getNutritionPlan: () => getJSON<NutritionPlan>(KEYS.nutritionPlan),
  setNutritionPlan: (plan: NutritionPlan) => setJSON(KEYS.nutritionPlan, plan),
  clearNutritionPlan: () => remove(KEYS.nutritionPlan),

  getRegisterDraft: () => getJSON<RegisterDraft>(KEYS.registerDraft),
  setRegisterDraft: (draft: RegisterDraft) => setJSON(KEYS.registerDraft, draft),
  clearRegisterDraft: () => remove(KEYS.registerDraft),

  getTheme: (): "light" | "dark" | null => {
    if (!canUseStorage()) return null;
    const t = localStorage.getItem(KEYS.theme);
    return t === "light" || t === "dark" ? t : null;
  },
  setTheme: (theme: "light" | "dark") => {
    if (!canUseStorage()) return;
    localStorage.setItem(KEYS.theme, theme);
  },

  getLocalDataBridge: () => getJSON<LocalDataBridge>(KEYS.localDataBridge),
  setLocalDataBridge: (bridge: LocalDataBridge) =>
    setJSON(KEYS.localDataBridge, bridge),
  clearLocalDataBridge: () => remove(KEYS.localDataBridge),

  /**
   * Mark leftover demo localStorage when Auth user id differs from stored profile.
   * Does not delete any app data.
   */
  noteAuthIdMismatch: (previousUserId: string) => {
    setJSON(KEYS.localDataBridge, {
      pending: true,
      previousUserId,
      notedAt: new Date().toISOString(),
    } satisfies LocalDataBridge);
  },

  clearAll: () => {
    Object.values(KEYS).forEach(remove);
  },
};
