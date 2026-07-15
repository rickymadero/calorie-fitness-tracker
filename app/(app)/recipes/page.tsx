"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import {
  RECIPES,
  SAMPLE_WEEKLY_MEAL_PLAN,
  getRecipeById,
  recommendRecipes,
} from "@/lib/mock/recipes";
import { useTraining } from "@/components/training/TrainingProvider";
import { ProGate } from "@/components/pro/ProGate";

export default function RecipesPage() {
  const { user, onboarding, nutritionPlan } = useAuth();
  const { sessions } = useTraining();
  const router = useRouter();
  const isPro = user?.plan === "pro";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

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
        r.tags.some((t) => t.includes(q));
      return catOk && qOk;
    });
  }, [query, category, isPro]);

  return (
    <ProGate feature="Smart recipes & meal plans">
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        Recipes
      </h1>
      <p className="mt-1 text-sm text-muted">
        Meal ideas connected to your macros. Pro unlocks personalized weekly plans
        and macro-based recommendations.
      </p>

      <Card className="mt-6" elevated>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold">Recommended for you now</h2>
            <p className="text-xs text-muted">
              ~{remainingCalories} kcal and {remainingProtein}g protein remaining
              {trainedToday ? " · post-workout focus" : ""}
            </p>
          </div>
          {!isPro && (
            <Button size="sm" onClick={() => router.push("/pricing")}>
              <Crown size={14} />
              Unlock Pro meals
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
                {r.calories} kcal · {r.protein}P · {r.carbs}C · {r.fat}F
              </p>
            </Link>
          ))}
        </div>
      </Card>

      {isPro && (
        <Card className="mt-6">
          <h2 className="font-display font-semibold">
            {SAMPLE_WEEKLY_MEAL_PLAN.name}
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {SAMPLE_WEEKLY_MEAL_PLAN.days.map((d) => (
              <div key={d.day} className="rounded-xl bg-muted-bg p-3">
                <p className="text-xs font-semibold">{d.day}</p>
                <ul className="mt-2 space-y-1 text-[11px] text-muted">
                  {d.recipeIds.map((id) => (
                    <li key={id}>{getRecipeById(id)?.name}</li>
                  ))}
                </ul>
              </div>
            ))}
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
            placeholder="Search recipes..."
            className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 outline-none focus:border-accent"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            "all",
            "breakfast",
            "lunch",
            "dinner",
            "snack",
            "high-protein",
            "quick",
            "vegetarian",
            "keto",
          ].map((c) => (
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
              {c}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.imageUrl}
              alt=""
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-4">
              <div className="flex gap-2">
                <Badge>{r.mealTypes[0]}</Badge>
                {r.isPro && <Badge variant="accent">Pro</Badge>}
              </div>
              <h3 className="mt-2 font-display font-semibold">{r.name}</h3>
              <p className="mt-1 text-xs text-muted">
                {r.calories} kcal · {r.protein}g protein · {r.prepMinutes + r.cookMinutes}{" "}
                min
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </ProGate>
  );
}
