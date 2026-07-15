import type { OnboardingData, ExperienceLevel, FitnessGoal } from "@/lib/types";
import type {
  EquipmentType,
  WorkoutDay,
  WorkoutPlan,
  PlanExercise,
  MuscleGroup,
} from "@/lib/types/training";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function pe(
  exerciseId: string,
  section: PlanExercise["section"],
  order: number,
  sets: number,
  reps: string,
  rest: number,
  weight = "RPE 7",
): PlanExercise {
  return {
    id: uid("pe"),
    exerciseId,
    sets,
    reps,
    recommendedWeight: weight,
    restSeconds: rest,
    tempo: section === "main" ? "2-0-1" : undefined,
    section,
    order,
  };
}

function mapEquipment(onboarding: OnboardingData): EquipmentType[] {
  const map: Record<string, EquipmentType> = {
    Dumbbells: "dumbbells",
    Barbell: "barbell",
    "Resistance bands": "bands",
    "Pull-up bar": "pull-up-bar",
    Kettlebells: "kettlebell",
    "Cardio machine": "cardio-machine",
    "Bodyweight only": "bodyweight",
    "Full gym": "machine",
  };
  const list = onboarding.availableEquipment
    .map((e) => map[e])
    .filter(Boolean) as EquipmentType[];
  if (onboarding.hasGymAccess) {
    list.push("machine", "cable", "barbell", "bench");
  }
  if (list.length === 0) list.push("bodyweight", "dumbbells");
  return Array.from(new Set(list));
}

function structureForExperience(
  level: ExperienceLevel,
  days: number,
): { names: string[]; muscles: MuscleGroup[][] } {
  if (level === "beginner" || days <= 3) {
    const muscles: MuscleGroup[][] = [
      ["chest", "back", "quads", "core"],
      ["shoulders", "glutes", "hamstrings", "core"],
      ["chest", "back", "quads", "core"],
    ];
    return {
      names: ["Full Body A", "Full Body B", "Full Body C"].slice(0, days),
      muscles: muscles.slice(0, days),
    };
  }
  if (level === "intermediate" || days === 4) {
    const muscles: MuscleGroup[][] = [
      ["chest", "back", "shoulders", "biceps", "triceps"],
      ["quads", "hamstrings", "glutes", "calves"],
      ["chest", "back", "shoulders"],
      ["quads", "hamstrings", "glutes", "core"],
    ];
    return {
      names: ["Upper A", "Lower A", "Upper B", "Lower B"].slice(0, days),
      muscles: muscles.slice(0, days),
    };
  }
  const muscles: MuscleGroup[][] = [
    ["chest", "shoulders", "triceps"],
    ["back", "biceps"],
    ["quads", "hamstrings", "glutes", "calves"],
    ["chest", "shoulders", "triceps"],
    ["back", "biceps", "core"],
    ["quads", "hamstrings", "glutes"],
  ];
  return {
    names: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"].slice(0, days),
    muscles: muscles.slice(0, days),
  };
}

function exerciseBank(
  home: boolean,
  goal: FitnessGoal | "",
): Record<string, string[]> {
  if (home) {
    return {
      chest: ["ex-pushup", "ex-db-bench"],
      back: ["ex-band-row", "ex-pullup"],
      shoulders: ["ex-ohp", "ex-lateral-raise"],
      quads: ["ex-goblet-squat", "ex-bodyweight-squat"],
      hamstrings: ["ex-rdl", "ex-glute-bridge"],
      glutes: ["ex-glute-bridge", "ex-goblet-squat"],
      core: ["ex-plank", "ex-dead-bug"],
      biceps: ["ex-curl"],
      triceps: ["ex-pushup"],
      cardio: goal === "improve-endurance" || goal === "lose-weight" ? ["ex-walk", "ex-bike"] : ["ex-walk"],
    };
  }
  return {
    chest: ["ex-bb-bench", "ex-db-bench", "ex-machine-chest"],
    back: ["ex-lat-pulldown", "ex-seated-row", "ex-pullup"],
    shoulders: ["ex-ohp", "ex-lateral-raise"],
    quads: ["ex-squat", "ex-leg-press", "ex-goblet-squat"],
    hamstrings: ["ex-rdl", "ex-leg-curl"],
    glutes: ["ex-glute-bridge", "ex-rdl"],
    core: ["ex-plank", "ex-dead-bug"],
    biceps: ["ex-curl"],
    triceps: ["ex-triceps-pushdown"],
    cardio: ["ex-bike", "ex-walk"],
  };
}

function buildDayExercises(
  muscles: MuscleGroup[],
  bank: Record<string, string[]>,
  goal: FitnessGoal | "",
  duration: number,
): PlanExercise[] {
  const list: PlanExercise[] = [];
  let order = 0;
  list.push(pe("ex-walk", "warmup", order++, 1, "5 min", 0, "easy"));
  list.push(pe("ex-dead-bug", "mobility", order++, 2, "8/side", 30, "bodyweight"));

  const sets = duration >= 60 ? 4 : 3;
  const picks = muscles.slice(0, 4);
  for (const m of picks) {
    const options = bank[m] || bank.core;
    const id = options[0];
    const reps =
      goal === "build-muscle" || goal === "increase-strength"
        ? goal === "increase-strength"
          ? "5-8"
          : "8-12"
        : "10-15";
    list.push(pe(id, "main", order++, sets, reps, 90));
  }

  if (goal === "lose-weight" || goal === "improve-endurance" || goal === "athletic-performance") {
    list.push(pe(bank.cardio[0], "cardio", order++, 1, "10-15 min", 0, "moderate"));
  }

  list.push(pe("ex-plank", "cooldown", order++, 2, "30-45s", 30, "bodyweight"));
  return list;
}

