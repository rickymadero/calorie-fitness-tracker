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
import { profilesService, type ProfileRow } from "@/lib/services/profiles";
import {
  userSettingsService,
  type UserSettingsRow,
} from "@/lib/services/userSettings";
import {
  buildSessionProfile,
  resolveAppTheme,
} from "@/lib/auth/sessionProfile";
import { runProfileSettingsBridge } from "@/lib/auth/profileSettingsBridge";
import { mirrorSupabaseProfileToSocial } from "@/lib/auth/mirrorSocialProfile";
import { settingsPrefs } from "@/lib/storage/settingsPrefs";
import { i18n, STORAGE_KEY as LANGUAGE_KEY } from "@/lib/i18n/i18n";

type AuthResult = {
  ok: boolean;
  error?: string;
  user?: UserProfile | null;
};

interface AuthContextValue {
  user: UserProfile | null;
  /** Supabase profiles row for the signed-in user (source of truth). */
  profile: ProfileRow | null;
  /** Supabase user_settings row (source of truth for units/language/theme). */
  userSettings: UserSettingsRow | null;
  profileError: string | null;
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
  updateUser: (
    patch: Partial<UserProfile>,
    options?: { syncRemote?: boolean },
  ) => void;
  /** Re-fetch profiles + user_settings and refresh session overlay. */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistUser(profile: UserProfile | null) {
  if (profile) storage.setUser(profile);
  else storage.clearUser();
}

function applyDeviceSettings(settings: UserSettingsRow | null) {
  if (!settings || typeof window === "undefined") return;
  try {
    const theme = resolveAppTheme(settings.theme);
    storage.setTheme(theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.dispatchEvent(
      new CustomEvent("evolve:theme", { detail: { theme } }),
    );
  } catch {
    /* ignore */
  }
  try {
    const lang = settings.language || "en";
    settingsPrefs.setLanguage(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    void i18n.changeLanguage(lang);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettingsRow | null>(
    null,
  );
  const [profileError, setProfileError] = useState<string | null>(null);
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
      setProfile(null);
      setUserSettings(null);
      setProfileError(null);
      return null;
    }

    const local = storage.getUser();
    if (local && local.id !== authUser.id) {
      storage.noteAuthIdMismatch(local.id);
    }

    let profileRow: ProfileRow | null = null;
    let settingsRow: UserSettingsRow | null = null;
    setProfileError(null);

    try {
      const supabase = createClient();
      const [{ data: pData, error: pErr }, { data: sData, error: sErr }] =
        await Promise.all([
          profilesService.getById(supabase, authUser.id),
          userSettingsService.getByUserId(supabase, authUser.id),
        ]);
      if (pErr) setProfileError(pErr.message);
      else profileRow = pData;
      if (!sErr) settingsRow = sData;

      if (profileRow || settingsRow) {
        await runProfileSettingsBridge(
          supabase,
          authUser.id,
          profileRow,
          settingsRow,
          authUser.email,
        );
        const [{ data: p2 }, { data: s2 }] = await Promise.all([
          profilesService.getById(supabase, authUser.id),
          userSettingsService.getByUserId(supabase, authUser.id),
        ]);
        if (p2) profileRow = p2;
        if (s2) settingsRow = s2;
      }

      if (profileRow) {
        mirrorSupabaseProfileToSocial(
          profileRow,
          profileRow.full_name ?? local?.fullName,
        );
      }
    } catch {
      // Offline / missing env — onboarding status stays incomplete until profile loads.
    }

    const next = buildSessionProfile(
      authUser,
      profileRow,
      local,
      settingsRow,
    );
    persistUser(next);
    setUser(next);
    setProfile(profileRow);
    setUserSettings(settingsRow);
    applyDeviceSettings(settingsRow);
    setOnboarding(storage.getOnboarding() ?? defaultOnboarding());
    setNutritionPlanState(storage.getNutritionPlan());
    return next;
  }, []);

  const refreshProfile = useCallback(async () => {
    const supabase = createClient();
    const { data } = await authService.getUser(supabase);
    if (data.user) await hydrateFromAuthUser(data.user);
  }, [hydrateFromAuthUser]);

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
    setProfile(null);
    setUserSettings(null);
    setProfileError(null);
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

  const updateUser = useCallback(
    (
      patch: Partial<UserProfile>,
      options?: { syncRemote?: boolean },
    ) => {
      const syncRemote = options?.syncRemote !== false;

      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        persistUser(next);
        return next;
      });

      if (patch.fullName !== undefined) {
        setProfile((row) =>
          row ? { ...row, full_name: patch.fullName ?? row.full_name } : row,
        );
      }

      if (
        !syncRemote ||
        (patch.fullName === undefined &&
          patch.measurementSystem === undefined)
      ) {
        return;
      }

      void (async () => {
        try {
          const supabase = createClient();
          const local = storage.getUser();
          if (!local) return;
          if (patch.fullName !== undefined) {
            await profilesService.updateOwn(supabase, local.id, {
              full_name: patch.fullName,
            });
            await authService.updateMetadata(supabase, {
              full_name: patch.fullName,
            });
          }
          if (patch.measurementSystem !== undefined) {
            await userSettingsService.updatePreferredUnits(
              supabase,
              local.id,
              patch.measurementSystem,
            );
          }
        } catch {
          // Local overlay still updated.
        }
      })();
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      userSettings,
      profileError,
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
      refreshProfile,
    }),
    [
      user,
      profile,
      userSettings,
      profileError,
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
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
