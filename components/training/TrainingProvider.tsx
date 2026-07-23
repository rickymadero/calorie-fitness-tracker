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
  AssignedPlanState,
  TrainingAdjustment,
  WorkoutPlan,
  WorkoutSession,
} from "@/lib/types/training";
import { trainingStorage } from "@/lib/storage/training";
import { generatePersonalizedPlan, duplicatePlan } from "@/lib/training/generatePlan";
import { useAuth } from "@/components/auth/AuthProvider";
import { recommendAdjustments } from "@/lib/training/adjustments";

interface TrainingContextValue {
  isReady: boolean;
  plans: WorkoutPlan[];
  assigned: AssignedPlanState | null;
  assignedPlan: WorkoutPlan | null;
  sessions: WorkoutSession[];
  adjustments: TrainingAdjustment[];
  ensurePersonalizedPlan: () => WorkoutPlan;
  savePlan: (plan: WorkoutPlan) => void;
  deletePlan: (id: string) => void;
  assignPlanToUser: (planId: string, userId: string, copyFromTemplate?: boolean) => void;
  duplicateAsTemplate: (planId: string) => WorkoutPlan | null;
  saveSession: (session: WorkoutSession) => TrainingAdjustment[];
  setAdjustmentStatus: (
    id: string,
    status: TrainingAdjustment["status"],
  ) => void;
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const { user, onboarding, isReady: authReady } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [assigned, setAssigned] = useState<AssignedPlanState | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [adjustments, setAdjustments] = useState<TrainingAdjustment[]>([]);

  useEffect(() => {
    if (!authReady) return;
    setPlans(trainingStorage.getPlans());
    setAssigned(trainingStorage.getAssigned());
    setSessions(trainingStorage.getSessions());
    setAdjustments(trainingStorage.getAdjustments());
    setIsReady(true);
  }, [authReady]);

  const assignedPlan = useMemo(() => {
    if (!assigned) return null;
    return plans.find((p) => p.id === assigned.planId) || null;
  }, [assigned, plans]);

  const savePlan = useCallback((plan: WorkoutPlan) => {
    const next = trainingStorage.upsertPlan({
      ...plan,
      updatedAt: new Date().toISOString(),
    });
    setPlans([...next]);
  }, []);

  const deletePlan = useCallback((id: string) => {
    const next = trainingStorage.deletePlan(id);
    setPlans([...next]);
    const current = trainingStorage.getAssigned();
    if (current?.planId === id) {
      trainingStorage.setAssigned(null);
      setAssigned(null);
    }
  }, []);

  const ensurePersonalizedPlan = useCallback(() => {
    const currentAssigned = trainingStorage.getAssigned();
    const all = trainingStorage.getPlans();
    if (currentAssigned) {
      const existing = all.find((p) => p.id === currentAssigned.planId);
      if (existing) {
        setPlans(all);
        setAssigned(currentAssigned);
        return existing;
      }
    }
    const plan = generatePersonalizedPlan(onboarding, user?.id);
    const next = trainingStorage.upsertPlan(plan);
    const state: AssignedPlanState = {
      planId: plan.id,
      assignedAt: new Date().toISOString(),
      currentWeek: 1,
      source: "auto",
    };
    trainingStorage.setAssigned(state);
    setPlans([...next]);
    setAssigned(state);
    return plan;
  }, [onboarding, user?.id]);

  const assignPlanToUser = useCallback(
    (planId: string, userId: string, copyFromTemplate = true) => {
      const all = trainingStorage.getPlans();
      const source = all.find((p) => p.id === planId);
      if (!source) return;
      let plan = source;
      if (copyFromTemplate || source.isTemplate) {
        plan = duplicatePlan(source, false);
        plan.assignedUserIds = [userId];
        plan.name = `${source.name} · assigned`;
      } else {
        plan = {
          ...source,
          assignedUserIds: Array.from(new Set([...source.assignedUserIds, userId])),
        };
      }
      const next = trainingStorage.upsertPlan(plan);
      const state: AssignedPlanState = {
        planId: plan.id,
        assignedAt: new Date().toISOString(),
        currentWeek: 1,
        source: "admin",
      };
      // For local single-user demo, assign if matches current user or always
      if (!userId || userId === user?.id || userId === "demo-user") {
        trainingStorage.setAssigned(state);
        setAssigned(state);
      }
      setPlans([...next]);
    },
    [user?.id],
  );

  const duplicateAsTemplate = useCallback((planId: string) => {
    const source = trainingStorage.getPlans().find((p) => p.id === planId);
    if (!source) return null;
    const copy = duplicatePlan(source, true);
    copy.name = `${source.name} template`;
    const next = trainingStorage.upsertPlan(copy);
    setPlans([...next]);
    return copy;
  }, []);

  const saveSession = useCallback((session: WorkoutSession) => {
    const nextSessions = trainingStorage.pushSession(session);
    setSessions([...nextSessions]);
    const recs = recommendAdjustments({
      userId: session.userId,
      planId: session.planId,
      session,
      recentSessions: nextSessions.slice(1, 5),
    });
    const merged = [...recs, ...trainingStorage.getAdjustments()].slice(0, 30);
    trainingStorage.setAdjustments(merged);
    setAdjustments(merged);

    // Dual-write strength activity to Supabase (local session kept).
    const dayName = trainingStorage
      .getPlans()
      .flatMap((p) => p.days)
      .find((d) => d.id === session.dayId)?.name;
    void import("@/lib/activities/syncLocalActivity").then(
      ({ syncLocalSessionActivity }) =>
        syncLocalSessionActivity(session.userId, session, dayName),
    );

    return recs;
  }, []);

  const setAdjustmentStatus = useCallback(
    (id: string, status: TrainingAdjustment["status"]) => {
      const next = trainingStorage
        .getAdjustments()
        .map((a) => (a.id === id ? { ...a, status } : a));
      trainingStorage.setAdjustments(next);
      setAdjustments(next);
    },
    [],
  );

  const value = useMemo(
    () => ({
      isReady,
      plans,
      assigned,
      assignedPlan,
      sessions,
      adjustments,
      ensurePersonalizedPlan,
      savePlan,
      deletePlan,
      assignPlanToUser,
      duplicateAsTemplate,
      saveSession,
      setAdjustmentStatus,
    }),
    [
      isReady,
      plans,
      assigned,
      assignedPlan,
      sessions,
      adjustments,
      ensurePersonalizedPlan,
      savePlan,
      deletePlan,
      assignPlanToUser,
      duplicateAsTemplate,
      saveSession,
      setAdjustmentStatus,
    ],
  );

  return (
    <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>
  );
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error("useTraining must be used within TrainingProvider");
  return ctx;
}
