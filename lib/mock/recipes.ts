import type { Recipe, WeeklyMealPlan } from "@/lib/types/recipes";

export const RECIPES: Recipe[] = [
  {
    id: "r1",
    name: "High-Protein Overnight Oats",
    imageUrl:
      "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
    prepMinutes: 10,
    cookMinutes: 0,
    difficulty: "easy",
    calories: 420,
    protein: 32,
    carbs: 48,
    fat: 12,
    fiber: 8,
    ingredients: [
      { id: "i1", name: "Rolled oats", amount: "50g", calories: 190, protein: 7, carbs: 34, fat: 4 },
      { id: "i2", name: "Greek yogurt", amount: "150g", calories: 90, protein: 15, carbs: 5, fat: 0 },
      { id: "i3", name: "Whey protein", amount: "1 scoop", calories: 120, protein: 24, carbs: 3, fat: 1 },
      { id: "i4", name: "Berries", amount: "80g", calories: 40, protein: 0.5, carbs: 10, fat: 0 },
    ],
    portionSize: "1 bowl",
    servings: 1,
    steps: [
      "Mix oats, yogurt, protein, and a splash of milk.",
      "Refrigerate overnight.",
      "Top with berries before eating.",
    ],
    allergens: ["dairy", "gluten"],
    categories: ["breakfast", "high-protein", "meal-prep", "quick"],
    mealTypes: ["breakfast"],
    equipment: ["bowl", "fridge"],
    isPro: false,
    tags: ["easy", "make-ahead"],
  },
  {
    id: "r2",
    name: "Chipotle-Style Chicken Bowl (Home)",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    prepMinutes: 15,
    cookMinutes: 20,
    difficulty: "medium",
    calories: 560,
    protein: 45,
    carbs: 58,
    fat: 16,
    fiber: 10,
    ingredients: [
      { id: "i5", name: "Chicken breast", amount: "150g", calories: 248, protein: 46, carbs: 0, fat: 5 },
      { id: "i6", name: "Cooked rice", amount: "150g", calories: 195, protein: 4, carbs: 42, fat: 0.5 },
      { id: "i7", name: "Black beans", amount: "80g", calories: 90, protein: 6, carbs: 15, fat: 0.5 },
      { id: "i8", name: "Salsa + lettuce", amount: "1 cup", calories: 35, protein: 1, carbs: 6, fat: 0 },
    ],
    portionSize: "1 bowl",
    servings: 1,
    steps: [
      "Season and cook chicken.",
      "Build bowl with rice, beans, chicken, salsa, and greens.",
    ],
    allergens: [],
    categories: ["lunch", "dinner", "high-protein", "meal-prep"],
    mealTypes: ["lunch", "dinner"],
    equipment: ["skillet", "knife"],
    isPro: true,
    tags: ["macro-friendly"],
  },
  {
    id: "r3",
    name: "Greek Turkey Wrap",
    imageUrl:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    prepMinutes: 10,
    cookMinutes: 0,
    difficulty: "easy",
    calories: 380,
    protein: 34,
    carbs: 32,
    fat: 12,
    fiber: 5,
    ingredients: [
      { id: "i9", name: "Whole wheat wrap", amount: "1", calories: 140, protein: 5, carbs: 24, fat: 3 },
      { id: "i10", name: "Turkey breast", amount: "120g", calories: 130, protein: 26, carbs: 0, fat: 2 },
      { id: "i11", name: "Feta + veggies", amount: "1 serving", calories: 110, protein: 3, carbs: 8, fat: 7 },
    ],
    portionSize: "1 wrap",
    servings: 1,
    steps: ["Layer ingredients in wrap.", "Roll tightly and slice."],
    allergens: ["dairy", "gluten"],
    categories: ["lunch", "quick", "high-protein", "mediterranean"],
    mealTypes: ["lunch"],
    equipment: ["none"],
    isPro: false,
    tags: ["quick"],
  },
  {
    id: "r4",
    name: "Post-Workout Banana Protein Smoothie",
    imageUrl:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
    prepMinutes: 5,
    cookMinutes: 0,
    difficulty: "easy",
    calories: 320,
    protein: 28,
    carbs: 40,
    fat: 5,
    fiber: 4,
    ingredients: [
      { id: "i12", name: "Banana", amount: "1", calories: 105, protein: 1, carbs: 27, fat: 0 },
      { id: "i13", name: "Protein powder", amount: "1 scoop", calories: 120, protein: 24, carbs: 3, fat: 1 },
      { id: "i14", name: "Milk or alt milk", amount: "250ml", calories: 95, protein: 3, carbs: 10, fat: 4 },
    ],
    portionSize: "1 smoothie",
    servings: 1,
    steps: ["Blend all ingredients until smooth."],
    allergens: ["dairy"],
    categories: ["post-workout", "snack", "high-protein", "quick"],
    mealTypes: ["snack", "breakfast"],
    equipment: ["blender"],
    isPro: true,
    tags: ["recovery"],
  },
  {
    id: "r5",
    name: "Salmon, Quinoa & Greens",
    imageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    prepMinutes: 10,
    cookMinutes: 20,
    difficulty: "medium",
    calories: 540,
    protein: 40,
    carbs: 42,
    fat: 22,
    fiber: 7,
    ingredients: [
      { id: "i15", name: "Salmon", amount: "140g", calories: 290, protein: 32, carbs: 0, fat: 18 },
      { id: "i16", name: "Quinoa cooked", amount: "150g", calories: 180, protein: 6, carbs: 32, fat: 3 },
      { id: "i17", name: "Mixed greens + olive oil", amount: "1 bowl", calories: 70, protein: 2, carbs: 10, fat: 1 },
    ],
    portionSize: "1 plate",
    servings: 1,
    steps: ["Bake or pan-sear salmon.", "Serve over quinoa and greens."],
    allergens: ["fish"],
    categories: ["dinner", "high-protein", "mediterranean"],
    mealTypes: ["dinner"],
    equipment: ["oven or skillet"],
    isPro: true,
    tags: ["omega-3"],
  },
  {
    id: "r6",
    name: "Low-Cal Veggie Egg Scramble",
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    prepMinutes: 5,
    cookMinutes: 8,
    difficulty: "easy",
    calories: 240,
    protein: 22,
    carbs: 8,
    fat: 14,
    fiber: 3,
    ingredients: [
      { id: "i18", name: "Eggs", amount: "3", calories: 210, protein: 18, carbs: 1, fat: 15 },
      { id: "i19", name: "Spinach + peppers", amount: "1 cup", calories: 30, protein: 2, carbs: 5, fat: 0 },
    ],
    portionSize: "1 plate",
    servings: 1,
    steps: ["Scramble eggs with veggies over medium heat."],
    allergens: ["eggs"],
    categories: ["breakfast", "low-calorie", "high-protein", "quick", "keto"],
    mealTypes: ["breakfast"],
    equipment: ["skillet"],
    isPro: false,
    tags: ["cutting"],
  },
];

