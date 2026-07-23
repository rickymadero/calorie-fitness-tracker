"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
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
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/lib/services/auth";
import { profilesService } from "@/lib/services/profiles";
import { buildSessionProfile } from "@/lib/auth/sessionProfile";

type AuthResult = {
  ok: boolean;
  error?: string;
  user?: UserProfile | null;
};

interface AuthContextValue {
  user: UserProfile | null;
  onboarding: OnboardingData;
  nutritionPlan: NutritionPlan | null;
  registerDraft: RegisterDraft;
  isReady: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateRegisterDraft: (patch: Partial<RegisterDraft>) => void;
  clearRegisterDraft: () => void;
  /** @deprecated Prefer `register` — kept for any leftover callers. */
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

function persistUser(profile: UserProfile | null) {
  if (profile) storage.setUser(profile);
  else storage.clearUser();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData>(
    defaultOnboarding(),
  );
  const [nutritionPlan, setNutritionPlanState] = useState<NutritionPlan | null>(
    null,
  );
  const [registerDraft, setRegisterDraft] = useState<RegisterDraft>(
    defaultRegisterDraft(),
  );
  const [isReady, setIsReady] = useState(false);
  const hydratingRef = useRef(false);

  const hydrateFromAuthUser = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return null;
    }

    const local = storage.getUser();
    if (local && local.id !== authUser.id) {
      storage.noteAuthIdMismatch(local.id);
    }

    let profileRow = null;
    try {
      const supabase = createClient();
      const { data, error } = await profilesService.getById(
        supabase,
        authUser.id,
      );
      if (!error) profileRow = data;
    } catch {
      // Offline / missing env — onboarding status stays incomplete until profile loads.
    }

    const next = buildSessionProfile(authUser, profileRow, local);
    persistUser(next);
    setUser(next);
    setOnboarding(storage.getOnboarding() ?? defaultOnboarding());
    setNutritionPlanState(storage.getNutritionPlan());
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function bootstrap() {
      hydratingRef.current = true;
      setRegisterDraft(storage.getRegisterDraft() ?? defaultRegisterDraft());
      setOnboarding(storage.getOnboarding() ?? defaultOnboarding());
      setNutritionPlanState(storage.getNutritionPlan());

      try {
        const { data } = await authService.getUser(supabase);
        if (!cancelled) {
          await hydrateFromAuthUser(data.user ?? null);
        }
      } catch {
        if (!cancelled) {
          // Env missing or network error — stay signed out (no demo session).
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
          hydratingRef.current = false;
        }
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled || hydratingRef.current) return;
      if (event === "INITIAL_SESSION") return;
      void hydrateFromAuthUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [hydrateFromAuthUser]);

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

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!email.includes("@") || password.length < 6) {
        return { ok: false, error: "Invalid email or password." };
      }
      try {
        const supabase = createClient();
        const { data, error } = await authService.signIn(supabase, {
          email: email.trim(),
          password,
        });
        if (error) {
          return { ok: false, error: error.message };
        }
        const next = await hydrateFromAuthUser(data.user);
        return { ok: true, user: next };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Sign in failed.";
        return { ok: false, error: message };
      }
    },
    [hydrateFromAuthUser],
  );

  const register = useCallback(
    async (input: {
      fullName: string;
      email: string;
      password: string;
    }): Promise<AuthResult> => {
      const fullName = input.fullName.trim();
      const email = input.email.trim();
      if (!fullName) return { ok: false, error: "Name is required." };
      if (!email.includes("@")) {
        return { ok: false, error: "Enter a valid email." };
      }
      if (input.password.length < 6) {
        return { ok: false, error: "Password must be at least 6 characters." };
      }

      try {
        const supabase = createClient();
        const { data, error } = await authService.signUp(supabase, {
          email,
          password: input.password,
          fullName,
        });
        if (error) {
          return { ok: false, error: error.message };
        }

        // If email confirmation is required, session may be null.
        if (!data.session || !data.user) {
          return {
            ok: false,
            error:
              "Check your email to confirm your account, then sign in.",
          };
        }

        const localSeed: UserProfile = {
          id: data.user.id,
          fullName,
          email,
          emailVerified: Boolean(data.user.email_confirmed_at),
          dateOfBirth: "",
          country: "",
          measurementSystem: "metric",
          plan: "free",
          createdAt: data.user.created_at ?? new Date().toISOString(),
          onboardingComplete: false,
          introSeen: false,
          pricingSeen: false,
        };
        persistUser(localSeed);

        if (fullName) {
          await profilesService.updateOwn(supabase, data.user.id, {
            full_name: fullName,
          });
        }

        const next = await hydrateFromAuthUser(data.user);
        const withFunnel = next
          ? {
              ...next,
              fullName: fullName || next.fullName,
              onboardingComplete: false,
              introSeen: false,
              pricingSeen: false,
            }
          : localSeed;
        persistUser(withFunnel);
        setUser(withFunnel);

        const onboardingSeed = {
          ...defaultOnboarding(),
          measurementSystem: "metric" as const,
        };
        storage.setOnboarding(onboardingSeed);
        setOnboarding(onboardingSeed);

        return { ok: true, user: withFunnel };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Sign up failed.";
        return { ok: false, error: message };
      }
    },
    [hydrateFromAuthUser],
  );

  const completeRegistration = useCallback(() => {
    // Sync fallback for any leftover callers — prefer `register`.
    const draft = storage.getRegisterDraft() ?? registerDraft;
    const profile: UserProfile = {
      id: user?.id ?? crypto.randomUUID(),
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
    persistUser(profile);
    setUser(profile);
    return profile;
  }, [registerDraft, user?.id]);

  const verifyEmail = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, emailVerified: true };
      persistUser(next);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await authService.signOut(supabase);
    } catch {
      // Still clear local session if network fails.
    }
    // Clear only the session overlay — keep onboarding/nutrition/social local data.
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
      const next = {
        ...prev,
        onboardingComplete: true,
        introSeen: true,
        pricingSeen: true,
      };
      persistUser(next);
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
      persistUser(next);
      return next;
    });
  }, []);

  const markPricingSeen = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, pricingSeen: true };
      persistUser(next);
      return next;
    });
  }, []);

  const setPlan = useCallback((plan: PlanTier) => {
    // Demo Pro toggle stays local — DB trigger blocks client plan writes.
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, plan };
      persistUser(next);
      return next;
    });
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persistUser(next);

      if (patch.fullName !== undefined) {
        void (async () => {
          try {
            const supabase = createClient();
            await profilesService.updateOwn(supabase, prev.id, {
              full_name: patch.fullName,
            });
            await authService.updateMetadata(supabase, {
              full_name: patch.fullName,
            });
          } catch {
            // Local overlay still updated.
          }
        })();
      }

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
      register,
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
      register,
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