export function generatePersonalizedPlan(onboarding: OnboardingData, userId?: string): WorkoutPlan {
  const level = (onboarding.experienceLevel || "beginner") as ExperienceLevel;
  const goal = onboarding.primaryGoal || "overall-health";
  const days =
    typeof onboarding.exerciseDaysPerWeek === "number"
      ? Math.min(6, Math.max(2, onboarding.exerciseDaysPerWeek))
      : 3;
  const duration =
    typeof onboarding.workoutDurationMinutes === "number"
      ? onboarding.workoutDurationMinutes
      : 45;
  const home = !onboarding.hasGymAccess;
  const equipment = mapEquipment(onboarding);
  const structure = structureForExperience(level, days);
  const bank = exerciseBank(home, goal);

  const avoid = `${onboarding.exercisesToAvoid} ${onboarding.previousInjuries} ${onboarding.physicalLimitations}`.toLowerCase();

  const workoutDays: WorkoutDay[] = structure.names.map((name, i) => {
    let exercises = buildDayExercises(structure.muscles[i], bank, goal, duration);
    if (avoid.includes("squat")) {
      exercises = exercises.map((e) =>
        e.exerciseId.includes("squat") || e.exerciseId === "ex-squat"
          ? { ...e, exerciseId: "ex-leg-press" }
          : e,
      );
    }
    if (avoid.includes("bench") || avoid.includes("press")) {
      exercises = exercises.map((e) =>
        e.exerciseId.includes("bench") ? { ...e, exerciseId: "ex-pushup" } : e,
      );
    }
    return {
      id: uid("day"),
      name,
      dayOfWeek: i,
      isRestDay: false,
      muscleGroups: structure.muscles[i],
      estimatedMinutes: duration,
      difficulty: level === "advanced" ? "advanced" : level === "intermediate" ? "intermediate" : "beginner",
      warmUpNotes: "5 minutes light cardio + dynamic mobility.",
      cooldownNotes: "Walk and stretch major movers 5 minutes.",
      trainerNotes:
        level === "beginner"
          ? "Focus on form. Leave 2 reps in reserve."
          : "Progress load when all sets hit the top of the rep range.",
      cardioNotes:
        goal === "lose-weight" ? "Keep cardio steady, not max effort." : undefined,
      exercises,
    };
  });

  // Pad rest days into weekly view (not full 7, but guidance)
  const goalLabel =
    goal === "lose-weight"
      ? "Fat loss + strength"
      : goal === "build-muscle"
        ? "Hypertrophy"
        : goal === "improve-endurance"
          ? "Endurance + conditioning"
          : goal === "increase-strength"
            ? "Strength focus"
            : "Balanced fitness";

  return {
    id: uid("plan"),
    name: `${goalLabel} · ${level} plan`,
    description: `Personalized ${days}-day program based on your goals, experience, and available equipment.`,
    mainGoal: goal as FitnessGoal,
    experienceLevel: level,
    requiredEquipment: equipment,
    daysPerWeek: days,
    durationWeeks: 8,
    isTemplate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    instructions:
      "Complete each training day with good technique. Sleep and protein intake matter as much as lifting.",
    restDayGuidance: `Aim for ${7 - days} rest or active recovery days weekly. Walk and mobility on rest days.`,
    progressionStrategy:
      level === "beginner"
        ? "Add reps first. When you hit the top of the range for all sets, add a little weight next session."
        : "Use progressive overload — small weekly load or rep increases when recovery allows.",
    nutritionNotes:
      goal === "lose-weight"
        ? "Stay near your calorie target with high protein on training days."
        : goal === "build-muscle"
          ? "Eat near surplus calories and prioritize protein around workouts."
          : "Match carbs higher on training days and keep protein consistent daily.",
    safetyNotes: onboarding.acceptedHealthDisclaimer
      ? `Avoid: ${onboarding.exercisesToAvoid || "none listed"}. Limitations noted: ${onboarding.physicalLimitations || "none"}. Stop any exercise that causes sharp pain.`
      : "Stop any exercise that causes sharp pain and consult a professional when needed.",
    phases: [
      {
        id: uid("phase"),
        name: "Foundation",
        weeks: 4,
        focus: "Technique + consistency",
        order: 0,
      },
      {
        id: uid("phase"),
        name: "Progression",
        weeks: 4,
        focus: "Load and volume increases",
        order: 1,
      },
    ],
    days: workoutDays,
    assignedUserIds: userId ? [userId] : [],
  };
}

export function duplicatePlan(plan: WorkoutPlan, asTemplate = false): WorkoutPlan {
  const copy: WorkoutPlan = JSON.parse(JSON.stringify(plan));
  copy.id = uid("plan");
  copy.name = `${plan.name} (copy)`;
  copy.isTemplate = asTemplate;
  copy.parentTemplateId = plan.isTemplate ? plan.id : plan.parentTemplateId || plan.id;
  copy.assignedUserIds = [];
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  copy.days = copy.days.map((d) => ({
    ...d,
    id: uid("day"),
    exercises: d.exercises.map((e) => ({ ...e, id: uid("pe") })),
  }));
  copy.phases = copy.phases.map((p) => ({ ...p, id: uid("phase") }));
  return copy;
}
