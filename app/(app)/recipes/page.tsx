"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import {
  RECIPES,
  recommendRecipes,
} from "@/lib/mock/recipes";
import { useTraining } from "@/components/training/TrainingProvider";
import { ProGate } from "@/components/pro/ProGate";
import { ExploreBackHeader } from "@/components/layout/ExploreBackHeader";
import { RecipeImage } from "@/components/recipes/RecipeImage";

const FILTER_IDS = [
  "all",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "high-protein",
  "quick",
  "vegetarian",
  "keto",
] as const;

const FILTER_KEY: Record<(typeof FILTER_IDS)[number], string> = {
  all: "filter.all",
  breakfast: "filter.breakfast",
  lunch: "filter.lunch",
  dinner: "filter.dinner",
  snack: "filter.snack",
  "high-protein": "filter.highProtein",
  quick: "filter.quick",
  vegetarian: "filter.vegetarian",
  keto: "filter.keto",
};

export default function RecipesPage() {
  const { user, onboarding, nutritionPlan } = useAuth();
  const { sessions } = useTraining();
  const router = useRouter();
  const { t } = useAppTranslation(["recipes", "common", "plans"]);
  const isPro = user?.plan === "pro";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof FILTER_IDS)[number]>("all");

  const remainingCalories = Math.max(
    0,
    (nutritionPlan?.dailyCalorieTarget || 2200) - 1420,
  );
  const remainingProtein = Math.max(
    0,
    (nutritionPlan?.proteinGrams || 160) - 98,
  );

  const trainedToday = sessions.some((s) => {
    const d = new Date(s.startedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const recommendations = recommendRecipes({
    remainingCalories,
    remainingProtein,
    isPro: Boolean(isPro),
    allergies: onboarding.foodAllergies,
    postWorkout: trainedToday,
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return RECIPES.filter((r) => {
      if (!isPro && r.isPro) return true; // show but lock
      const catOk =
        category === "all" ||
        r.categories.includes(category as never) ||
        r.mealTypes.includes(category as never);
      const qOk =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.tags.some((tag) => tag.includes(q));
      return catOk && qOk;
    });
  }, [query, category, isPro]);

  return (
    <ProGate feature={t("features.smartRecipes", { ns: "common" })}>
    <div>
      <ExploreBackHeader title={t("title")} />
      <p className="text-sm text-muted">
        {t("subtitle")}
      </p>

      <Card className="mt-6" elevated>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold">{t("recommendedNow")}</h2>
            <p className="text-xs text-muted">
              {t("remainingMacros", {
                kcal: remainingCalories,
                protein: remainingProtein,
              })}
              {trainedToday ? t("postWorkoutFocus") : ""}
            </p>
          </div>
          {!isPro && (
            <Button size="sm" onClick={() => router.push("/pricing")}>
              <Crown size={14} />
              {t("unlockProMeals")}
            </Button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((r) => (
            <Link
              key={r.id}
              href={`/recipes/${r.id}`}
              className="rounded-2xl border border-border bg-muted-bg/50 p-3 hover:border-accent/40"
            >
              <p className="text-sm font-medium">{r.name}</p>
              <p className="mt-1 text-xs text-muted">
                {t("recipeCardMeta", {
                  calories: r.calories,
                  protein: r.protein,
                  carbs: r.carbs,
                  fat: r.fat,
                })}
              </p>
            </Link>
          ))}
        </div>
      </Card>

      {isPro && (
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold">{t("openMealPlan")}</h2>
              <p className="mt-1 text-xs text-muted">
                {t("subtitle", { ns: "plans" })}
              </p>
            </div>
            <Link href="/plans">
              <Button size="sm" variant="secondary">
                {t("openMealPlan")}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 outline-none focus:border-accent"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {FILTER_IDS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm capitalize ${
                category === c
                  ? "bg-accent text-accent-fg"
                  : "bg-muted-bg text-muted"
              }`}
            >
              {t(FILTER_KEY[c])}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <Link
            key={r.id}
            href={`/recipes/${r.id}`}
            className="overflow-hidden rounded-apex-lg border border-border bg-card shadow-apex"
          >
            <RecipeImage
              src={r.imageUrl}
              alt={r.name}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-4">
              <div className="flex gap-2">
                <Badge>{r.mealTypes[0]}</Badge>
                {r.isPro && (
                  <Badge variant="accent">{t("labels.pro", { ns: "common" })}</Badge>
                )}
              </div>
              <h3 className="mt-2 font-display font-semibold">{r.name}</h3>
              <p className="mt-1 text-xs text-muted">
                {t("cardMeta", {
                  calories: r.calories,
                  protein: r.protein,
                  minutes: r.prepMinutes + r.cookMinutes,
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </ProGate>
  );
}
