export type MeasurementSystem = "metric" | "imperial";
export type Gender = "male" | "female";
export type FitnessGoal =
  | "lose-weight"
  | "build-muscle"
  | "maintain-weight"
  | "athletic-performance"
  | "overall-health"
  | "increase-strength"
  | "improve-endurance";
export type ActivityLevel =
  | "sedentary"
  | "lightly-active"
  | "moderately-active"
  | "very-active"
  | "extremely-active";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type DietType =
  | "none"
  | "high-protein"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "low-carb"
  | "mediterranean"
  | "gluten-free"
  | "custom";
export type PlanTier = "free" | "pro";
export type OnboardingStep =
  | "personal"
  | "goals"
  | "activity"
  | "experience"
  | "nutrition"
  | "lifestyle"
  | "health";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  dateOfBirth: string;
  country: string;
  measurementSystem: MeasurementSystem;
  plan: PlanTier;
  createdAt: string;
  onboardingComplete: boolean;
  introSeen: boolean;
  pricingSeen: boolean;
}

export interface RegisterDraft {
  step: number;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  country: string;
  measurementSystem: MeasurementSystem;
  agreedToTerms: boolean;
}

export interface OnboardingData {
  currentStep: OnboardingStep;
  // Personal
  gender: Gender | "";
  age: number | "";
  currentWeight: number | "";
  height: number | "";
  targetWeight: number | "";
  measurementSystem: MeasurementSystem;
  // Goals
  primaryGoal: FitnessGoal | "";
  secondaryGoal: FitnessGoal | "";
  // Activity
  activityLevel: ActivityLevel | "";
  exerciseDaysPerWeek: number | "";
  workoutDurationMinutes: number | "";
  exerciseTypes: string[];
  hasGymAccess: boolean | null;
  availableEquipment: string[];
  // Experience
  experienceLevel: ExperienceLevel | "";
  followedProgramBefore: boolean | null;
  knowsCalorieTracking: boolean | null;
  understandsMacros: boolean | null;
  usedTrackingAppBefore: boolean | null;
  // Nutrition
  dietType: DietType | "";
  foodAllergies: string;
  dislikedFoods: string;
  mealsPerDay: number | "";
  cooksAtHome: boolean | null;
  dailyWaterIntakeLiters: number | "";
  wantMealSuggestions: boolean | null;
  wantCompleteMealPlans: boolean | null;
  // Lifestyle
  wakeTime: string;
  sleepTime: string;
  sleepHours: number | "";
  stressLevel: number | "";
  occupationType: string;
  exerciseTimeAvailable: string;
  goalBlockers: string[];
  // Health
  previousInjuries: string;
  physicalLimitations: string;
  medicalConditions: string;
  exercisesToAvoid: string;
  acceptedHealthDisclaimer: boolean;
}

export interface NutritionPlan {
  dailyCalorieTarget: number;
  maintenanceCalories: number;
  calorieAdjustment: number;
  adjustmentType: "deficit" | "surplus" | "maintenance";
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  workoutsPerWeek: number;
  estimatedWeeksToGoal: number | null;
  strategySummary: string;
}

export interface SessionState {
  user: UserProfile | null;
  onboarding: OnboardingData | null;
  nutritionPlan: NutritionPlan | null;
  registerDraft: RegisterDraft | null;
}

export type FoodCategory =
  | "protein"
  | "carb"
  | "fat"
  | "fruit"
  | "vegetable"
  | "condiment"
  | "snack"
  | "drink"
  | "prepared"
  | "grocery"
  | "fast-food"
  | "restaurant";

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  /** Human-readable serving label, e.g. "100g", "1 cup" */
  serving: string;
  /** Grams represented by one serving — used to scale custom quantities */
  servingGrams?: number;
  category?: FoodCategory;
}

export interface LoggedMeal {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  food: FoodItem;
  loggedAt: string;
  /** Multiplier of the food's base serving (1 = one serving) */
  servings?: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
  unit: "kg" | "lb";
  instructions: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  durationMinutes: number;
  exercises: Exercise[];
  scheduledDay: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  target: number;
  current: number;
  unit: string;
}

export interface DashboardData {
  caloriesConsumed: number;
  calorieTarget: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  waterLiters: number;
  waterTarget: number;
  steps: number;
  stepTarget: number;
  currentWeight: number;
  goalWeight: number;
  streak: number;
  motivationalMessage: string;
  todayWorkout: WorkoutSession | null;
  habits: Habit[];
  weeklyProgress: { day: string; calories: number; workouts: number }[];
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "personal",
  "goals",
  "activity",
  "experience",
  "nutrition",
  "lifestyle",
  "health",
];

export const defaultOnboarding = (): OnboardingData => ({
  currentStep: "personal",
  gender: "",
  age: "",
  currentWeight: "",
  height: "",
  targetWeight: "",
  measurementSystem: "metric",
  primaryGoal: "",
  secondaryGoal: "",
  activityLevel: "",
  exerciseDaysPerWeek: "",
  workoutDurationMinutes: "",
  exerciseTypes: [],
  hasGymAccess: null,
  availableEquipment: [],
  experienceLevel: "",
  followedProgramBefore: null,
  knowsCalorieTracking: null,
  understandsMacros: null,
  usedTrackingAppBefore: null,
  dietType: "",
  foodAllergies: "",
  dislikedFoods: "",
  mealsPerDay: "",
  cooksAtHome: null,
  dailyWaterIntakeLiters: "",
  wantMealSuggestions: null,
  wantCompleteMealPlans: null,
  wakeTime: "07:00",
  sleepTime: "23:00",
  sleepHours: "",
  stressLevel: "",
  occupationType: "",
  exerciseTimeAvailable: "",
  goalBlockers: [],
  previousInjuries: "",
  physicalLimitations: "",
  medicalConditions: "",
  exercisesToAvoid: "",
  acceptedHealthDisclaimer: false,
});

export const defaultRegisterDraft = (): RegisterDraft => ({
  step: 0,
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  country: "",
  measurementSystem: "metric",
  agreedToTerms: false,
});
