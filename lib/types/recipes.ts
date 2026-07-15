export type MealCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "pre-workout"
  | "post-workout"
  | "high-protein"
  | "low-calorie"
  | "quick"
  | "meal-prep"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "mediterranean"
  | "custom";

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  allergenTags?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  imageUrl: string;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: Ingredient[];
  portionSize: string;
  servings: number;
  steps: string[];
  allergens: string[];
  categories: MealCategory[];
  mealTypes: Array<"breakfast" | "lunch" | "dinner" | "snack">;
  equipment: string[];
  isPro: boolean;
  tags: string[];
}

export interface MealPlanDay {
  day: string;
  recipeIds: string[];
}

export interface WeeklyMealPlan {
  id: string;
  name: string;
  days: MealPlanDay[];
  isPro: boolean;
}
