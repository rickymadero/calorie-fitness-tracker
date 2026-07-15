import type {
  AssignedPlanState,
  TrainingAdjustment,
  WorkoutPlan,
  WorkoutSession,
  PersonalRecord,
} from "@/lib/types/training";

const KEYS = {
  plans: "evolve.workoutPlans",
  templates: "evolve.workoutTemplates",
  assigned: "evolve.assignedPlan",
  sessions: "evolve.workoutSessions",
  adjustments: "evolve.trainingAdjustments",
  records: "evolve.personalRecords",
} as const;

function canUse() {
  return typeof window !== "undefined";
}

function getJSON<T>(key: string, fallback: T): T {
  if (!canUse()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key: string, value: unknown) {
  if (!canUse()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const trainingStorage = {
  getPlans: () => getJSON<WorkoutPlan[]>(KEYS.plans, []),
  setPlans: (plans: WorkoutPlan[]) => setJSON(KEYS.plans, plans),
  upsertPlan: (plan: WorkoutPlan) => {
    const plans = trainingStorage.getPlans();
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) plans[idx] = plan;
    else plans.push(plan);
    trainingStorage.setPlans(plans);
    return plans;
  },
  deletePlan: (id: string) => {
    const plans = trainingStorage.getPlans().filter((p) => p.id !== id);
    trainingStorage.setPlans(plans);
    return plans;
  },

  getAssigned: () => getJSON<AssignedPlanState | null>(KEYS.assigned, null),
  setAssigned: (state: AssignedPlanState | null) => setJSON(KEYS.assigned, state),

  getSessions: () => getJSON<WorkoutSession[]>(KEYS.sessions, []),
  pushSession: (session: WorkoutSession) => {
    const sessions = [session, ...trainingStorage.getSessions()].slice(0, 40);
    setJSON(KEYS.sessions, sessions);
    return sessions;
  },

  getAdjustments: () => getJSON<TrainingAdjustment[]>(KEYS.adjustments, []),
  setAdjustments: (items: TrainingAdjustment[]) => setJSON(KEYS.adjustments, items),

  getRecords: () => getJSON<PersonalRecord[]>(KEYS.records, []),
  setRecords: (items: PersonalRecord[]) => setJSON(KEYS.records, items),
};
