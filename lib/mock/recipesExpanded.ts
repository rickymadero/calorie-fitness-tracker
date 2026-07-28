import type { Recipe } from "@/lib/types/recipes";

/** Large-scale recipe inventory for Evolve. */
export const EXPANDED_RECIPES: Recipe[] = [
  {
    "id": "r7",
    "name": "Protein Pancakes",
    "imageUrl": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 10,
    "difficulty": "easy",
    "calories": 380,
    "protein": 32,
    "carbs": 36,
    "fat": 10,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x7-1",
        "name": "Protein pancake mix",
        "amount": "60g",
        "calories": 160,
        "protein": 13.4,
        "carbs": 15.1,
        "fat": 4.2
      },
      {
        "id": "x7-2",
        "name": "Egg whites",
        "amount": "120g",
        "calories": 106,
        "protein": 9,
        "carbs": 10.1,
        "fat": 2.8
      },
      {
        "id": "x7-3",
        "name": "Berries",
        "amount": "80g",
        "calories": 76,
        "protein": 6.4,
        "carbs": 7.2,
        "fat": 2
      },
      {
        "id": "x7-4",
        "name": "Sugar-free syrup",
        "amount": "1 tbsp",
        "calories": 38,
        "protein": 3.2,
        "carbs": 3.6,
        "fat": 1
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Protein Pancakes.",
      "Cook about 10 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "gluten",
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "quick"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r8",
    "name": "Egg White Veggie Omelette",
    "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 8,
    "cookMinutes": 8,
    "difficulty": "easy",
    "calories": 210,
    "protein": 28,
    "carbs": 8,
    "fat": 6,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x8-1",
        "name": "Egg whites",
        "amount": "200g",
        "calories": 88,
        "protein": 11.8,
        "carbs": 3.4,
        "fat": 2.5
      },
      {
        "id": "x8-2",
        "name": "Spinach + peppers",
        "amount": "1.5 cups",
        "calories": 59,
        "protein": 7.8,
        "carbs": 2.2,
        "fat": 1.7
      },
      {
        "id": "x8-3",
        "name": "Olive oil spray",
        "amount": "1 spray",
        "calories": 42,
        "protein": 5.6,
        "carbs": 1.6,
        "fat": 1.2
      },
      {
        "id": "x8-4",
        "name": "Feta light",
        "amount": "20g",
        "calories": 21,
        "protein": 2.8,
        "carbs": 0.8,
        "fat": 0.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Egg White Veggie Omelette.",
      "Cook about 8 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs"
    ],
    "categories": [
      "breakfast",
      "low-calorie",
      "high-protein",
      "keto"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r9",
    "name": "Peanut Butter Banana Toast",
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 390,
    "protein": 16,
    "carbs": 48,
    "fat": 16,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x9-1",
        "name": "Whole grain bread",
        "amount": "2 slices",
        "calories": 164,
        "protein": 6.7,
        "carbs": 20.2,
        "fat": 6.7
      },
      {
        "id": "x9-2",
        "name": "Peanut butter",
        "amount": "28g",
        "calories": 109,
        "protein": 4.5,
        "carbs": 13.4,
        "fat": 4.5
      },
      {
        "id": "x9-3",
        "name": "Banana",
        "amount": "1 medium",
        "calories": 78,
        "protein": 3.2,
        "carbs": 9.6,
        "fat": 3.2
      },
      {
        "id": "x9-4",
        "name": "Cinnamon",
        "amount": "dash",
        "calories": 39,
        "protein": 1.6,
        "carbs": 4.8,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Peanut Butter Banana Toast.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten",
      "peanuts"
    ],
    "categories": [
      "breakfast",
      "quick"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r10",
    "name": "Cottage Cheese Berry Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 280,
    "protein": 30,
    "carbs": 24,
    "fat": 6,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x10-1",
        "name": "Low-fat cottage cheese",
        "amount": "200g",
        "calories": 118,
        "protein": 12.6,
        "carbs": 10.1,
        "fat": 2.5
      },
      {
        "id": "x10-2",
        "name": "Mixed berries",
        "amount": "120g",
        "calories": 78,
        "protein": 8.4,
        "carbs": 6.7,
        "fat": 1.7
      },
      {
        "id": "x10-3",
        "name": "Honey",
        "amount": "1 tsp",
        "calories": 56,
        "protein": 6,
        "carbs": 4.8,
        "fat": 1.2
      },
      {
        "id": "x10-4",
        "name": "Flaxseed",
        "amount": "1 tsp",
        "calories": 28,
        "protein": 3,
        "carbs": 2.4,
        "fat": 0.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Cottage Cheese Berry Bowl.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "quick"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r11",
    "name": "Avocado Toast + Eggs",
    "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 8,
    "difficulty": "easy",
    "calories": 420,
    "protein": 20,
    "carbs": 32,
    "fat": 24,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x11-1",
        "name": "Sourdough",
        "amount": "1 slice",
        "calories": 176,
        "protein": 8.4,
        "carbs": 13.4,
        "fat": 10.1
      },
      {
        "id": "x11-2",
        "name": "Avocado",
        "amount": "1/2",
        "calories": 118,
        "protein": 5.6,
        "carbs": 9,
        "fat": 6.7
      },
      {
        "id": "x11-3",
        "name": "Eggs",
        "amount": "2",
        "calories": 84,
        "protein": 4,
        "carbs": 6.4,
        "fat": 4.8
      },
      {
        "id": "x11-4",
        "name": "Chili flakes",
        "amount": "pinch",
        "calories": 42,
        "protein": 2,
        "carbs": 3.2,
        "fat": 2.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Avocado Toast + Eggs.",
      "Cook about 8 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "gluten"
    ],
    "categories": [
      "breakfast",
      "mediterranean"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r12",
    "name": "Turkey Breakfast Burrito",
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 12,
    "cookMinutes": 12,
    "difficulty": "medium",
    "calories": 480,
    "protein": 36,
    "carbs": 42,
    "fat": 16,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x12-1",
        "name": "Whole wheat tortilla",
        "amount": "1",
        "calories": 202,
        "protein": 15.1,
        "carbs": 17.6,
        "fat": 6.7
      },
      {
        "id": "x12-2",
        "name": "Ground turkey",
        "amount": "120g",
        "calories": 134,
        "protein": 10.1,
        "carbs": 11.8,
        "fat": 4.5
      },
      {
        "id": "x12-3",
        "name": "Eggs",
        "amount": "2",
        "calories": 96,
        "protein": 7.2,
        "carbs": 8.4,
        "fat": 3.2
      },
      {
        "id": "x12-4",
        "name": "Salsa + cheese",
        "amount": "1 serving",
        "calories": 48,
        "protein": 3.6,
        "carbs": 4.2,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Turkey Breakfast Burrito.",
      "Cook about 12 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "gluten",
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r13",
    "name": "Chia Protein Pudding",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 8,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 310,
    "protein": 24,
    "carbs": 28,
    "fat": 12,
    "fiber": 10,
    "ingredients": [
      {
        "id": "x13-1",
        "name": "Chia seeds",
        "amount": "30g",
        "calories": 130,
        "protein": 10.1,
        "carbs": 11.8,
        "fat": 5
      },
      {
        "id": "x13-2",
        "name": "Plant protein",
        "amount": "1 scoop",
        "calories": 87,
        "protein": 6.7,
        "carbs": 7.8,
        "fat": 3.4
      },
      {
        "id": "x13-3",
        "name": "Almond milk",
        "amount": "250ml",
        "calories": 62,
        "protein": 4.8,
        "carbs": 5.6,
        "fat": 2.4
      },
      {
        "id": "x13-4",
        "name": "Berries",
        "amount": "80g",
        "calories": 31,
        "protein": 2.4,
        "carbs": 2.8,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chia Protein Pudding.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "breakfast",
      "high-protein",
      "meal-prep",
      "vegan"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r14",
    "name": "Smoked Salmon Bagel Plate",
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 450,
    "protein": 28,
    "carbs": 44,
    "fat": 16,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x14-1",
        "name": "Bagel half",
        "amount": "1",
        "calories": 189,
        "protein": 11.8,
        "carbs": 18.5,
        "fat": 6.7
      },
      {
        "id": "x14-2",
        "name": "Smoked salmon",
        "amount": "80g",
        "calories": 126,
        "protein": 7.8,
        "carbs": 12.3,
        "fat": 4.5
      },
      {
        "id": "x14-3",
        "name": "Light cream cheese",
        "amount": "30g",
        "calories": 90,
        "protein": 5.6,
        "carbs": 8.8,
        "fat": 3.2
      },
      {
        "id": "x14-4",
        "name": "Cucumber + dill",
        "amount": "1 serving",
        "calories": 45,
        "protein": 2.8,
        "carbs": 4.4,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Smoked Salmon Bagel Plate.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish",
      "gluten",
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "mediterranean"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r15",
    "name": "Steel-Cut Oats + Whey",
    "imageUrl": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 20,
    "difficulty": "easy",
    "calories": 400,
    "protein": 34,
    "carbs": 46,
    "fat": 8,
    "fiber": 7,
    "ingredients": [
      {
        "id": "x15-1",
        "name": "Steel-cut oats",
        "amount": "50g dry",
        "calories": 168,
        "protein": 14.3,
        "carbs": 19.3,
        "fat": 3.4
      },
      {
        "id": "x15-2",
        "name": "Whey protein",
        "amount": "1 scoop",
        "calories": 112,
        "protein": 9.5,
        "carbs": 12.9,
        "fat": 2.2
      },
      {
        "id": "x15-3",
        "name": "Banana",
        "amount": "1/2",
        "calories": 80,
        "protein": 6.8,
        "carbs": 9.2,
        "fat": 1.6
      },
      {
        "id": "x15-4",
        "name": "Almond milk",
        "amount": "200ml",
        "calories": 40,
        "protein": 3.4,
        "carbs": 4.6,
        "fat": 0.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Steel-Cut Oats + Whey.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy",
      "gluten"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r16",
    "name": "Breakfast Tofu Scramble",
    "imageUrl": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 10,
    "difficulty": "easy",
    "calories": 290,
    "protein": 22,
    "carbs": 18,
    "fat": 14,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x16-1",
        "name": "Firm tofu",
        "amount": "180g",
        "calories": 122,
        "protein": 9.2,
        "carbs": 7.6,
        "fat": 5.9
      },
      {
        "id": "x16-2",
        "name": "Turmeric + spices",
        "amount": "1 tsp",
        "calories": 81,
        "protein": 6.2,
        "carbs": 5,
        "fat": 3.9
      },
      {
        "id": "x16-3",
        "name": "Peppers + onion",
        "amount": "1 cup",
        "calories": 58,
        "protein": 4.4,
        "carbs": 3.6,
        "fat": 2.8
      },
      {
        "id": "x16-4",
        "name": "Olive oil",
        "amount": "1 tsp",
        "calories": 29,
        "protein": 2.2,
        "carbs": 1.8,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Breakfast Tofu Scramble.",
      "Cook about 10 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy"
    ],
    "categories": [
      "breakfast",
      "vegan",
      "high-protein",
      "vegetarian"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r17",
    "name": "Apple Cinnamon Protein Oatmeal",
    "imageUrl": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 8,
    "cookMinutes": 10,
    "difficulty": "easy",
    "calories": 360,
    "protein": 28,
    "carbs": 48,
    "fat": 7,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x17-1",
        "name": "Rolled oats",
        "amount": "50g",
        "calories": 151,
        "protein": 11.8,
        "carbs": 20.2,
        "fat": 2.9
      },
      {
        "id": "x17-2",
        "name": "Whey protein",
        "amount": "1 scoop",
        "calories": 101,
        "protein": 7.8,
        "carbs": 13.4,
        "fat": 2
      },
      {
        "id": "x17-3",
        "name": "Apple",
        "amount": "1 small",
        "calories": 72,
        "protein": 5.6,
        "carbs": 9.6,
        "fat": 1.4
      },
      {
        "id": "x17-4",
        "name": "Cinnamon",
        "amount": "1 tsp",
        "calories": 36,
        "protein": 2.8,
        "carbs": 4.8,
        "fat": 0.7
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Apple Cinnamon Protein Oatmeal.",
      "Cook about 10 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy",
      "gluten"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "quick"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r18",
    "name": "Breakfast Quinoa Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 15,
    "difficulty": "easy",
    "calories": 340,
    "protein": 18,
    "carbs": 46,
    "fat": 10,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x18-1",
        "name": "Cooked quinoa",
        "amount": "150g",
        "calories": 143,
        "protein": 7.6,
        "carbs": 19.3,
        "fat": 4.2
      },
      {
        "id": "x18-2",
        "name": "Greek yogurt",
        "amount": "100g",
        "calories": 95,
        "protein": 5,
        "carbs": 12.9,
        "fat": 2.8
      },
      {
        "id": "x18-3",
        "name": "Blueberries",
        "amount": "80g",
        "calories": 68,
        "protein": 3.6,
        "carbs": 9.2,
        "fat": 2
      },
      {
        "id": "x18-4",
        "name": "Walnuts",
        "amount": "10g",
        "calories": 34,
        "protein": 1.8,
        "carbs": 4.6,
        "fat": 1
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Breakfast Quinoa Bowl.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "breakfast",
      "vegetarian",
      "meal-prep"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r19",
    "name": "Grilled Chicken Caesar Salad",
    "imageUrl": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 420,
    "protein": 42,
    "carbs": 14,
    "fat": 22,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x19-1",
        "name": "Chicken breast",
        "amount": "160g",
        "calories": 176,
        "protein": 17.6,
        "carbs": 5.9,
        "fat": 9.2
      },
      {
        "id": "x19-2",
        "name": "Romaine",
        "amount": "3 cups",
        "calories": 118,
        "protein": 11.8,
        "carbs": 3.9,
        "fat": 6.2
      },
      {
        "id": "x19-3",
        "name": "Light Caesar",
        "amount": "2 tbsp",
        "calories": 84,
        "protein": 8.4,
        "carbs": 2.8,
        "fat": 4.4
      },
      {
        "id": "x19-4",
        "name": "Parmesan",
        "amount": "15g",
        "calories": 42,
        "protein": 4.2,
        "carbs": 1.4,
        "fat": 2.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Grilled Chicken Caesar Salad.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy",
      "eggs"
    ],
    "categories": [
      "lunch",
      "high-protein",
      "low-calorie"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r20",
    "name": "Tuna Poke Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 0,
    "difficulty": "medium",
    "calories": 490,
    "protein": 38,
    "carbs": 52,
    "fat": 12,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x20-1",
        "name": "Sushi-grade tuna",
        "amount": "140g",
        "calories": 206,
        "protein": 16,
        "carbs": 21.8,
        "fat": 5
      },
      {
        "id": "x20-2",
        "name": "Sushi rice",
        "amount": "150g cooked",
        "calories": 137,
        "protein": 10.6,
        "carbs": 14.6,
        "fat": 3.4
      },
      {
        "id": "x20-3",
        "name": "Edamame + cucumber",
        "amount": "1 cup",
        "calories": 98,
        "protein": 7.6,
        "carbs": 10.4,
        "fat": 2.4
      },
      {
        "id": "x20-4",
        "name": "Soy + sesame",
        "amount": "1 tbsp",
        "calories": 49,
        "protein": 3.8,
        "carbs": 5.2,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Tuna Poke Bowl.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish",
      "soy"
    ],
    "categories": [
      "lunch",
      "high-protein",
      "mediterranean"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r21",
    "name": "Turkey Chili Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 35,
    "difficulty": "medium",
    "calories": 430,
    "protein": 40,
    "carbs": 36,
    "fat": 12,
    "fiber": 10,
    "ingredients": [
      {
        "id": "x21-1",
        "name": "Lean turkey",
        "amount": "150g",
        "calories": 181,
        "protein": 16.8,
        "carbs": 15.1,
        "fat": 5
      },
      {
        "id": "x21-2",
        "name": "Kidney beans",
        "amount": "100g",
        "calories": 120,
        "protein": 11.2,
        "carbs": 10.1,
        "fat": 3.4
      },
      {
        "id": "x21-3",
        "name": "Tomato base",
        "amount": "1 cup",
        "calories": 86,
        "protein": 8,
        "carbs": 7.2,
        "fat": 2.4
      },
      {
        "id": "x21-4",
        "name": "Spices",
        "amount": "1 tbsp",
        "calories": 43,
        "protein": 4,
        "carbs": 3.6,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Turkey Chili Bowl.",
      "Cook about 35 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r22",
    "name": "Chickpea Mediterranean Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 20,
    "difficulty": "easy",
    "calories": 460,
    "protein": 20,
    "carbs": 58,
    "fat": 16,
    "fiber": 14,
    "ingredients": [
      {
        "id": "x22-1",
        "name": "Chickpeas",
        "amount": "150g",
        "calories": 193,
        "protein": 8.4,
        "carbs": 24.4,
        "fat": 6.7
      },
      {
        "id": "x22-2",
        "name": "Couscous",
        "amount": "100g cooked",
        "calories": 129,
        "protein": 5.6,
        "carbs": 16.2,
        "fat": 4.5
      },
      {
        "id": "x22-3",
        "name": "Cucumber tomato salad",
        "amount": "1.5 cups",
        "calories": 92,
        "protein": 4,
        "carbs": 11.6,
        "fat": 3.2
      },
      {
        "id": "x22-4",
        "name": "Olive oil + lemon",
        "amount": "1 tbsp",
        "calories": 46,
        "protein": 2,
        "carbs": 5.8,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chickpea Mediterranean Bowl.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "vegetarian",
      "vegan",
      "mediterranean",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r23",
    "name": "Chicken Teriyaki Rice Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 20,
    "difficulty": "medium",
    "calories": 540,
    "protein": 42,
    "carbs": 62,
    "fat": 10,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x23-1",
        "name": "Chicken breast",
        "amount": "160g",
        "calories": 227,
        "protein": 17.6,
        "carbs": 26,
        "fat": 4.2
      },
      {
        "id": "x23-2",
        "name": "Brown rice",
        "amount": "180g cooked",
        "calories": 151,
        "protein": 11.8,
        "carbs": 17.4,
        "fat": 2.8
      },
      {
        "id": "x23-3",
        "name": "Broccoli",
        "amount": "150g",
        "calories": 108,
        "protein": 8.4,
        "carbs": 12.4,
        "fat": 2
      },
      {
        "id": "x23-4",
        "name": "Teriyaki sauce",
        "amount": "2 tbsp",
        "calories": 54,
        "protein": 4.2,
        "carbs": 6.2,
        "fat": 1
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chicken Teriyaki Rice Bowl.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy"
    ],
    "categories": [
      "lunch",
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r24",
    "name": "Lean Beef Lettuce Wraps",
    "imageUrl": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 10,
    "difficulty": "medium",
    "calories": 360,
    "protein": 34,
    "carbs": 12,
    "fat": 18,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x24-1",
        "name": "Lean ground beef",
        "amount": "150g",
        "calories": 151,
        "protein": 14.3,
        "carbs": 5,
        "fat": 7.6
      },
      {
        "id": "x24-2",
        "name": "Butter lettuce",
        "amount": "6 leaves",
        "calories": 101,
        "protein": 9.5,
        "carbs": 3.4,
        "fat": 5
      },
      {
        "id": "x24-3",
        "name": "Water chestnuts",
        "amount": "40g",
        "calories": 72,
        "protein": 6.8,
        "carbs": 2.4,
        "fat": 3.6
      },
      {
        "id": "x24-4",
        "name": "Garlic sauce",
        "amount": "1 tbsp",
        "calories": 36,
        "protein": 3.4,
        "carbs": 1.2,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Lean Beef Lettuce Wraps.",
      "Cook about 10 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "high-protein",
      "low-calorie",
      "keto"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r25",
    "name": "Shrimp Quinoa Salad",
    "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 10,
    "difficulty": "easy",
    "calories": 410,
    "protein": 36,
    "carbs": 38,
    "fat": 10,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x25-1",
        "name": "Shrimp",
        "amount": "150g",
        "calories": 172,
        "protein": 15.1,
        "carbs": 16,
        "fat": 4.2
      },
      {
        "id": "x25-2",
        "name": "Quinoa",
        "amount": "140g cooked",
        "calories": 115,
        "protein": 10.1,
        "carbs": 10.6,
        "fat": 2.8
      },
      {
        "id": "x25-3",
        "name": "Mixed greens",
        "amount": "2 cups",
        "calories": 82,
        "protein": 7.2,
        "carbs": 7.6,
        "fat": 2
      },
      {
        "id": "x25-4",
        "name": "Lemon vinaigrette",
        "amount": "1 tbsp",
        "calories": 41,
        "protein": 3.6,
        "carbs": 3.8,
        "fat": 1
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Shrimp Quinoa Salad.",
      "Cook about 10 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "shellfish"
    ],
    "categories": [
      "lunch",
      "high-protein",
      "mediterranean"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r26",
    "name": "BBQ Chicken Sweet Potato",
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc7f3d?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 35,
    "difficulty": "easy",
    "calories": 480,
    "protein": 38,
    "carbs": 50,
    "fat": 10,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x26-1",
        "name": "Chicken breast",
        "amount": "150g",
        "calories": 202,
        "protein": 16,
        "carbs": 21,
        "fat": 4.2
      },
      {
        "id": "x26-2",
        "name": "Sweet potato",
        "amount": "200g",
        "calories": 134,
        "protein": 10.6,
        "carbs": 14,
        "fat": 2.8
      },
      {
        "id": "x26-3",
        "name": "BBQ sauce light",
        "amount": "2 tbsp",
        "calories": 96,
        "protein": 7.6,
        "carbs": 10,
        "fat": 2
      },
      {
        "id": "x26-4",
        "name": "Green beans",
        "amount": "100g",
        "calories": 48,
        "protein": 3.8,
        "carbs": 5,
        "fat": 1
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for BBQ Chicken Sweet Potato.",
      "Cook about 35 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r27",
    "name": "Falafel Plate + Tzatziki",
    "imageUrl": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 15,
    "difficulty": "medium",
    "calories": 520,
    "protein": 22,
    "carbs": 54,
    "fat": 24,
    "fiber": 12,
    "ingredients": [
      {
        "id": "x27-1",
        "name": "Baked falafel",
        "amount": "4 pcs",
        "calories": 218,
        "protein": 9.2,
        "carbs": 22.7,
        "fat": 10.1
      },
      {
        "id": "x27-2",
        "name": "Tzatziki",
        "amount": "60g",
        "calories": 146,
        "protein": 6.2,
        "carbs": 15.1,
        "fat": 6.7
      },
      {
        "id": "x27-3",
        "name": "Pita",
        "amount": "1/2",
        "calories": 104,
        "protein": 4.4,
        "carbs": 10.8,
        "fat": 4.8
      },
      {
        "id": "x27-4",
        "name": "Salad",
        "amount": "2 cups",
        "calories": 52,
        "protein": 2.2,
        "carbs": 5.4,
        "fat": 2.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Falafel Plate + Tzatziki.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten",
      "dairy"
    ],
    "categories": [
      "lunch",
      "vegetarian",
      "mediterranean"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r28",
    "name": "Steak Fajita Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 15,
    "difficulty": "medium",
    "calories": 560,
    "protein": 44,
    "carbs": 48,
    "fat": 18,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x28-1",
        "name": "Flank steak",
        "amount": "150g",
        "calories": 235,
        "protein": 18.5,
        "carbs": 20.2,
        "fat": 7.6
      },
      {
        "id": "x28-2",
        "name": "Rice",
        "amount": "150g cooked",
        "calories": 157,
        "protein": 12.3,
        "carbs": 13.4,
        "fat": 5
      },
      {
        "id": "x28-3",
        "name": "Peppers + onions",
        "amount": "2 cups",
        "calories": 112,
        "protein": 8.8,
        "carbs": 9.6,
        "fat": 3.6
      },
      {
        "id": "x28-4",
        "name": "Guacamole",
        "amount": "40g",
        "calories": 56,
        "protein": 4.4,
        "carbs": 4.8,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Steak Fajita Bowl.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r29",
    "name": "Turkey Club Wrap Light",
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 390,
    "protein": 32,
    "carbs": 34,
    "fat": 12,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x29-1",
        "name": "Wrap",
        "amount": "1",
        "calories": 164,
        "protein": 13.4,
        "carbs": 14.3,
        "fat": 5
      },
      {
        "id": "x29-2",
        "name": "Turkey breast",
        "amount": "120g",
        "calories": 109,
        "protein": 9,
        "carbs": 9.5,
        "fat": 3.4
      },
      {
        "id": "x29-3",
        "name": "Lettuce tomato",
        "amount": "1 cup",
        "calories": 78,
        "protein": 6.4,
        "carbs": 6.8,
        "fat": 2.4
      },
      {
        "id": "x29-4",
        "name": "Light mayo",
        "amount": "1 tbsp",
        "calories": 39,
        "protein": 3.2,
        "carbs": 3.4,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Turkey Club Wrap Light.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten",
      "dairy"
    ],
    "categories": [
      "lunch",
      "quick",
      "high-protein"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r30",
    "name": "Miso Salmon + Broccoli",
    "imageUrl": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 15,
    "difficulty": "medium",
    "calories": 470,
    "protein": 40,
    "carbs": 24,
    "fat": 22,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x30-1",
        "name": "Salmon",
        "amount": "150g",
        "calories": 197,
        "protein": 16.8,
        "carbs": 10.1,
        "fat": 9.2
      },
      {
        "id": "x30-2",
        "name": "Miso glaze",
        "amount": "1 tbsp",
        "calories": 132,
        "protein": 11.2,
        "carbs": 6.7,
        "fat": 6.2
      },
      {
        "id": "x30-3",
        "name": "Broccoli",
        "amount": "200g",
        "calories": 94,
        "protein": 8,
        "carbs": 4.8,
        "fat": 4.4
      },
      {
        "id": "x30-4",
        "name": "Brown rice",
        "amount": "80g cooked",
        "calories": 47,
        "protein": 4,
        "carbs": 2.4,
        "fat": 2.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Miso Salmon + Broccoli.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish",
      "soy"
    ],
    "categories": [
      "lunch",
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r31",
    "name": "Lentil Power Soup",
    "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 30,
    "difficulty": "easy",
    "calories": 320,
    "protein": 20,
    "carbs": 46,
    "fat": 6,
    "fiber": 14,
    "ingredients": [
      {
        "id": "x31-1",
        "name": "Lentils",
        "amount": "120g cooked",
        "calories": 134,
        "protein": 8.4,
        "carbs": 19.3,
        "fat": 2.5
      },
      {
        "id": "x31-2",
        "name": "Carrots celery",
        "amount": "1.5 cups",
        "calories": 90,
        "protein": 5.6,
        "carbs": 12.9,
        "fat": 1.7
      },
      {
        "id": "x31-3",
        "name": "Vegetable broth",
        "amount": "400ml",
        "calories": 64,
        "protein": 4,
        "carbs": 9.2,
        "fat": 1.2
      },
      {
        "id": "x31-4",
        "name": "Spices",
        "amount": "1 tsp",
        "calories": 32,
        "protein": 2,
        "carbs": 4.6,
        "fat": 0.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Lentil Power Soup.",
      "Cook about 30 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "vegetarian",
      "vegan",
      "meal-prep",
      "low-calorie"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r32",
    "name": "Chicken Pesto Pasta Light",
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 15,
    "difficulty": "medium",
    "calories": 530,
    "protein": 40,
    "carbs": 52,
    "fat": 16,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x32-1",
        "name": "Chicken",
        "amount": "140g",
        "calories": 223,
        "protein": 16.8,
        "carbs": 21.8,
        "fat": 6.7
      },
      {
        "id": "x32-2",
        "name": "Whole wheat pasta",
        "amount": "70g dry",
        "calories": 148,
        "protein": 11.2,
        "carbs": 14.6,
        "fat": 4.5
      },
      {
        "id": "x32-3",
        "name": "Pesto light",
        "amount": "1.5 tbsp",
        "calories": 106,
        "protein": 8,
        "carbs": 10.4,
        "fat": 3.2
      },
      {
        "id": "x32-4",
        "name": "Cherry tomatoes",
        "amount": "100g",
        "calories": 53,
        "protein": 4,
        "carbs": 5.2,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chicken Pesto Pasta Light.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy",
      "gluten",
      "nuts"
    ],
    "categories": [
      "lunch",
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r33",
    "name": "Herb Baked Cod + Asparagus",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 18,
    "difficulty": "easy",
    "calories": 340,
    "protein": 38,
    "carbs": 10,
    "fat": 14,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x33-1",
        "name": "Cod fillet",
        "amount": "180g",
        "calories": 143,
        "protein": 16,
        "carbs": 4.2,
        "fat": 5.9
      },
      {
        "id": "x33-2",
        "name": "Asparagus",
        "amount": "200g",
        "calories": 95,
        "protein": 10.6,
        "carbs": 2.8,
        "fat": 3.9
      },
      {
        "id": "x33-3",
        "name": "Olive oil",
        "amount": "1 tsp",
        "calories": 68,
        "protein": 7.6,
        "carbs": 2,
        "fat": 2.8
      },
      {
        "id": "x33-4",
        "name": "Herbs lemon",
        "amount": "to taste",
        "calories": 34,
        "protein": 3.8,
        "carbs": 1,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Herb Baked Cod + Asparagus.",
      "Cook about 18 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "low-calorie",
      "mediterranean"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r34",
    "name": "Turkey Meatballs + Zoodles",
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 20,
    "difficulty": "medium",
    "calories": 390,
    "protein": 40,
    "carbs": 16,
    "fat": 18,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x34-1",
        "name": "Turkey meatballs",
        "amount": "180g",
        "calories": 164,
        "protein": 16.8,
        "carbs": 6.7,
        "fat": 7.6
      },
      {
        "id": "x34-2",
        "name": "Zucchini noodles",
        "amount": "300g",
        "calories": 109,
        "protein": 11.2,
        "carbs": 4.5,
        "fat": 5
      },
      {
        "id": "x34-3",
        "name": "Marinara",
        "amount": "120g",
        "calories": 78,
        "protein": 8,
        "carbs": 3.2,
        "fat": 3.6
      },
      {
        "id": "x34-4",
        "name": "Parmesan",
        "amount": "10g",
        "calories": 39,
        "protein": 4,
        "carbs": 1.6,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Turkey Meatballs + Zoodles.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "low-calorie",
      "keto"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r35",
    "name": "Chicken Stir-Fry + Brown Rice",
    "imageUrl": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 15,
    "difficulty": "medium",
    "calories": 510,
    "protein": 42,
    "carbs": 54,
    "fat": 12,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x35-1",
        "name": "Chicken",
        "amount": "160g",
        "calories": 214,
        "protein": 17.6,
        "carbs": 22.7,
        "fat": 5
      },
      {
        "id": "x35-2",
        "name": "Mixed stir-fry veg",
        "amount": "2 cups",
        "calories": 143,
        "protein": 11.8,
        "carbs": 15.1,
        "fat": 3.4
      },
      {
        "id": "x35-3",
        "name": "Brown rice",
        "amount": "160g cooked",
        "calories": 102,
        "protein": 8.4,
        "carbs": 10.8,
        "fat": 2.4
      },
      {
        "id": "x35-4",
        "name": "Soy garlic sauce",
        "amount": "1.5 tbsp",
        "calories": 51,
        "protein": 4.2,
        "carbs": 5.4,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chicken Stir-Fry + Brown Rice.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r36",
    "name": "Bison Burger Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 12,
    "difficulty": "medium",
    "calories": 480,
    "protein": 44,
    "carbs": 28,
    "fat": 20,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x36-1",
        "name": "Bison patty",
        "amount": "150g",
        "calories": 202,
        "protein": 18.5,
        "carbs": 11.8,
        "fat": 8.4
      },
      {
        "id": "x36-2",
        "name": "Roasted potatoes",
        "amount": "120g",
        "calories": 134,
        "protein": 12.3,
        "carbs": 7.8,
        "fat": 5.6
      },
      {
        "id": "x36-3",
        "name": "Salad greens",
        "amount": "2 cups",
        "calories": 96,
        "protein": 8.8,
        "carbs": 5.6,
        "fat": 4
      },
      {
        "id": "x36-4",
        "name": "Mustard pickles",
        "amount": "1 serving",
        "calories": 48,
        "protein": 4.4,
        "carbs": 2.8,
        "fat": 2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Bison Burger Bowl.",
      "Cook about 12 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r37",
    "name": "Eggplant Parmesan Light",
    "imageUrl": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 30,
    "difficulty": "medium",
    "calories": 420,
    "protein": 24,
    "carbs": 36,
    "fat": 18,
    "fiber": 10,
    "ingredients": [
      {
        "id": "x37-1",
        "name": "Eggplant",
        "amount": "300g",
        "calories": 176,
        "protein": 10.1,
        "carbs": 15.1,
        "fat": 7.6
      },
      {
        "id": "x37-2",
        "name": "Light mozzarella",
        "amount": "60g",
        "calories": 118,
        "protein": 6.7,
        "carbs": 10.1,
        "fat": 5
      },
      {
        "id": "x37-3",
        "name": "Marinara",
        "amount": "150g",
        "calories": 84,
        "protein": 4.8,
        "carbs": 7.2,
        "fat": 3.6
      },
      {
        "id": "x37-4",
        "name": "Breadcrumbs",
        "amount": "20g",
        "calories": 42,
        "protein": 2.4,
        "carbs": 3.6,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Eggplant Parmesan Light.",
      "Cook about 30 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy",
      "gluten"
    ],
    "categories": [
      "dinner",
      "vegetarian",
      "mediterranean"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r38",
    "name": "Garlic Shrimp + Cauli Rice",
    "imageUrl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 12,
    "difficulty": "easy",
    "calories": 350,
    "protein": 36,
    "carbs": 14,
    "fat": 16,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x38-1",
        "name": "Shrimp",
        "amount": "180g",
        "calories": 147,
        "protein": 15.1,
        "carbs": 5.9,
        "fat": 6.7
      },
      {
        "id": "x38-2",
        "name": "Cauliflower rice",
        "amount": "250g",
        "calories": 98,
        "protein": 10.1,
        "carbs": 3.9,
        "fat": 4.5
      },
      {
        "id": "x38-3",
        "name": "Garlic butter light",
        "amount": "1 tbsp",
        "calories": 70,
        "protein": 7.2,
        "carbs": 2.8,
        "fat": 3.2
      },
      {
        "id": "x38-4",
        "name": "Lemon",
        "amount": "wedge",
        "calories": 35,
        "protein": 3.6,
        "carbs": 1.4,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Garlic Shrimp + Cauli Rice.",
      "Cook about 12 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "shellfish"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "low-calorie",
      "keto"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r39",
    "name": "Pork Tenderloin + Veggies",
    "imageUrl": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 25,
    "difficulty": "medium",
    "calories": 450,
    "protein": 42,
    "carbs": 22,
    "fat": 18,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x39-1",
        "name": "Pork tenderloin",
        "amount": "160g",
        "calories": 189,
        "protein": 17.6,
        "carbs": 9.2,
        "fat": 7.6
      },
      {
        "id": "x39-2",
        "name": "Roasted veg medley",
        "amount": "2 cups",
        "calories": 126,
        "protein": 11.8,
        "carbs": 6.2,
        "fat": 5
      },
      {
        "id": "x39-3",
        "name": "Olive oil",
        "amount": "1 tsp",
        "calories": 90,
        "protein": 8.4,
        "carbs": 4.4,
        "fat": 3.6
      },
      {
        "id": "x39-4",
        "name": "Mustard glaze",
        "amount": "1 tbsp",
        "calories": 45,
        "protein": 4.2,
        "carbs": 2.2,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Pork Tenderloin + Veggies.",
      "Cook about 25 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r40",
    "name": "Black Bean Enchilada Bake",
    "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 25,
    "cookMinutes": 35,
    "difficulty": "medium",
    "calories": 490,
    "protein": 26,
    "carbs": 58,
    "fat": 16,
    "fiber": 14,
    "ingredients": [
      {
        "id": "x40-1",
        "name": "Black beans",
        "amount": "200g",
        "calories": 206,
        "protein": 10.9,
        "carbs": 24.4,
        "fat": 6.7
      },
      {
        "id": "x40-2",
        "name": "Corn tortillas",
        "amount": "2",
        "calories": 137,
        "protein": 7.3,
        "carbs": 16.2,
        "fat": 4.5
      },
      {
        "id": "x40-3",
        "name": "Enchilada sauce",
        "amount": "100g",
        "calories": 98,
        "protein": 5.2,
        "carbs": 11.6,
        "fat": 3.2
      },
      {
        "id": "x40-4",
        "name": "Cheese",
        "amount": "40g",
        "calories": 49,
        "protein": 2.6,
        "carbs": 5.8,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Black Bean Enchilada Bake.",
      "Cook about 35 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy",
      "gluten"
    ],
    "categories": [
      "dinner",
      "vegetarian",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r41",
    "name": "Grilled Lamb Chops + Salad",
    "imageUrl": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 12,
    "difficulty": "medium",
    "calories": 520,
    "protein": 40,
    "carbs": 12,
    "fat": 34,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x41-1",
        "name": "Lamb chops",
        "amount": "160g",
        "calories": 218,
        "protein": 16.8,
        "carbs": 5,
        "fat": 14.3
      },
      {
        "id": "x41-2",
        "name": "Greek salad",
        "amount": "2 cups",
        "calories": 146,
        "protein": 11.2,
        "carbs": 3.4,
        "fat": 9.5
      },
      {
        "id": "x41-3",
        "name": "Olive oil",
        "amount": "1 tsp",
        "calories": 104,
        "protein": 8,
        "carbs": 2.4,
        "fat": 6.8
      },
      {
        "id": "x41-4",
        "name": "Oregano",
        "amount": "pinch",
        "calories": 52,
        "protein": 4,
        "carbs": 1.2,
        "fat": 3.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Grilled Lamb Chops + Salad.",
      "Cook about 12 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "dinner",
      "high-protein",
      "mediterranean",
      "keto"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r42",
    "name": "Tofu Coconut Curry",
    "imageUrl": "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 25,
    "difficulty": "medium",
    "calories": 440,
    "protein": 24,
    "carbs": 36,
    "fat": 22,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x42-1",
        "name": "Firm tofu",
        "amount": "180g",
        "calories": 185,
        "protein": 10.1,
        "carbs": 15.1,
        "fat": 9.2
      },
      {
        "id": "x42-2",
        "name": "Light coconut milk",
        "amount": "150ml",
        "calories": 123,
        "protein": 6.7,
        "carbs": 10.1,
        "fat": 6.2
      },
      {
        "id": "x42-3",
        "name": "Curry veg",
        "amount": "2 cups",
        "calories": 88,
        "protein": 4.8,
        "carbs": 7.2,
        "fat": 4.4
      },
      {
        "id": "x42-4",
        "name": "Basmati rice",
        "amount": "100g cooked",
        "calories": 44,
        "protein": 2.4,
        "carbs": 3.6,
        "fat": 2.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Tofu Coconut Curry.",
      "Cook about 25 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy"
    ],
    "categories": [
      "dinner",
      "vegan",
      "vegetarian",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r43",
    "name": "Chicken Shawarma Plate",
    "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 25,
    "difficulty": "medium",
    "calories": 540,
    "protein": 46,
    "carbs": 48,
    "fat": 16,
    "fiber": 7,
    "ingredients": [
      {
        "id": "x43-1",
        "name": "Shawarma chicken",
        "amount": "170g",
        "calories": 227,
        "protein": 19.3,
        "carbs": 20.2,
        "fat": 6.7
      },
      {
        "id": "x43-2",
        "name": "Rice or freekeh",
        "amount": "150g",
        "calories": 151,
        "protein": 12.9,
        "carbs": 13.4,
        "fat": 4.5
      },
      {
        "id": "x43-3",
        "name": "Garlic yogurt",
        "amount": "40g",
        "calories": 108,
        "protein": 9.2,
        "carbs": 9.6,
        "fat": 3.2
      },
      {
        "id": "x43-4",
        "name": "Pickled veg",
        "amount": "1 cup",
        "calories": 54,
        "protein": 4.6,
        "carbs": 4.8,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chicken Shawarma Plate.",
      "Cook about 25 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "mediterranean",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r44",
    "name": "Seared Tuna + Sesame Greens",
    "imageUrl": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 8,
    "difficulty": "medium",
    "calories": 390,
    "protein": 42,
    "carbs": 12,
    "fat": 18,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x44-1",
        "name": "Tuna steak",
        "amount": "160g",
        "calories": 164,
        "protein": 17.6,
        "carbs": 5,
        "fat": 7.6
      },
      {
        "id": "x44-2",
        "name": "Sesame greens",
        "amount": "2 cups",
        "calories": 109,
        "protein": 11.8,
        "carbs": 3.4,
        "fat": 5
      },
      {
        "id": "x44-3",
        "name": "Soy glaze",
        "amount": "1 tbsp",
        "calories": 78,
        "protein": 8.4,
        "carbs": 2.4,
        "fat": 3.6
      },
      {
        "id": "x44-4",
        "name": "Sesame seeds",
        "amount": "1 tsp",
        "calories": 39,
        "protein": 4.2,
        "carbs": 1.2,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Seared Tuna + Sesame Greens.",
      "Cook about 8 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish",
      "soy"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "low-calorie"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r45",
    "name": "Stuffed Peppers Turkey",
    "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 35,
    "difficulty": "medium",
    "calories": 410,
    "protein": 36,
    "carbs": 32,
    "fat": 12,
    "fiber": 7,
    "ingredients": [
      {
        "id": "x45-1",
        "name": "Bell peppers",
        "amount": "2",
        "calories": 172,
        "protein": 15.1,
        "carbs": 13.4,
        "fat": 5
      },
      {
        "id": "x45-2",
        "name": "Ground turkey",
        "amount": "150g",
        "calories": 115,
        "protein": 10.1,
        "carbs": 9,
        "fat": 3.4
      },
      {
        "id": "x45-3",
        "name": "Cooked rice",
        "amount": "80g",
        "calories": 82,
        "protein": 7.2,
        "carbs": 6.4,
        "fat": 2.4
      },
      {
        "id": "x45-4",
        "name": "Tomato sauce",
        "amount": "80g",
        "calories": 41,
        "protein": 3.6,
        "carbs": 3.2,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Stuffed Peppers Turkey.",
      "Cook about 35 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r46",
    "name": "Mushroom Risotto Light",
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc7f3d?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 30,
    "difficulty": "hard",
    "calories": 460,
    "protein": 16,
    "carbs": 62,
    "fat": 14,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x46-1",
        "name": "Arborio rice",
        "amount": "70g dry",
        "calories": 193,
        "protein": 6.7,
        "carbs": 26,
        "fat": 5.9
      },
      {
        "id": "x46-2",
        "name": "Mushrooms",
        "amount": "200g",
        "calories": 129,
        "protein": 4.5,
        "carbs": 17.4,
        "fat": 3.9
      },
      {
        "id": "x46-3",
        "name": "Parmesan",
        "amount": "25g",
        "calories": 92,
        "protein": 3.2,
        "carbs": 12.4,
        "fat": 2.8
      },
      {
        "id": "x46-4",
        "name": "Broth",
        "amount": "500ml",
        "calories": 46,
        "protein": 1.6,
        "carbs": 6.2,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Mushroom Risotto Light.",
      "Cook about 30 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "dinner",
      "vegetarian"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r47",
    "name": "Greek Yogurt Parfait",
    "imageUrl": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 240,
    "protein": 22,
    "carbs": 28,
    "fat": 4,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x47-1",
        "name": "Greek yogurt",
        "amount": "170g",
        "calories": 101,
        "protein": 9.2,
        "carbs": 11.8,
        "fat": 1.7
      },
      {
        "id": "x47-2",
        "name": "Granola light",
        "amount": "25g",
        "calories": 67,
        "protein": 6.2,
        "carbs": 7.8,
        "fat": 1.1
      },
      {
        "id": "x47-3",
        "name": "Berries",
        "amount": "80g",
        "calories": 48,
        "protein": 4.4,
        "carbs": 5.6,
        "fat": 0.8
      },
      {
        "id": "x47-4",
        "name": "Honey",
        "amount": "1 tsp",
        "calories": 24,
        "protein": 2.2,
        "carbs": 2.8,
        "fat": 0.4
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Greek Yogurt Parfait.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "snack",
      "high-protein",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r48",
    "name": "Protein Energy Bites",
    "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 180,
    "protein": 10,
    "carbs": 18,
    "fat": 8,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x48-1",
        "name": "Oats",
        "amount": "30g",
        "calories": 76,
        "protein": 4.2,
        "carbs": 7.6,
        "fat": 3.4
      },
      {
        "id": "x48-2",
        "name": "PB2 / peanut butter",
        "amount": "20g",
        "calories": 50,
        "protein": 2.8,
        "carbs": 5,
        "fat": 2.2
      },
      {
        "id": "x48-3",
        "name": "Protein powder",
        "amount": "15g",
        "calories": 36,
        "protein": 2,
        "carbs": 3.6,
        "fat": 1.6
      },
      {
        "id": "x48-4",
        "name": "Honey",
        "amount": "1 tsp",
        "calories": 18,
        "protein": 1,
        "carbs": 1.8,
        "fat": 0.8
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Protein Energy Bites.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "peanuts",
      "dairy"
    ],
    "categories": [
      "snack",
      "meal-prep",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r49",
    "name": "Tuna Rice Cakes",
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 220,
    "protein": 24,
    "carbs": 20,
    "fat": 4,
    "fiber": 1,
    "ingredients": [
      {
        "id": "x49-1",
        "name": "Rice cakes",
        "amount": "2",
        "calories": 92,
        "protein": 10.1,
        "carbs": 8.4,
        "fat": 1.7
      },
      {
        "id": "x49-2",
        "name": "Tuna in water",
        "amount": "1 can",
        "calories": 62,
        "protein": 6.7,
        "carbs": 5.6,
        "fat": 1.1
      },
      {
        "id": "x49-3",
        "name": "Greek yogurt mix",
        "amount": "2 tbsp",
        "calories": 44,
        "protein": 4.8,
        "carbs": 4,
        "fat": 0.8
      },
      {
        "id": "x49-4",
        "name": "Everything seasoning",
        "amount": "pinch",
        "calories": 22,
        "protein": 2.4,
        "carbs": 2,
        "fat": 0.4
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Tuna Rice Cakes.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish"
    ],
    "categories": [
      "snack",
      "high-protein",
      "quick",
      "post-workout"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r50",
    "name": "Edamame Sea Salt",
    "imageUrl": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 5,
    "difficulty": "easy",
    "calories": 160,
    "protein": 14,
    "carbs": 12,
    "fat": 6,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x50-1",
        "name": "Edamame pods",
        "amount": "150g",
        "calories": 67,
        "protein": 5.9,
        "carbs": 5,
        "fat": 2.5
      },
      {
        "id": "x50-2",
        "name": "Sea salt",
        "amount": "pinch",
        "calories": 45,
        "protein": 3.9,
        "carbs": 3.4,
        "fat": 1.7
      },
      {
        "id": "x50-3",
        "name": "Chili flake",
        "amount": "pinch",
        "calories": 32,
        "protein": 2.8,
        "carbs": 2.4,
        "fat": 1.2
      },
      {
        "id": "x50-4",
        "name": "Lemon",
        "amount": "wedge",
        "calories": 16,
        "protein": 1.4,
        "carbs": 1.2,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Edamame Sea Salt.",
      "Cook about 5 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy"
    ],
    "categories": [
      "snack",
      "vegan",
      "vegetarian",
      "high-protein",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r51",
    "name": "Apple + Almond Butter",
    "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 250,
    "protein": 6,
    "carbs": 28,
    "fat": 14,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x51-1",
        "name": "Apple",
        "amount": "1 medium",
        "calories": 105,
        "protein": 2.5,
        "carbs": 11.8,
        "fat": 5.9
      },
      {
        "id": "x51-2",
        "name": "Almond butter",
        "amount": "20g",
        "calories": 70,
        "protein": 1.7,
        "carbs": 7.8,
        "fat": 3.9
      },
      {
        "id": "x51-3",
        "name": "Cinnamon",
        "amount": "dash",
        "calories": 50,
        "protein": 1.2,
        "carbs": 5.6,
        "fat": 2.8
      },
      {
        "id": "x51-4",
        "name": "Sea salt",
        "amount": "pinch",
        "calories": 25,
        "protein": 0.6,
        "carbs": 2.8,
        "fat": 1.4
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Apple + Almond Butter.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "nuts"
    ],
    "categories": [
      "snack",
      "quick",
      "vegetarian"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r52",
    "name": "Pre-Workout Toast + Honey",
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 280,
    "protein": 8,
    "carbs": 52,
    "fat": 4,
    "fiber": 2,
    "ingredients": [
      {
        "id": "x52-1",
        "name": "White toast",
        "amount": "2 slices",
        "calories": 118,
        "protein": 3.4,
        "carbs": 21.8,
        "fat": 1.7
      },
      {
        "id": "x52-2",
        "name": "Honey",
        "amount": "1.5 tbsp",
        "calories": 78,
        "protein": 2.2,
        "carbs": 14.6,
        "fat": 1.1
      },
      {
        "id": "x52-3",
        "name": "Banana",
        "amount": "1/2",
        "calories": 56,
        "protein": 1.6,
        "carbs": 10.4,
        "fat": 0.8
      },
      {
        "id": "x52-4",
        "name": "Salt",
        "amount": "pinch",
        "calories": 28,
        "protein": 0.8,
        "carbs": 5.2,
        "fat": 0.4
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Pre-Workout Toast + Honey.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten"
    ],
    "categories": [
      "snack",
      "pre-workout",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r53",
    "name": "Recovery Chocolate Milk",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 2,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 260,
    "protein": 16,
    "carbs": 36,
    "fat": 6,
    "fiber": 0,
    "ingredients": [
      {
        "id": "x53-1",
        "name": "Low-fat chocolate milk",
        "amount": "350ml",
        "calories": 109,
        "protein": 6.7,
        "carbs": 15.1,
        "fat": 2.5
      },
      {
        "id": "x53-2",
        "name": "Whey optional",
        "amount": "1/2 scoop",
        "calories": 73,
        "protein": 4.5,
        "carbs": 10.1,
        "fat": 1.7
      },
      {
        "id": "x53-3",
        "name": "Ice",
        "amount": "as needed",
        "calories": 52,
        "protein": 3.2,
        "carbs": 7.2,
        "fat": 1.2
      },
      {
        "id": "x53-4",
        "name": "Cinnamon",
        "amount": "dash",
        "calories": 26,
        "protein": 1.6,
        "carbs": 3.6,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Recovery Chocolate Milk.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "snack",
      "post-workout",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r54",
    "name": "Cottage Cheese + Pineapple",
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 210,
    "protein": 24,
    "carbs": 20,
    "fat": 4,
    "fiber": 1,
    "ingredients": [
      {
        "id": "x54-1",
        "name": "Cottage cheese",
        "amount": "180g",
        "calories": 88,
        "protein": 10.1,
        "carbs": 8.4,
        "fat": 1.7
      },
      {
        "id": "x54-2",
        "name": "Pineapple",
        "amount": "100g",
        "calories": 59,
        "protein": 6.7,
        "carbs": 5.6,
        "fat": 1.1
      },
      {
        "id": "x54-3",
        "name": "Mint",
        "amount": "optional",
        "calories": 42,
        "protein": 4.8,
        "carbs": 4,
        "fat": 0.8
      },
      {
        "id": "x54-4",
        "name": "Chili",
        "amount": "pinch",
        "calories": 21,
        "protein": 2.4,
        "carbs": 2,
        "fat": 0.4
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Cottage Cheese + Pineapple.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "snack",
      "high-protein",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r55",
    "name": "Rice Cake PB2 Stack",
    "imageUrl": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 190,
    "protein": 14,
    "carbs": 22,
    "fat": 6,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x55-1",
        "name": "Rice cakes",
        "amount": "2",
        "calories": 80,
        "protein": 5.9,
        "carbs": 9.2,
        "fat": 2.5
      },
      {
        "id": "x55-2",
        "name": "PB2",
        "amount": "2 tbsp",
        "calories": 53,
        "protein": 3.9,
        "carbs": 6.2,
        "fat": 1.7
      },
      {
        "id": "x55-3",
        "name": "Banana coins",
        "amount": "1/2",
        "calories": 38,
        "protein": 2.8,
        "carbs": 4.4,
        "fat": 1.2
      },
      {
        "id": "x55-4",
        "name": "Cacao nibs",
        "amount": "1 tsp",
        "calories": 19,
        "protein": 1.4,
        "carbs": 2.2,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Rice Cake PB2 Stack.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "peanuts"
    ],
    "categories": [
      "snack",
      "quick",
      "high-protein"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r56",
    "name": "Hard-Boiled Eggs + Hot Sauce",
    "imageUrl": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 10,
    "difficulty": "easy",
    "calories": 160,
    "protein": 14,
    "carbs": 2,
    "fat": 10,
    "fiber": 0,
    "ingredients": [
      {
        "id": "x56-1",
        "name": "Hard-boiled eggs",
        "amount": "2",
        "calories": 67,
        "protein": 5.9,
        "carbs": 0.8,
        "fat": 4.2
      },
      {
        "id": "x56-2",
        "name": "Hot sauce",
        "amount": "1 tsp",
        "calories": 45,
        "protein": 3.9,
        "carbs": 0.6,
        "fat": 2.8
      },
      {
        "id": "x56-3",
        "name": "Salt",
        "amount": "pinch",
        "calories": 32,
        "protein": 2.8,
        "carbs": 0.4,
        "fat": 2
      },
      {
        "id": "x56-4",
        "name": "Pepper",
        "amount": "pinch",
        "calories": 16,
        "protein": 1.4,
        "carbs": 0.2,
        "fat": 1
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Hard-Boiled Eggs + Hot Sauce.",
      "Cook about 10 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs"
    ],
    "categories": [
      "snack",
      "high-protein",
      "keto",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r57",
    "name": "Protein Mug Cake",
    "imageUrl": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 2,
    "difficulty": "easy",
    "calories": 230,
    "protein": 26,
    "carbs": 18,
    "fat": 6,
    "fiber": 2,
    "ingredients": [
      {
        "id": "x57-1",
        "name": "Protein powder",
        "amount": "1 scoop",
        "calories": 97,
        "protein": 10.9,
        "carbs": 7.6,
        "fat": 2.5
      },
      {
        "id": "x57-2",
        "name": "Egg",
        "amount": "1",
        "calories": 64,
        "protein": 7.3,
        "carbs": 5,
        "fat": 1.7
      },
      {
        "id": "x57-3",
        "name": "Cocoa",
        "amount": "1 tsp",
        "calories": 46,
        "protein": 5.2,
        "carbs": 3.6,
        "fat": 1.2
      },
      {
        "id": "x57-4",
        "name": "Baking powder",
        "amount": "1/4 tsp",
        "calories": 23,
        "protein": 2.6,
        "carbs": 1.8,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Protein Mug Cake.",
      "Cook about 2 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "dairy"
    ],
    "categories": [
      "snack",
      "high-protein",
      "quick",
      "post-workout"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r58",
    "name": "Hummus + Veggie Sticks",
    "imageUrl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 180,
    "protein": 8,
    "carbs": 18,
    "fat": 10,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x58-1",
        "name": "Hummus",
        "amount": "60g",
        "calories": 76,
        "protein": 3.4,
        "carbs": 7.6,
        "fat": 4.2
      },
      {
        "id": "x58-2",
        "name": "Carrot sticks",
        "amount": "100g",
        "calories": 50,
        "protein": 2.2,
        "carbs": 5,
        "fat": 2.8
      },
      {
        "id": "x58-3",
        "name": "Cucumber",
        "amount": "100g",
        "calories": 36,
        "protein": 1.6,
        "carbs": 3.6,
        "fat": 2
      },
      {
        "id": "x58-4",
        "name": "Bell pepper",
        "amount": "80g",
        "calories": 18,
        "protein": 0.8,
        "carbs": 1.8,
        "fat": 1
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Hummus + Veggie Sticks.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "sesame"
    ],
    "categories": [
      "snack",
      "vegan",
      "vegetarian",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r59",
    "name": "Chicken Meal-Prep Boxes",
    "imageUrl": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 25,
    "cookMinutes": 30,
    "difficulty": "medium",
    "calories": 500,
    "protein": 45,
    "carbs": 48,
    "fat": 12,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x59-1",
        "name": "Chicken breast",
        "amount": "170g",
        "calories": 210,
        "protein": 18.9,
        "carbs": 20.2,
        "fat": 5
      },
      {
        "id": "x59-2",
        "name": "Rice",
        "amount": "160g cooked",
        "calories": 140,
        "protein": 12.6,
        "carbs": 13.4,
        "fat": 3.4
      },
      {
        "id": "x59-3",
        "name": "Broccoli",
        "amount": "150g",
        "calories": 100,
        "protein": 9,
        "carbs": 9.6,
        "fat": 2.4
      },
      {
        "id": "x59-4",
        "name": "Olive oil",
        "amount": "1 tsp",
        "calories": 50,
        "protein": 4.5,
        "carbs": 4.8,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chicken Meal-Prep Boxes.",
      "Cook about 30 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r60",
    "name": "Beef and Broccoli Prep",
    "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 20,
    "difficulty": "medium",
    "calories": 470,
    "protein": 42,
    "carbs": 30,
    "fat": 16,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x60-1",
        "name": "Lean beef",
        "amount": "160g",
        "calories": 197,
        "protein": 17.6,
        "carbs": 12.6,
        "fat": 6.7
      },
      {
        "id": "x60-2",
        "name": "Broccoli",
        "amount": "250g",
        "calories": 132,
        "protein": 11.8,
        "carbs": 8.4,
        "fat": 4.5
      },
      {
        "id": "x60-3",
        "name": "Brown rice",
        "amount": "120g cooked",
        "calories": 94,
        "protein": 8.4,
        "carbs": 6,
        "fat": 3.2
      },
      {
        "id": "x60-4",
        "name": "Garlic soy sauce",
        "amount": "1.5 tbsp",
        "calories": 47,
        "protein": 4.2,
        "carbs": 3,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Beef and Broccoli Prep.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r61",
    "name": "Vegan Buddha Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 15,
    "difficulty": "easy",
    "calories": 480,
    "protein": 18,
    "carbs": 62,
    "fat": 18,
    "fiber": 14,
    "ingredients": [
      {
        "id": "x61-1",
        "name": "Roasted chickpeas",
        "amount": "120g",
        "calories": 202,
        "protein": 7.6,
        "carbs": 26,
        "fat": 7.6
      },
      {
        "id": "x61-2",
        "name": "Quinoa",
        "amount": "140g",
        "calories": 134,
        "protein": 5,
        "carbs": 17.4,
        "fat": 5
      },
      {
        "id": "x61-3",
        "name": "Roasted veg",
        "amount": "2 cups",
        "calories": 96,
        "protein": 3.6,
        "carbs": 12.4,
        "fat": 3.6
      },
      {
        "id": "x61-4",
        "name": "Tahini drizzle",
        "amount": "1 tbsp",
        "calories": 48,
        "protein": 1.8,
        "carbs": 6.2,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Vegan Buddha Bowl.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "vegan",
      "vegetarian",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r62",
    "name": "Keto Chicken Alfredo Zoodles",
    "imageUrl": "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 15,
    "difficulty": "medium",
    "calories": 430,
    "protein": 40,
    "carbs": 10,
    "fat": 26,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x62-1",
        "name": "Chicken",
        "amount": "160g",
        "calories": 181,
        "protein": 16.8,
        "carbs": 4.2,
        "fat": 10.9
      },
      {
        "id": "x62-2",
        "name": "Zucchini noodles",
        "amount": "300g",
        "calories": 120,
        "protein": 11.2,
        "carbs": 2.8,
        "fat": 7.3
      },
      {
        "id": "x62-3",
        "name": "Light alfredo",
        "amount": "80g",
        "calories": 86,
        "protein": 8,
        "carbs": 2,
        "fat": 5.2
      },
      {
        "id": "x62-4",
        "name": "Parmesan",
        "amount": "15g",
        "calories": 43,
        "protein": 4,
        "carbs": 1,
        "fat": 2.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Keto Chicken Alfredo Zoodles.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "dinner",
      "keto",
      "high-protein",
      "low-calorie"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r63",
    "name": "Mediterranean Grain Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 20,
    "difficulty": "easy",
    "calories": 450,
    "protein": 18,
    "carbs": 56,
    "fat": 16,
    "fiber": 10,
    "ingredients": [
      {
        "id": "x63-1",
        "name": "Farro",
        "amount": "140g cooked",
        "calories": 189,
        "protein": 7.6,
        "carbs": 23.5,
        "fat": 6.7
      },
      {
        "id": "x63-2",
        "name": "Chickpeas",
        "amount": "100g",
        "calories": 126,
        "protein": 5,
        "carbs": 15.7,
        "fat": 4.5
      },
      {
        "id": "x63-3",
        "name": "Cucumber tomato",
        "amount": "1.5 cups",
        "calories": 90,
        "protein": 3.6,
        "carbs": 11.2,
        "fat": 3.2
      },
      {
        "id": "x63-4",
        "name": "Feta + olive oil",
        "amount": "1 serving",
        "calories": 45,
        "protein": 1.8,
        "carbs": 5.6,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Mediterranean Grain Bowl.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "mediterranean",
      "vegetarian",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r64",
    "name": "Spicy Tofu Noodle Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 15,
    "difficulty": "medium",
    "calories": 420,
    "protein": 26,
    "carbs": 48,
    "fat": 14,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x64-1",
        "name": "Tofu",
        "amount": "160g",
        "calories": 176,
        "protein": 10.9,
        "carbs": 20.2,
        "fat": 5.9
      },
      {
        "id": "x64-2",
        "name": "Rice noodles",
        "amount": "70g dry",
        "calories": 118,
        "protein": 7.3,
        "carbs": 13.4,
        "fat": 3.9
      },
      {
        "id": "x64-3",
        "name": "Chili garlic sauce",
        "amount": "1 tbsp",
        "calories": 84,
        "protein": 5.2,
        "carbs": 9.6,
        "fat": 2.8
      },
      {
        "id": "x64-4",
        "name": "Bok choy",
        "amount": "150g",
        "calories": 42,
        "protein": 2.6,
        "carbs": 4.8,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Spicy Tofu Noodle Bowl.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy",
      "gluten"
    ],
    "categories": [
      "dinner",
      "vegan",
      "vegetarian",
      "high-protein"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r65",
    "name": "Turkey Taco Salad",
    "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 15,
    "difficulty": "easy",
    "calories": 400,
    "protein": 36,
    "carbs": 22,
    "fat": 18,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x65-1",
        "name": "Ground turkey",
        "amount": "150g",
        "calories": 168,
        "protein": 15.1,
        "carbs": 9.2,
        "fat": 7.6
      },
      {
        "id": "x65-2",
        "name": "Romaine",
        "amount": "3 cups",
        "calories": 112,
        "protein": 10.1,
        "carbs": 6.2,
        "fat": 5
      },
      {
        "id": "x65-3",
        "name": "Salsa + beans",
        "amount": "1 cup",
        "calories": 80,
        "protein": 7.2,
        "carbs": 4.4,
        "fat": 3.6
      },
      {
        "id": "x65-4",
        "name": "Light cheese",
        "amount": "20g",
        "calories": 40,
        "protein": 3.6,
        "carbs": 2.2,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Turkey Taco Salad.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "lunch",
      "high-protein",
      "low-calorie"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r66",
    "name": "Baked Chicken Thighs + Potatoes",
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc7f3d?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 40,
    "difficulty": "easy",
    "calories": 550,
    "protein": 40,
    "carbs": 42,
    "fat": 22,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x66-1",
        "name": "Chicken thighs skinless",
        "amount": "180g",
        "calories": 231,
        "protein": 16.8,
        "carbs": 17.6,
        "fat": 9.2
      },
      {
        "id": "x66-2",
        "name": "Baby potatoes",
        "amount": "180g",
        "calories": 154,
        "protein": 11.2,
        "carbs": 11.8,
        "fat": 6.2
      },
      {
        "id": "x66-3",
        "name": "Olive oil herbs",
        "amount": "1 tbsp",
        "calories": 110,
        "protein": 8,
        "carbs": 8.4,
        "fat": 4.4
      },
      {
        "id": "x66-4",
        "name": "Green salad",
        "amount": "1 cup",
        "calories": 55,
        "protein": 4,
        "carbs": 4.2,
        "fat": 2.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Baked Chicken Thighs + Potatoes.",
      "Cook about 40 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "dinner",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r67",
    "name": "White Fish Tacos Light",
    "imageUrl": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 12,
    "difficulty": "medium",
    "calories": 430,
    "protein": 34,
    "carbs": 40,
    "fat": 14,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x67-1",
        "name": "White fish",
        "amount": "160g",
        "calories": 181,
        "protein": 14.3,
        "carbs": 16.8,
        "fat": 5.9
      },
      {
        "id": "x67-2",
        "name": "Corn tortillas",
        "amount": "2",
        "calories": 120,
        "protein": 9.5,
        "carbs": 11.2,
        "fat": 3.9
      },
      {
        "id": "x67-3",
        "name": "Slaw",
        "amount": "1.5 cups",
        "calories": 86,
        "protein": 6.8,
        "carbs": 8,
        "fat": 2.8
      },
      {
        "id": "x67-4",
        "name": "Lime crema light",
        "amount": "2 tbsp",
        "calories": 43,
        "protein": 3.4,
        "carbs": 4,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for White Fish Tacos Light.",
      "Cook about 12 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish",
      "gluten"
    ],
    "categories": [
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r68",
    "name": "Spinach Feta Stuffed Chicken",
    "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 25,
    "difficulty": "medium",
    "calories": 410,
    "protein": 46,
    "carbs": 8,
    "fat": 20,
    "fiber": 2,
    "ingredients": [
      {
        "id": "x68-1",
        "name": "Chicken breast",
        "amount": "180g",
        "calories": 172,
        "protein": 19.3,
        "carbs": 3.4,
        "fat": 8.4
      },
      {
        "id": "x68-2",
        "name": "Spinach",
        "amount": "100g",
        "calories": 115,
        "protein": 12.9,
        "carbs": 2.2,
        "fat": 5.6
      },
      {
        "id": "x68-3",
        "name": "Feta",
        "amount": "40g",
        "calories": 82,
        "protein": 9.2,
        "carbs": 1.6,
        "fat": 4
      },
      {
        "id": "x68-4",
        "name": "Garlic",
        "amount": "2 cloves",
        "calories": 41,
        "protein": 4.6,
        "carbs": 0.8,
        "fat": 2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Spinach Feta Stuffed Chicken.",
      "Cook about 25 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "keto",
      "low-calorie"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r69",
    "name": "Overnight Protein French Toast",
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 10,
    "difficulty": "easy",
    "calories": 370,
    "protein": 30,
    "carbs": 40,
    "fat": 8,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x69-1",
        "name": "Whole grain bread",
        "amount": "2 slices",
        "calories": 155,
        "protein": 12.6,
        "carbs": 16.8,
        "fat": 3.4
      },
      {
        "id": "x69-2",
        "name": "Egg + whites",
        "amount": "2+2",
        "calories": 104,
        "protein": 8.4,
        "carbs": 11.2,
        "fat": 2.2
      },
      {
        "id": "x69-3",
        "name": "Protein powder",
        "amount": "1/2 scoop",
        "calories": 74,
        "protein": 6,
        "carbs": 8,
        "fat": 1.6
      },
      {
        "id": "x69-4",
        "name": "Berries",
        "amount": "80g",
        "calories": 37,
        "protein": 3,
        "carbs": 4,
        "fat": 0.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Overnight Protein French Toast.",
      "Cook about 10 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "gluten",
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r70",
    "name": "Berry Protein Smoothie Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 8,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 350,
    "protein": 30,
    "carbs": 42,
    "fat": 8,
    "fiber": 7,
    "ingredients": [
      {
        "id": "x70-1",
        "name": "Frozen berries",
        "amount": "150g",
        "calories": 147,
        "protein": 12.6,
        "carbs": 17.6,
        "fat": 3.4
      },
      {
        "id": "x70-2",
        "name": "Protein powder",
        "amount": "1 scoop",
        "calories": 98,
        "protein": 8.4,
        "carbs": 11.8,
        "fat": 2.2
      },
      {
        "id": "x70-3",
        "name": "Greek yogurt",
        "amount": "80g",
        "calories": 70,
        "protein": 6,
        "carbs": 8.4,
        "fat": 1.6
      },
      {
        "id": "x70-4",
        "name": "Granola",
        "amount": "15g",
        "calories": 35,
        "protein": 3,
        "carbs": 4.2,
        "fat": 0.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Berry Protein Smoothie Bowl.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "quick",
      "post-workout"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r71",
    "name": "Kimchi Fried Rice + Egg",
    "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 12,
    "difficulty": "easy",
    "calories": 480,
    "protein": 22,
    "carbs": 58,
    "fat": 16,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x71-1",
        "name": "Cooked rice",
        "amount": "200g",
        "calories": 202,
        "protein": 9.2,
        "carbs": 24.4,
        "fat": 6.7
      },
      {
        "id": "x71-2",
        "name": "Kimchi",
        "amount": "100g",
        "calories": 134,
        "protein": 6.2,
        "carbs": 16.2,
        "fat": 4.5
      },
      {
        "id": "x71-3",
        "name": "Egg",
        "amount": "1",
        "calories": 96,
        "protein": 4.4,
        "carbs": 11.6,
        "fat": 3.2
      },
      {
        "id": "x71-4",
        "name": "Sesame oil",
        "amount": "1 tsp",
        "calories": 48,
        "protein": 2.2,
        "carbs": 5.8,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Kimchi Fried Rice + Egg.",
      "Cook about 12 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "soy"
    ],
    "categories": [
      "lunch",
      "quick"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r72",
    "name": "Caprese Chicken Cap",
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 20,
    "difficulty": "easy",
    "calories": 390,
    "protein": 42,
    "carbs": 10,
    "fat": 18,
    "fiber": 2,
    "ingredients": [
      {
        "id": "x72-1",
        "name": "Chicken breast",
        "amount": "170g",
        "calories": 164,
        "protein": 17.6,
        "carbs": 4.2,
        "fat": 7.6
      },
      {
        "id": "x72-2",
        "name": "Tomato",
        "amount": "1",
        "calories": 109,
        "protein": 11.8,
        "carbs": 2.8,
        "fat": 5
      },
      {
        "id": "x72-3",
        "name": "Mozzarella light",
        "amount": "40g",
        "calories": 78,
        "protein": 8.4,
        "carbs": 2,
        "fat": 3.6
      },
      {
        "id": "x72-4",
        "name": "Balsamic",
        "amount": "1 tsp",
        "calories": 39,
        "protein": 4.2,
        "carbs": 1,
        "fat": 1.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Caprese Chicken Cap.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "mediterranean",
      "low-calorie"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r73",
    "name": "Sweet Potato Black Bean Tacos",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 20,
    "difficulty": "easy",
    "calories": 440,
    "protein": 16,
    "carbs": 64,
    "fat": 12,
    "fiber": 14,
    "ingredients": [
      {
        "id": "x73-1",
        "name": "Sweet potato",
        "amount": "200g",
        "calories": 185,
        "protein": 6.7,
        "carbs": 26.9,
        "fat": 5
      },
      {
        "id": "x73-2",
        "name": "Black beans",
        "amount": "120g",
        "calories": 123,
        "protein": 4.5,
        "carbs": 17.9,
        "fat": 3.4
      },
      {
        "id": "x73-3",
        "name": "Tortillas",
        "amount": "2",
        "calories": 88,
        "protein": 3.2,
        "carbs": 12.8,
        "fat": 2.4
      },
      {
        "id": "x73-4",
        "name": "Avocado",
        "amount": "40g",
        "calories": 44,
        "protein": 1.6,
        "carbs": 6.4,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Sweet Potato Black Bean Tacos.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten"
    ],
    "categories": [
      "dinner",
      "vegan",
      "vegetarian"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r74",
    "name": "Protein Waffles + Berries",
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 10,
    "difficulty": "easy",
    "calories": 360,
    "protein": 28,
    "carbs": 38,
    "fat": 10,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x74-1",
        "name": "Protein waffle mix",
        "amount": "1 serving",
        "calories": 151,
        "protein": 11.8,
        "carbs": 16,
        "fat": 4.2
      },
      {
        "id": "x74-2",
        "name": "Egg",
        "amount": "1",
        "calories": 101,
        "protein": 7.8,
        "carbs": 10.6,
        "fat": 2.8
      },
      {
        "id": "x74-3",
        "name": "Berries",
        "amount": "100g",
        "calories": 72,
        "protein": 5.6,
        "carbs": 7.6,
        "fat": 2
      },
      {
        "id": "x74-4",
        "name": "Greek yogurt",
        "amount": "40g",
        "calories": 36,
        "protein": 2.8,
        "carbs": 3.8,
        "fat": 1
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Protein Waffles + Berries.",
      "Cook about 10 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "dairy",
      "gluten"
    ],
    "categories": [
      "breakfast",
      "high-protein"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r75",
    "name": "Chicken Tortilla Soup",
    "imageUrl": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 30,
    "difficulty": "easy",
    "calories": 340,
    "protein": 32,
    "carbs": 28,
    "fat": 10,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x75-1",
        "name": "Shredded chicken",
        "amount": "140g",
        "calories": 143,
        "protein": 13.4,
        "carbs": 11.8,
        "fat": 4.2
      },
      {
        "id": "x75-2",
        "name": "Broth + tomatoes",
        "amount": "400ml",
        "calories": 95,
        "protein": 9,
        "carbs": 7.8,
        "fat": 2.8
      },
      {
        "id": "x75-3",
        "name": "Corn + beans",
        "amount": "100g",
        "calories": 68,
        "protein": 6.4,
        "carbs": 5.6,
        "fat": 2
      },
      {
        "id": "x75-4",
        "name": "Tortilla strips",
        "amount": "15g",
        "calories": 34,
        "protein": 3.2,
        "carbs": 2.8,
        "fat": 1
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chicken Tortilla Soup.",
      "Cook about 30 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "dinner",
      "high-protein",
      "meal-prep",
      "low-calorie"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r76",
    "name": "Seared Scallops + Greens",
    "imageUrl": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 8,
    "difficulty": "hard",
    "calories": 320,
    "protein": 34,
    "carbs": 10,
    "fat": 14,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x76-1",
        "name": "Scallops",
        "amount": "160g",
        "calories": 134,
        "protein": 14.3,
        "carbs": 4.2,
        "fat": 5.9
      },
      {
        "id": "x76-2",
        "name": "Mixed greens",
        "amount": "3 cups",
        "calories": 90,
        "protein": 9.5,
        "carbs": 2.8,
        "fat": 3.9
      },
      {
        "id": "x76-3",
        "name": "Olive oil",
        "amount": "1 tsp",
        "calories": 64,
        "protein": 6.8,
        "carbs": 2,
        "fat": 2.8
      },
      {
        "id": "x76-4",
        "name": "Lemon",
        "amount": "wedge",
        "calories": 32,
        "protein": 3.4,
        "carbs": 1,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Seared Scallops + Greens.",
      "Cook about 8 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "shellfish"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "low-calorie"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r77",
    "name": "Matcha Protein Latte Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 8,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 300,
    "protein": 26,
    "carbs": 34,
    "fat": 8,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x77-1",
        "name": "Matcha",
        "amount": "1 tsp",
        "calories": 126,
        "protein": 10.9,
        "carbs": 14.3,
        "fat": 3.4
      },
      {
        "id": "x77-2",
        "name": "Protein powder",
        "amount": "1 scoop",
        "calories": 84,
        "protein": 7.3,
        "carbs": 9.5,
        "fat": 2.2
      },
      {
        "id": "x77-3",
        "name": "Oat milk",
        "amount": "250ml",
        "calories": 60,
        "protein": 5.2,
        "carbs": 6.8,
        "fat": 1.6
      },
      {
        "id": "x77-4",
        "name": "Banana",
        "amount": "1/2",
        "calories": 30,
        "protein": 2.6,
        "carbs": 3.4,
        "fat": 0.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Matcha Protein Latte Bowl.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "quick"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r78",
    "name": "Harissa Chicken Couscous",
    "imageUrl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 20,
    "difficulty": "medium",
    "calories": 520,
    "protein": 40,
    "carbs": 54,
    "fat": 14,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x78-1",
        "name": "Chicken",
        "amount": "160g",
        "calories": 218,
        "protein": 16.8,
        "carbs": 22.7,
        "fat": 5.9
      },
      {
        "id": "x78-2",
        "name": "Couscous",
        "amount": "70g dry",
        "calories": 146,
        "protein": 11.2,
        "carbs": 15.1,
        "fat": 3.9
      },
      {
        "id": "x78-3",
        "name": "Harissa",
        "amount": "1 tbsp",
        "calories": 104,
        "protein": 8,
        "carbs": 10.8,
        "fat": 2.8
      },
      {
        "id": "x78-4",
        "name": "Roasted veg",
        "amount": "1.5 cups",
        "calories": 52,
        "protein": 4,
        "carbs": 5.4,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Harissa Chicken Couscous.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "mediterranean",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r79",
    "name": "Veggie Egg Muffins (6)",
    "imageUrl": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 20,
    "difficulty": "easy",
    "calories": 280,
    "protein": 26,
    "carbs": 10,
    "fat": 14,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x79-1",
        "name": "Eggs",
        "amount": "4",
        "calories": 118,
        "protein": 10.9,
        "carbs": 4.2,
        "fat": 5.9
      },
      {
        "id": "x79-2",
        "name": "Egg whites",
        "amount": "120g",
        "calories": 78,
        "protein": 7.3,
        "carbs": 2.8,
        "fat": 3.9
      },
      {
        "id": "x79-3",
        "name": "Spinach pepper",
        "amount": "2 cups",
        "calories": 56,
        "protein": 5.2,
        "carbs": 2,
        "fat": 2.8
      },
      {
        "id": "x79-4",
        "name": "Cheese light",
        "amount": "30g",
        "calories": 28,
        "protein": 2.6,
        "carbs": 1,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Veggie Egg Muffins (6).",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "meal-prep",
      "low-calorie"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r80",
    "name": "Pesto Turkey Pasta Salad",
    "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 490,
    "protein": 36,
    "carbs": 48,
    "fat": 16,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x80-1",
        "name": "Turkey",
        "amount": "140g",
        "calories": 206,
        "protein": 15.1,
        "carbs": 20.2,
        "fat": 6.7
      },
      {
        "id": "x80-2",
        "name": "Pasta",
        "amount": "70g dry",
        "calories": 137,
        "protein": 10.1,
        "carbs": 13.4,
        "fat": 4.5
      },
      {
        "id": "x80-3",
        "name": "Pesto",
        "amount": "1.5 tbsp",
        "calories": 98,
        "protein": 7.2,
        "carbs": 9.6,
        "fat": 3.2
      },
      {
        "id": "x80-4",
        "name": "Cherry tomatoes",
        "amount": "100g",
        "calories": 49,
        "protein": 3.6,
        "carbs": 4.8,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Pesto Turkey Pasta Salad.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten",
      "dairy",
      "nuts"
    ],
    "categories": [
      "lunch",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r81",
    "name": "Ginger Beef Noodle Soup",
    "imageUrl": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 25,
    "difficulty": "medium",
    "calories": 430,
    "protein": 34,
    "carbs": 42,
    "fat": 12,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x81-1",
        "name": "Lean beef",
        "amount": "140g",
        "calories": 181,
        "protein": 14.3,
        "carbs": 17.6,
        "fat": 5
      },
      {
        "id": "x81-2",
        "name": "Noodles",
        "amount": "60g dry",
        "calories": 120,
        "protein": 9.5,
        "carbs": 11.8,
        "fat": 3.4
      },
      {
        "id": "x81-3",
        "name": "Ginger broth",
        "amount": "500ml",
        "calories": 86,
        "protein": 6.8,
        "carbs": 8.4,
        "fat": 2.4
      },
      {
        "id": "x81-4",
        "name": "Greens",
        "amount": "1.5 cups",
        "calories": 43,
        "protein": 3.4,
        "carbs": 4.2,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Ginger Beef Noodle Soup.",
      "Cook about 25 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy",
      "gluten"
    ],
    "categories": [
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r82",
    "name": "Roasted Veggie Grain Prep",
    "imageUrl": "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 35,
    "difficulty": "easy",
    "calories": 400,
    "protein": 14,
    "carbs": 58,
    "fat": 12,
    "fiber": 12,
    "ingredients": [
      {
        "id": "x82-1",
        "name": "Brown rice",
        "amount": "160g cooked",
        "calories": 168,
        "protein": 5.9,
        "carbs": 24.4,
        "fat": 5
      },
      {
        "id": "x82-2",
        "name": "Roasted veg",
        "amount": "3 cups",
        "calories": 112,
        "protein": 3.9,
        "carbs": 16.2,
        "fat": 3.4
      },
      {
        "id": "x82-3",
        "name": "Chickpeas",
        "amount": "80g",
        "calories": 80,
        "protein": 2.8,
        "carbs": 11.6,
        "fat": 2.4
      },
      {
        "id": "x82-4",
        "name": "Lemon tahini",
        "amount": "1 tbsp",
        "calories": 40,
        "protein": 1.4,
        "carbs": 5.8,
        "fat": 1.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Roasted Veggie Grain Prep.",
      "Cook about 35 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "lunch",
      "vegan",
      "vegetarian",
      "meal-prep"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r83",
    "name": "Protein Cheesecake Cups",
    "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 200,
    "protein": 22,
    "carbs": 16,
    "fat": 6,
    "fiber": 1,
    "ingredients": [
      {
        "id": "x83-1",
        "name": "Cottage cheese",
        "amount": "150g",
        "calories": 84,
        "protein": 9.2,
        "carbs": 6.7,
        "fat": 2.5
      },
      {
        "id": "x83-2",
        "name": "Protein powder",
        "amount": "1/2 scoop",
        "calories": 56,
        "protein": 6.2,
        "carbs": 4.5,
        "fat": 1.7
      },
      {
        "id": "x83-3",
        "name": "Egg white",
        "amount": "1",
        "calories": 40,
        "protein": 4.4,
        "carbs": 3.2,
        "fat": 1.2
      },
      {
        "id": "x83-4",
        "name": "Vanilla",
        "amount": "1/2 tsp",
        "calories": 20,
        "protein": 2.2,
        "carbs": 1.6,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Protein Cheesecake Cups.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy",
      "eggs"
    ],
    "categories": [
      "snack",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r84",
    "name": "Sardine Toast Plate",
    "imageUrl": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 360,
    "protein": 28,
    "carbs": 28,
    "fat": 14,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x84-1",
        "name": "Sardines",
        "amount": "1 can",
        "calories": 151,
        "protein": 11.8,
        "carbs": 11.8,
        "fat": 5.9
      },
      {
        "id": "x84-2",
        "name": "Whole grain toast",
        "amount": "1",
        "calories": 101,
        "protein": 7.8,
        "carbs": 7.8,
        "fat": 3.9
      },
      {
        "id": "x84-3",
        "name": "Tomato",
        "amount": "1",
        "calories": 72,
        "protein": 5.6,
        "carbs": 5.6,
        "fat": 2.8
      },
      {
        "id": "x84-4",
        "name": "Olive oil",
        "amount": "1 tsp",
        "calories": 36,
        "protein": 2.8,
        "carbs": 2.8,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Sardine Toast Plate.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish",
      "gluten"
    ],
    "categories": [
      "lunch",
      "high-protein",
      "mediterranean",
      "quick"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r85",
    "name": "Chicken Satay + Rice",
    "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 25,
    "cookMinutes": 15,
    "difficulty": "medium",
    "calories": 500,
    "protein": 40,
    "carbs": 48,
    "fat": 14,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x85-1",
        "name": "Chicken skewers",
        "amount": "160g",
        "calories": 210,
        "protein": 16.8,
        "carbs": 20.2,
        "fat": 5.9
      },
      {
        "id": "x85-2",
        "name": "Peanut sauce light",
        "amount": "2 tbsp",
        "calories": 140,
        "protein": 11.2,
        "carbs": 13.4,
        "fat": 3.9
      },
      {
        "id": "x85-3",
        "name": "Jasmine rice",
        "amount": "150g cooked",
        "calories": 100,
        "protein": 8,
        "carbs": 9.6,
        "fat": 2.8
      },
      {
        "id": "x85-4",
        "name": "Cucumber salad",
        "amount": "1 cup",
        "calories": 50,
        "protein": 4,
        "carbs": 4.8,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chicken Satay + Rice.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "peanuts",
      "soy"
    ],
    "categories": [
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r86",
    "name": "Breakfast Burrito Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc7f3d?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 15,
    "difficulty": "easy",
    "calories": 450,
    "protein": 34,
    "carbs": 40,
    "fat": 16,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x86-1",
        "name": "Eggs",
        "amount": "2",
        "calories": 189,
        "protein": 14.3,
        "carbs": 16.8,
        "fat": 6.7
      },
      {
        "id": "x86-2",
        "name": "Turkey sausage",
        "amount": "80g",
        "calories": 126,
        "protein": 9.5,
        "carbs": 11.2,
        "fat": 4.5
      },
      {
        "id": "x86-3",
        "name": "Potatoes",
        "amount": "120g",
        "calories": 90,
        "protein": 6.8,
        "carbs": 8,
        "fat": 3.2
      },
      {
        "id": "x86-4",
        "name": "Salsa cheese",
        "amount": "1 serving",
        "calories": 45,
        "protein": 3.4,
        "carbs": 4,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Breakfast Burrito Bowl.",
      "Cook about 15 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r87",
    "name": "Lemon Garlic Chicken Orzo",
    "imageUrl": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 25,
    "difficulty": "medium",
    "calories": 510,
    "protein": 40,
    "carbs": 52,
    "fat": 14,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x87-1",
        "name": "Chicken",
        "amount": "150g",
        "calories": 214,
        "protein": 16.8,
        "carbs": 21.8,
        "fat": 5.9
      },
      {
        "id": "x87-2",
        "name": "Orzo",
        "amount": "70g dry",
        "calories": 143,
        "protein": 11.2,
        "carbs": 14.6,
        "fat": 3.9
      },
      {
        "id": "x87-3",
        "name": "Lemon garlic",
        "amount": "2 tbsp",
        "calories": 102,
        "protein": 8,
        "carbs": 10.4,
        "fat": 2.8
      },
      {
        "id": "x87-4",
        "name": "Spinach",
        "amount": "2 cups",
        "calories": 51,
        "protein": 4,
        "carbs": 5.2,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Lemon Garlic Chicken Orzo.",
      "Cook about 25 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "mediterranean"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r88",
    "name": "Tempeh Power Salad",
    "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 380,
    "protein": 28,
    "carbs": 26,
    "fat": 16,
    "fiber": 10,
    "ingredients": [
      {
        "id": "x88-1",
        "name": "Tempeh",
        "amount": "120g",
        "calories": 160,
        "protein": 11.8,
        "carbs": 10.9,
        "fat": 6.7
      },
      {
        "id": "x88-2",
        "name": "Mixed greens",
        "amount": "3 cups",
        "calories": 106,
        "protein": 7.8,
        "carbs": 7.3,
        "fat": 4.5
      },
      {
        "id": "x88-3",
        "name": "Quinoa",
        "amount": "80g",
        "calories": 76,
        "protein": 5.6,
        "carbs": 5.2,
        "fat": 3.2
      },
      {
        "id": "x88-4",
        "name": "Tahini dressing",
        "amount": "1 tbsp",
        "calories": 38,
        "protein": 2.8,
        "carbs": 2.6,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Tempeh Power Salad.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "soy"
    ],
    "categories": [
      "lunch",
      "vegan",
      "vegetarian",
      "high-protein"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r89",
    "name": "Blueberry Protein Muffins",
    "imageUrl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 18,
    "difficulty": "easy",
    "calories": 220,
    "protein": 14,
    "carbs": 26,
    "fat": 6,
    "fiber": 3,
    "ingredients": [
      {
        "id": "x89-1",
        "name": "Oat flour",
        "amount": "40g",
        "calories": 92,
        "protein": 5.9,
        "carbs": 10.9,
        "fat": 2.5
      },
      {
        "id": "x89-2",
        "name": "Protein powder",
        "amount": "20g",
        "calories": 62,
        "protein": 3.9,
        "carbs": 7.3,
        "fat": 1.7
      },
      {
        "id": "x89-3",
        "name": "Blueberries",
        "amount": "60g",
        "calories": 44,
        "protein": 2.8,
        "carbs": 5.2,
        "fat": 1.2
      },
      {
        "id": "x89-4",
        "name": "Egg",
        "amount": "1",
        "calories": 22,
        "protein": 1.4,
        "carbs": 2.6,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Blueberry Protein Muffins.",
      "Cook about 18 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "dairy",
      "gluten"
    ],
    "categories": [
      "snack",
      "breakfast",
      "high-protein",
      "meal-prep"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r90",
    "name": "Crispy Chickpea Snack Mix",
    "imageUrl": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 30,
    "difficulty": "easy",
    "calories": 170,
    "protein": 8,
    "carbs": 22,
    "fat": 6,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x90-1",
        "name": "Chickpeas",
        "amount": "120g",
        "calories": 71,
        "protein": 3.4,
        "carbs": 9.2,
        "fat": 2.5
      },
      {
        "id": "x90-2",
        "name": "Spice mix",
        "amount": "1 tsp",
        "calories": 48,
        "protein": 2.2,
        "carbs": 6.2,
        "fat": 1.7
      },
      {
        "id": "x90-3",
        "name": "Olive oil",
        "amount": "1 tsp",
        "calories": 34,
        "protein": 1.6,
        "carbs": 4.4,
        "fat": 1.2
      },
      {
        "id": "x90-4",
        "name": "Sea salt",
        "amount": "pinch",
        "calories": 17,
        "protein": 0.8,
        "carbs": 2.2,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Crispy Chickpea Snack Mix.",
      "Cook about 30 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "snack",
      "vegan",
      "vegetarian",
      "meal-prep"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r91",
    "name": "Poached Eggs + Greens",
    "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 8,
    "difficulty": "medium",
    "calories": 260,
    "protein": 20,
    "carbs": 8,
    "fat": 16,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x91-1",
        "name": "Eggs",
        "amount": "2",
        "calories": 109,
        "protein": 8.4,
        "carbs": 3.4,
        "fat": 6.7
      },
      {
        "id": "x91-2",
        "name": "Sautéed greens",
        "amount": "2 cups",
        "calories": 73,
        "protein": 5.6,
        "carbs": 2.2,
        "fat": 4.5
      },
      {
        "id": "x91-3",
        "name": "Avocado",
        "amount": "40g",
        "calories": 52,
        "protein": 4,
        "carbs": 1.6,
        "fat": 3.2
      },
      {
        "id": "x91-4",
        "name": "Chili oil",
        "amount": "1/2 tsp",
        "calories": 26,
        "protein": 2,
        "carbs": 0.8,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Poached Eggs + Greens.",
      "Cook about 8 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "low-calorie",
      "keto"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r92",
    "name": "Moroccan Chicken Tagine Light",
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 25,
    "cookMinutes": 45,
    "difficulty": "medium",
    "calories": 470,
    "protein": 42,
    "carbs": 36,
    "fat": 14,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x92-1",
        "name": "Chicken",
        "amount": "170g",
        "calories": 197,
        "protein": 17.6,
        "carbs": 15.1,
        "fat": 5.9
      },
      {
        "id": "x92-2",
        "name": "Chickpeas",
        "amount": "100g",
        "calories": 132,
        "protein": 11.8,
        "carbs": 10.1,
        "fat": 3.9
      },
      {
        "id": "x92-3",
        "name": "Tomato spice base",
        "amount": "1.5 cups",
        "calories": 94,
        "protein": 8.4,
        "carbs": 7.2,
        "fat": 2.8
      },
      {
        "id": "x92-4",
        "name": "Couscous",
        "amount": "60g dry",
        "calories": 47,
        "protein": 4.2,
        "carbs": 3.6,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Moroccan Chicken Tagine Light.",
      "Cook about 45 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "dinner",
      "high-protein",
      "mediterranean",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r93",
    "name": "Turkey Bolognese Zucchini",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 30,
    "difficulty": "medium",
    "calories": 380,
    "protein": 38,
    "carbs": 18,
    "fat": 14,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x93-1",
        "name": "Ground turkey",
        "amount": "160g",
        "calories": 160,
        "protein": 16,
        "carbs": 7.6,
        "fat": 5.9
      },
      {
        "id": "x93-2",
        "name": "Zucchini noodles",
        "amount": "300g",
        "calories": 106,
        "protein": 10.6,
        "carbs": 5,
        "fat": 3.9
      },
      {
        "id": "x93-3",
        "name": "Tomato sauce",
        "amount": "150g",
        "calories": 76,
        "protein": 7.6,
        "carbs": 3.6,
        "fat": 2.8
      },
      {
        "id": "x93-4",
        "name": "Italian herbs",
        "amount": "1 tsp",
        "calories": 38,
        "protein": 3.8,
        "carbs": 1.8,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Turkey Bolognese Zucchini.",
      "Cook about 30 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [],
    "categories": [
      "dinner",
      "high-protein",
      "low-calorie"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r94",
    "name": "Acai Protein Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 340,
    "protein": 24,
    "carbs": 46,
    "fat": 8,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x94-1",
        "name": "Acai pack",
        "amount": "100g",
        "calories": 143,
        "protein": 10.1,
        "carbs": 19.3,
        "fat": 3.4
      },
      {
        "id": "x94-2",
        "name": "Protein powder",
        "amount": "1 scoop",
        "calories": 95,
        "protein": 6.7,
        "carbs": 12.9,
        "fat": 2.2
      },
      {
        "id": "x94-3",
        "name": "Banana",
        "amount": "1/2",
        "calories": 68,
        "protein": 4.8,
        "carbs": 9.2,
        "fat": 1.6
      },
      {
        "id": "x94-4",
        "name": "Granola berries",
        "amount": "1 serving",
        "calories": 34,
        "protein": 2.4,
        "carbs": 4.6,
        "fat": 0.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Acai Protein Bowl.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "post-workout"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r95",
    "name": "Grilled Halloumi Salad",
    "imageUrl": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 430,
    "protein": 26,
    "carbs": 18,
    "fat": 28,
    "fiber": 5,
    "ingredients": [
      {
        "id": "x95-1",
        "name": "Halloumi",
        "amount": "80g",
        "calories": 181,
        "protein": 10.9,
        "carbs": 7.6,
        "fat": 11.8
      },
      {
        "id": "x95-2",
        "name": "Mixed salad",
        "amount": "3 cups",
        "calories": 120,
        "protein": 7.3,
        "carbs": 5,
        "fat": 7.8
      },
      {
        "id": "x95-3",
        "name": "Olive oil lemon",
        "amount": "1 tbsp",
        "calories": 86,
        "protein": 5.2,
        "carbs": 3.6,
        "fat": 5.6
      },
      {
        "id": "x95-4",
        "name": "Olives",
        "amount": "30g",
        "calories": 43,
        "protein": 2.6,
        "carbs": 1.8,
        "fat": 2.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Grilled Halloumi Salad.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "lunch",
      "vegetarian",
      "mediterranean",
      "high-protein"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r96",
    "name": "Sheet-Pan Salmon Dinner",
    "imageUrl": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 25,
    "difficulty": "easy",
    "calories": 480,
    "protein": 40,
    "carbs": 28,
    "fat": 22,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x96-1",
        "name": "Salmon",
        "amount": "160g",
        "calories": 202,
        "protein": 16.8,
        "carbs": 11.8,
        "fat": 9.2
      },
      {
        "id": "x96-2",
        "name": "Baby potatoes",
        "amount": "150g",
        "calories": 134,
        "protein": 11.2,
        "carbs": 7.8,
        "fat": 6.2
      },
      {
        "id": "x96-3",
        "name": "Broccoli",
        "amount": "200g",
        "calories": 96,
        "protein": 8,
        "carbs": 5.6,
        "fat": 4.4
      },
      {
        "id": "x96-4",
        "name": "Olive oil",
        "amount": "1 tbsp",
        "calories": 48,
        "protein": 4,
        "carbs": 2.8,
        "fat": 2.2
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Sheet-Pan Salmon Dinner.",
      "Cook about 25 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "meal-prep",
      "mediterranean"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r97",
    "name": "Chicken Caesar Wrap",
    "imageUrl": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 440,
    "protein": 38,
    "carbs": 36,
    "fat": 14,
    "fiber": 4,
    "ingredients": [
      {
        "id": "x97-1",
        "name": "Wrap",
        "amount": "1",
        "calories": 185,
        "protein": 16,
        "carbs": 15.1,
        "fat": 5.9
      },
      {
        "id": "x97-2",
        "name": "Chicken",
        "amount": "140g",
        "calories": 123,
        "protein": 10.6,
        "carbs": 10.1,
        "fat": 3.9
      },
      {
        "id": "x97-3",
        "name": "Romaine",
        "amount": "2 cups",
        "calories": 88,
        "protein": 7.6,
        "carbs": 7.2,
        "fat": 2.8
      },
      {
        "id": "x97-4",
        "name": "Light Caesar",
        "amount": "1.5 tbsp",
        "calories": 44,
        "protein": 3.8,
        "carbs": 3.6,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Chicken Caesar Wrap.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten",
      "dairy",
      "eggs"
    ],
    "categories": [
      "lunch",
      "quick",
      "high-protein"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r98",
    "name": "Protein Banana Bread Slice",
    "imageUrl": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 50,
    "difficulty": "medium",
    "calories": 210,
    "protein": 12,
    "carbs": 28,
    "fat": 6,
    "fiber": 2,
    "ingredients": [
      {
        "id": "x98-1",
        "name": "Oat flour",
        "amount": "35g",
        "calories": 88,
        "protein": 5,
        "carbs": 11.8,
        "fat": 2.5
      },
      {
        "id": "x98-2",
        "name": "Banana",
        "amount": "1/2",
        "calories": 59,
        "protein": 3.4,
        "carbs": 7.8,
        "fat": 1.7
      },
      {
        "id": "x98-3",
        "name": "Protein powder",
        "amount": "15g",
        "calories": 42,
        "protein": 2.4,
        "carbs": 5.6,
        "fat": 1.2
      },
      {
        "id": "x98-4",
        "name": "Egg",
        "amount": "1/2",
        "calories": 21,
        "protein": 1.2,
        "carbs": 2.8,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Protein Banana Bread Slice.",
      "Cook about 50 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "dairy",
      "gluten"
    ],
    "categories": [
      "snack",
      "meal-prep"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r99",
    "name": "Spicy Turkey Sloppy Joes",
    "imageUrl": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 20,
    "difficulty": "easy",
    "calories": 460,
    "protein": 36,
    "carbs": 42,
    "fat": 14,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x99-1",
        "name": "Ground turkey",
        "amount": "160g",
        "calories": 193,
        "protein": 15.1,
        "carbs": 17.6,
        "fat": 5.9
      },
      {
        "id": "x99-2",
        "name": "Tomato spice mix",
        "amount": "1 cup",
        "calories": 129,
        "protein": 10.1,
        "carbs": 11.8,
        "fat": 3.9
      },
      {
        "id": "x99-3",
        "name": "Whole wheat bun",
        "amount": "1",
        "calories": 92,
        "protein": 7.2,
        "carbs": 8.4,
        "fat": 2.8
      },
      {
        "id": "x99-4",
        "name": "Slaw",
        "amount": "1 cup",
        "calories": 46,
        "protein": 3.6,
        "carbs": 4.2,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Spicy Turkey Sloppy Joes.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten"
    ],
    "categories": [
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": false,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r100",
    "name": "Cucumber Tuna Boats",
    "imageUrl": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 180,
    "protein": 26,
    "carbs": 6,
    "fat": 6,
    "fiber": 2,
    "ingredients": [
      {
        "id": "x100-1",
        "name": "Cucumber",
        "amount": "1 large",
        "calories": 76,
        "protein": 10.9,
        "carbs": 2.5,
        "fat": 2.5
      },
      {
        "id": "x100-2",
        "name": "Tuna",
        "amount": "1 can",
        "calories": 50,
        "protein": 7.3,
        "carbs": 1.7,
        "fat": 1.7
      },
      {
        "id": "x100-3",
        "name": "Light mayo",
        "amount": "1 tbsp",
        "calories": 36,
        "protein": 5.2,
        "carbs": 1.2,
        "fat": 1.2
      },
      {
        "id": "x100-4",
        "name": "Everything bagel seasoning",
        "amount": "pinch",
        "calories": 18,
        "protein": 2.6,
        "carbs": 0.6,
        "fat": 0.6
      }
    ],
    "portionSize": "1 serving",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Cucumber Tuna Boats.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish",
      "eggs"
    ],
    "categories": [
      "snack",
      "high-protein",
      "low-calorie",
      "keto",
      "quick"
    ],
    "mealTypes": [
      "snack"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r101",
    "name": "Roasted Chicken + Farro",
    "imageUrl": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 15,
    "cookMinutes": 40,
    "difficulty": "medium",
    "calories": 530,
    "protein": 42,
    "carbs": 50,
    "fat": 14,
    "fiber": 7,
    "ingredients": [
      {
        "id": "x101-1",
        "name": "Roasted chicken",
        "amount": "170g",
        "calories": 223,
        "protein": 17.6,
        "carbs": 21,
        "fat": 5.9
      },
      {
        "id": "x101-2",
        "name": "Farro",
        "amount": "140g cooked",
        "calories": 148,
        "protein": 11.8,
        "carbs": 14,
        "fat": 3.9
      },
      {
        "id": "x101-3",
        "name": "Roasted veg",
        "amount": "2 cups",
        "calories": 106,
        "protein": 8.4,
        "carbs": 10,
        "fat": 2.8
      },
      {
        "id": "x101-4",
        "name": "Herb oil",
        "amount": "1 tsp",
        "calories": 53,
        "protein": 4.2,
        "carbs": 5,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Roasted Chicken + Farro.",
      "Cook about 40 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "gluten"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "mediterranean",
      "meal-prep"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "meal-prep"
    ]
  },
  {
    "id": "r102",
    "name": "Green Goddess Smoothie",
    "imageUrl": "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 5,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 290,
    "protein": 22,
    "carbs": 34,
    "fat": 8,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x102-1",
        "name": "Spinach",
        "amount": "2 cups",
        "calories": 122,
        "protein": 9.2,
        "carbs": 14.3,
        "fat": 3.4
      },
      {
        "id": "x102-2",
        "name": "Protein powder",
        "amount": "1 scoop",
        "calories": 81,
        "protein": 6.2,
        "carbs": 9.5,
        "fat": 2.2
      },
      {
        "id": "x102-3",
        "name": "Pineapple banana",
        "amount": "1 cup",
        "calories": 58,
        "protein": 4.4,
        "carbs": 6.8,
        "fat": 1.6
      },
      {
        "id": "x102-4",
        "name": "Greek yogurt",
        "amount": "60g",
        "calories": 29,
        "protein": 2.2,
        "carbs": 3.4,
        "fat": 0.8
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Green Goddess Smoothie.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "breakfast",
      "high-protein",
      "quick",
      "vegetarian"
    ],
    "mealTypes": [
      "breakfast"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r103",
    "name": "Bibimbap Chicken Bowl",
    "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 25,
    "cookMinutes": 20,
    "difficulty": "medium",
    "calories": 540,
    "protein": 40,
    "carbs": 58,
    "fat": 14,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x103-1",
        "name": "Chicken",
        "amount": "150g",
        "calories": 227,
        "protein": 16.8,
        "carbs": 24.4,
        "fat": 5.9
      },
      {
        "id": "x103-2",
        "name": "Rice",
        "amount": "180g cooked",
        "calories": 151,
        "protein": 11.2,
        "carbs": 16.2,
        "fat": 3.9
      },
      {
        "id": "x103-3",
        "name": "Assorted banchan veg",
        "amount": "2 cups",
        "calories": 108,
        "protein": 8,
        "carbs": 11.6,
        "fat": 2.8
      },
      {
        "id": "x103-4",
        "name": "Gochujang + egg",
        "amount": "1 serving",
        "calories": 54,
        "protein": 4,
        "carbs": 5.8,
        "fat": 1.4
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Bibimbap Chicken Bowl.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "eggs",
      "soy",
      "sesame"
    ],
    "categories": [
      "dinner",
      "high-protein"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  },
  {
    "id": "r104",
    "name": "White Bean Tuna Salad",
    "imageUrl": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 10,
    "cookMinutes": 0,
    "difficulty": "easy",
    "calories": 360,
    "protein": 34,
    "carbs": 28,
    "fat": 10,
    "fiber": 8,
    "ingredients": [
      {
        "id": "x104-1",
        "name": "Tuna",
        "amount": "1 can",
        "calories": 151,
        "protein": 14.3,
        "carbs": 11.8,
        "fat": 4.2
      },
      {
        "id": "x104-2",
        "name": "White beans",
        "amount": "120g",
        "calories": 101,
        "protein": 9.5,
        "carbs": 7.8,
        "fat": 2.8
      },
      {
        "id": "x104-3",
        "name": "Olive oil lemon",
        "amount": "1 tbsp",
        "calories": 72,
        "protein": 6.8,
        "carbs": 5.6,
        "fat": 2
      },
      {
        "id": "x104-4",
        "name": "Red onion herbs",
        "amount": "1/2 cup",
        "calories": 36,
        "protein": 3.4,
        "carbs": 2.8,
        "fat": 1
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for White Bean Tuna Salad.",
      "Assemble cold — no cooking needed.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "fish"
    ],
    "categories": [
      "lunch",
      "high-protein",
      "mediterranean",
      "quick"
    ],
    "mealTypes": [
      "lunch"
    ],
    "equipment": [
      "bowl"
    ],
    "isPro": false,
    "tags": [
      "quick"
    ]
  },
  {
    "id": "r105",
    "name": "Cauliflower Pizza Protein",
    "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    "prepMinutes": 20,
    "cookMinutes": 20,
    "difficulty": "medium",
    "calories": 420,
    "protein": 36,
    "carbs": 28,
    "fat": 16,
    "fiber": 6,
    "ingredients": [
      {
        "id": "x105-1",
        "name": "Cauli crust",
        "amount": "1",
        "calories": 176,
        "protein": 15.1,
        "carbs": 11.8,
        "fat": 6.7
      },
      {
        "id": "x105-2",
        "name": "Chicken",
        "amount": "120g",
        "calories": 118,
        "protein": 10.1,
        "carbs": 7.8,
        "fat": 4.5
      },
      {
        "id": "x105-3",
        "name": "Tomato sauce",
        "amount": "80g",
        "calories": 84,
        "protein": 7.2,
        "carbs": 5.6,
        "fat": 3.2
      },
      {
        "id": "x105-4",
        "name": "Mozzarella light",
        "amount": "50g",
        "calories": 42,
        "protein": 3.6,
        "carbs": 2.8,
        "fat": 1.6
      }
    ],
    "portionSize": "1 plate",
    "servings": 1,
    "steps": [
      "Gather and prep ingredients for Cauliflower Pizza Protein.",
      "Cook about 20 minutes until finished.",
      "Season, plate, and serve."
    ],
    "allergens": [
      "dairy"
    ],
    "categories": [
      "dinner",
      "high-protein",
      "low-calorie"
    ],
    "mealTypes": [
      "dinner"
    ],
    "equipment": [
      "skillet or oven",
      "knife"
    ],
    "isPro": true,
    "tags": [
      "evolve"
    ]
  }
];
