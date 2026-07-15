import type {
  ActivityLevel,
  FitnessGoal,
  Gender,
  MeasurementSystem,
  NutritionPlan,
  OnboardingData,
} from "@/lib/types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  "lightly-active": 1.375,
  "moderately-active": 1.55,
  "very-active": 1.725,
  "extremely-active": 1.9,
};

function toKg(weight: number, system: MeasurementSystem) {
  return system === "imperial" ? weight * 0.453592 : weight;
}

function toCm(height: number, system: MeasurementSystem) {
  return system === "imperial" ? height * 2.54 : height;
}

function bmrMifflin(
  gender: Gender | "",
  weightKg: number,
  heightCm: number,
  age: number,
) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "female") return base - 161;
  return base + 5;
}

function goalAdjustment(goal: FitnessGoal | ""): {
  type: NutritionPlan["adjustmentType"];
  delta: number;
} {
  switch (goal) {
    case "lose-weight":
      return { type: "deficit", delta: -500 };
    case "build-muscle":
    case "increase-strength":
      return { type: "surplus", delta: 300 };
    case "athletic-performance":
    case "improve-endurance":
      return { type: "surplus", delta: 150 };
    case "maintain-weight":
    case "overall-health":
    default:
      return { type: "maintenance", delta: 0 };
  }
}

function strategyFor(goal: FitnessGoal | "", workouts: number): string {
  switch (goal) {
    case "lose-weight":
      return `A moderate calorie deficit paired with ${workouts} strength-focused sessions per week will help preserve muscle while fat loss progresses. Prioritize protein and consistency over perfection.`;
    case "build-muscle":
      return `A controlled surplus with progressive overload across ${workouts} weekly workouts supports muscle growth. Hit your protein target daily and recover well between sessions.`;
    case "increase-strength":
      return `Focus on progressive compound lifts ${workouts} days per week with adequate calories and protein to fuel performance and recovery.`;
    case "improve-endurance":
      return `Blend aerobic work with strength maintenance. Fuel training days well and keep hydration high to support longer sessions.`;
    case "athletic-performance":
      return `Periodize training intensity across ${workouts} sessions weekly. Align nutrition around training windows and keep recovery habits consistent.`;
    case "maintain-weight":
      return `Stay near maintenance calories, train ${workouts} days per week, and use habits like meal logging and water tracking to keep results stable.`;
    default:
      return `Balanced nutrition, ${workouts} workouts per week, and daily habit tracking will build a sustainable foundation for long-term health.`;
  }
}

export function calculateNutritionPlan(data: OnboardingData): NutritionPlan {
  const system = data.measurementSystem;
  const age = typeof data.age === "number" ? data.age : 30;
  const weight = typeof data.currentWeight === "number" ? data.currentWeight : 70;
  const height = typeof data.height === "number" ? data.height : 170;
  const target =
    typeof data.targetWeight === "number" ? data.targetWeight : weight;

  const weightKg = toKg(weight, system);
  const heightCm = toCm(height, system);
  const targetKg = toKg(target, system);

  const activity =
    (data.activityLevel as ActivityLevel) || "moderately-active";
  const bmr = bmrMifflin(data.gender, weightKg, heightCm, age);
  const maintenance = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
  const { type, delta } = goalAdjustment(data.primaryGoal);
  const dailyTarget = Math.max(1200, maintenance + delta);

  const proteinGrams = Math.round(weightKg * 1.8);
  const fatGrams = Math.round((dailyTarget * 0.25) / 9);
  const carbsGrams = Math.round(
    (dailyTarget - proteinGrams * 4 - fatGrams * 9) / 4,
  );

  const workouts =
    typeof data.exerciseDaysPerWeek === "number"
      ? data.exerciseDaysPerWeek
      : 3;

  const water =
    typeof data.dailyWaterIntakeLiters === "number" &&
    data.dailyWaterIntakeLiters > 0
      ? Math.max(2.5, data.dailyWaterIntakeLiters)
      : Math.round((weightKg * 0.035) * 10) / 10;

  let estimatedWeeksToGoal: number | null = null;
  const diffKg = Math.abs(targetKg - weightKg);
  if (diffKg > 0.5 && type !== "maintenance") {
    const weeklyChange = type === "deficit" ? 0.5 : 0.25;
    estimatedWeeksToGoal = Math.max(1, Math.round(diffKg / weeklyChange));
  }

  return {
    dailyCalorieTarget: dailyTarget,
    maintenanceCalories: maintenance,
    calorieAdjustment: Math.abs(delta),
    adjustmentType: type,
    proteinGrams: Math.max(proteinGrams, 80),
    carbsGrams: Math.max(carbsGrams, 50),
    fatGrams: Math.max(fatGrams, 40),
    waterLiters: water,
    workoutsPerWeek: workouts,
    estimatedWeeksToGoal,
    strategySummary: strategyFor(data.primaryGoal, workouts),
  };
}

export function passwordStrength(password: string): {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  hints: string[];
} {
  const hints: string[] = [];
  let score = 0;
  if (password.length >= 8) score += 1;
  else hints.push("Use at least 8 characters");
  if (/[A-Z]/.test(password)) score += 1;
  else hints.push("Add an uppercase letter");
  if (/[0-9]/.test(password)) score += 1;
  else hints.push("Add a number");
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else hints.push("Add a special character");

  const labels = ["Weak", "Fair", "Good", "Strong"] as const;
  return { score, label: labels[Math.max(0, score - 1)] ?? "Weak", hints };
}