export const SAMPLE_WEEKLY_MEAL_PLAN: WeeklyMealPlan = {
  id: "wmp1",
  name: "Balanced training week",
  isPro: true,
  days: [
    { day: "Monday", recipeIds: ["r1", "r2", "r5"] },
    { day: "Tuesday", recipeIds: ["r6", "r3", "r2"] },
    { day: "Wednesday", recipeIds: ["r1", "r2", "r5"] },
    { day: "Thursday", recipeIds: ["r6", "r3", "r4"] },
    { day: "Friday", recipeIds: ["r1", "r2", "r5"] },
    { day: "Saturday", recipeIds: ["r6", "r3", "r2"] },
    { day: "Sunday", recipeIds: ["r1", "r5", "r4"] },
  ],
};

export function getRecipeById(id: string) {
  return RECIPES.find((r) => r.id === id);
}

export function scaleRecipe(recipe: Recipe, servings: number): Recipe {
  const factor = servings / recipe.servings;
  return {
    ...recipe,
    servings,
    calories: Math.round(recipe.calories * factor),
    protein: Math.round(recipe.protein * factor * 10) / 10,
    carbs: Math.round(recipe.carbs * factor * 10) / 10,
    fat: Math.round(recipe.fat * factor * 10) / 10,
    fiber: Math.round(recipe.fiber * factor * 10) / 10,
    ingredients: recipe.ingredients.map((ing) => ({
      ...ing,
      calories: Math.round(ing.calories * factor),
      protein: Math.round(ing.protein * factor * 10) / 10,
      carbs: Math.round(ing.carbs * factor * 10) / 10,
      fat: Math.round(ing.fat * factor * 10) / 10,
    })),
  };
}

export function recommendRecipes(input: {
  remainingCalories: number;
  remainingProtein: number;
  isPro: boolean;
  allergies?: string;
  preWorkout?: boolean;
  postWorkout?: boolean;
}): Recipe[] {
  const allergy = (input.allergies || "").toLowerCase();
  let list = RECIPES.filter((r) => {
    if (!input.isPro && r.isPro) return false;
    if (allergy && r.allergens.some((a) => allergy.includes(a))) return false;
    return true;
  });

  if (input.preWorkout) {
    list = [...list].sort((a, b) => b.carbs - a.carbs);
  } else if (input.postWorkout) {
    list = [...list].sort(
      (a, b) => b.protein + b.carbs - (a.protein + a.carbs),
    );
  } else if (input.remainingProtein > 40) {
    list = [...list].sort((a, b) => b.protein - a.protein);
  } else if (input.remainingCalories < 400) {
    list = [...list].sort((a, b) => a.calories - b.calories);
  } else {
    list = [...list].sort(
      (a, b) =>
        Math.abs(a.calories - Math.min(input.remainingCalories, 600)) -
        Math.abs(b.calories - Math.min(input.remainingCalories, 600)),
    );
  }

  return list.slice(0, 4);
}
