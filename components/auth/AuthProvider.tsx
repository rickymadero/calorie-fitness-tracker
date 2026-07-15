"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  NutritionPlan,
  OnboardingData,
  RegisterDraft,
  UserProfile,
  PlanTier,
} from "@/lib/types";
import { defaultOnboarding, defaultRegisterDraft } from "@/lib/types";
import { storage } from "@/lib/storage";
import { calculateNutritionPlan } from "@/lib/calculations/nutrition";

interface AuthContextValue {
  user: UserProfile | null;
  onboarding: OnboardingData;
  nutritionPlan: NutritionPlan | null;
  registerDraft: RegisterDraft;
  isReady: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateRegisterDraft: (patch: Partial<RegisterDraft>) => void;
  clearRegisterDraft: () => void;
  completeRegistration: () => UserProfile;
  verifyEmail: () => void;
  updateOnboarding: (patch: Partial<OnboardingData>) => void;
  completeOnboarding: () => NutritionPlan;
  setNutritionPlan: (plan: NutritionPlan) => void;
  markIntroSeen: () => void;
  markPricingSeen: () => void;
  setPlan: (plan: PlanTier) => void;
  updateUser: (patch: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData>(defaultOnboarding());
  const [nutritionPlan, setNutritionPlanState] = useState<NutritionPlan | null>(null);
  const [registerDraft, setRegisterDraft] = useState<RegisterDraft>(defaultRegisterDraft());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = storage.getUser();
    if (stored && !stored.emailVerified) {
      const fixed = { ...stored, emailVerified: true };
      storage.setUser(fixed);
      setUser(fixed);
    } else {
      setUser(stored);
    }
    setOnboarding(storage.getOnboarding() ?? defaultOnboarding());
    setNutritionPlanState(storage.getNutritionPlan());
    setRegisterDraft(storage.getRegisterDraft() ?? defaultRegisterDraft());
    setIsReady(true);
  }, []);

  const updateRegisterDraft = useCallback((patch: Partial<RegisterDraft>) => {
    setRegisterDraft((prev) => {
      const next = { ...prev, ...patch };
      storage.setRegisterDraft(next);
      return next;
    });
  }, []);

  const clearRegisterDraft = useCallback(() => {
    storage.clearRegisterDraft();
    setRegisterDraft(defaultRegisterDraft());
  }, []);

  const completeRegistration = useCallback(() => {
    const draft = storage.getRegisterDraft() ?? registerDraft;
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      fullName: draft.fullName,
      email: draft.email,
      emailVerified: true,
      dateOfBirth: draft.dateOfBirth,
      country: draft.country,
      measurementSystem: draft.measurementSystem,
      plan: "free",
      createdAt: new Date().toISOString(),
      onboardingComplete: false,
      introSeen: false,
      pricingSeen: false,
    };
    storage.setUser(profile);
    setUser(profile);
    const onboardingSeed = {
      ...defaultOnboarding(),
      measurementSystem: draft.measurementSystem,
    };
    storage.setOnboarding(onboardingSeed);
    setOnboarding(onboardingSeed);
    return profile;
  }, [registerDraft]);

  const verifyEmail = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, emailVerified: true };
      storage.setUser(next);
      return next;
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!email.includes("@") || password.length < 6) {
      return { ok: false, error: "Invalid email or password." };
    }

    const existing = storage.getUser();
    if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
      const restored: UserProfile = {
        ...existing,
        emailVerified: true,
      };
      storage.setUser(restored);
      setUser(restored);
      setOnboarding(storage.getOnboarding() ?? defaultOnboarding());
      setNutritionPlanState(storage.getNutritionPlan());
      return { ok: true };
    }

    // Local demo: any valid email/password signs in without email verification
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      fullName: email.split("@")[0] || "Athlete",
      email,
      emailVerified: true,
      dateOfBirth: "1995-01-01",
      country: "United States",
      measurementSystem: "metric",
      plan: "free",
      createdAt: new Date().toISOString(),
      onboardingComplete: true,
      introSeen: true,
      pricingSeen: true,
    };
    storage.setUser(profile);
    setUser(profile);

    const savedOnboarding = storage.getOnboarding();
    if (savedOnboarding) {
      setOnboarding(savedOnboarding);
    } else {
      const data = {
        ...defaultOnboarding(),
        gender: "male" as const,
        age: 28,
        currentWeight: 78,
        height: 178,
        targetWeight: 72,
        primaryGoal: "lose-weight" as const,
        activityLevel: "moderately-active" as const,
        exerciseDaysPerWeek: 4,
        measurementSystem: "metric" as const,
      };
      storage.setOnboarding(data);
      setOnboarding(data);
    }

    const savedPlan = storage.getNutritionPlan();
    if (savedPlan) {
      setNutritionPlanState(savedPlan);
    } else {
      const plan = calculateNutritionPlan(
        storage.getOnboarding() ?? {
          ...defaultOnboarding(),
          gender: "male",
          age: 28,
          currentWeight: 78,
          height: 178,
          targetWeight: 72,
          primaryGoal: "lose-weight",
          activityLevel: "moderately-active",
          exerciseDaysPerWeek: 4,
        },
      );
      storage.setNutritionPlan(plan);
      setNutritionPlanState(plan);
    }

    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    storage.clearUser();
    setUser(null);
  }, []);

  const updateOnboarding = useCallback((patch: Partial<OnboardingData>) => {
    setOnboarding((prev) => {
      const next = { ...prev, ...patch };
      storage.setOnboarding(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    const data = storage.getOnboarding() ?? onboarding;
    const plan = calculateNutritionPlan(data);
    storage.setNutritionPlan(plan);
    setNutritionPlanState(plan);
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, onboardingComplete: true };
      storage.setUser(next);
      return next;
    });
    return plan;
  }, [onboarding]);

  const setNutritionPlan = useCallback((plan: NutritionPlan) => {
    storage.setNutritionPlan(plan);
    setNutritionPlanState(plan);
  }, []);

  const markIntroSeen = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, introSeen: true };
      storage.setUser(next);
      return next;
    });
  }, []);

  const markPricingSeen = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, pricingSeen: true };
      storage.setUser(next);
      return next;
    });
  }, []);

  const setPlan = useCallback((plan: PlanTier) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, plan };
      storage.setUser(next);
      return next;
    });
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      storage.setUser(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      onboarding,
      nutritionPlan,
      registerDraft,
      isReady,
      login,
      logout,
      updateRegisterDraft,
      clearRegisterDraft,
      completeRegistration,
      verifyEmail,
      updateOnboarding,
      completeOnboarding,
      setNutritionPlan,
      markIntroSeen,
      markPricingSeen,
      setPlan,
      updateUser,
    }),
    [
      user,
      onboarding,
      nutritionPlan,
      registerDraft,
      isReady,
      login,
      logout,
      updateRegisterDraft,
      clearRegisterDraft,
      completeRegistration,
      verifyEmail,
      updateOnboarding,
      completeOnboarding,
      setNutritionPlan,
      markIntroSeen,
      markPricingSeen,
      setPlan,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
