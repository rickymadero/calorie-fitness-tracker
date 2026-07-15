import type { ExperienceLevel, FitnessGoal } from "@/lib/types";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "core"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "full-body"
  | "cardio";

export type EquipmentType =
  | "none"
  | "bodyweight"
  | "dumbbells"
  | "barbell"
  | "kettlebell"
  | "cable"
  | "machine"
  | "bands"
  | "pull-up-bar"
  | "bench"
  | "cardio-machine";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface ExerciseDemo {
  /** Pattern-keyed local athlete clip under /demos (see exerciseMedia). */
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds: number;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: Difficulty;
  instructions: string[];
  startingPosition: string;
  execution: string;
  breathing: string;
  postureCues: string[];
  commonMistakes: string[];
  safetyTips: string[];
  beginnerModification: string;
  advancedVariation: string;
  easierAlternativeIds: string[];
  harderAlternativeIds: string[];
  replacementIds: string[];
  demo: ExerciseDemo;
  isProDemo: boolean;
  tags: string[];
}

export interface PlanExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  recommendedWeight: string;
  restSeconds: number;
  tempo?: string;
  notes?: string;
  section: "warmup" | "main" | "cardio" | "cooldown" | "mobility";
  order: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  dayOfWeek: number; // 0=Mon … 6=Sun
  isRestDay: boolean;
  muscleGroups: MuscleGroup[];
  estimatedMinutes: number;
  difficulty: Difficulty;
  warmUpNotes?: string;
  cooldownNotes?: string;
  trainerNotes?: string;
  cardioNotes?: string;
  exercises: PlanExercise[];
}

export interface WorkoutPhase {
  id: string;
  name: string;
  weeks: number;
  focus: string;
  order: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  mainGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  requiredEquipment: EquipmentType[];
  daysPerWeek: number;
  durationWeeks: number;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  instructions: string;
  restDayGuidance: string;
  progressionStrategy: string;
  nutritionNotes: string;
  safetyNotes: string;
  phases: WorkoutPhase[];
  days: WorkoutDay[];
  assignedUserIds: string[];
  parentTemplateId?: string;
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  planExerciseId: string;
  sets: SetLog[];
  skipped: boolean;
  replacedWithId?: string;
  painReported: boolean;
  painNotes?: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId: string;
  dayId: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  exercises: ExerciseSessionLog[];
  energyLevel?: number;
  difficultyRating?: number;
  recoveryLevel?: number;
  sleepQuality?: number;
  muscleSoreness?: number;
  notes?: string;
  estimatedCalories?: number;
  totalVolume?: number;
  personalRecords?: string[];
}

export interface TrainingAdjustment {
  id: string;
  userId: string;
  planId: string;
  createdAt: string;
  type:
    | "increase-weight"
    | "reduce-weight"
    | "increase-reps"
    | "replace-exercise"
    | "reduce-volume"
    | "add-rest-day"
    | "increase-difficulty"
    | "deload"
    | "shorten-workout"
    | "equipment-swap";
  title: string;
  reason: string;
  status: "pending" | "approved" | "dismissed";
  details?: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  achievedAt: string;
}

export interface AssignedPlanState {
  planId: string;
  assignedAt: string;
  currentWeek: number;
  source: "auto" | "admin" | "template-copy";
}
