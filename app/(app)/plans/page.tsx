"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, Utensils, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useTraining } from "@/components/training/TrainingProvider";
import {
  FOODS,
  MEAL_SUGGESTIONS,
  WEEKLY_MEAL_PLAN,
  getSuggestionById,
} from "@/lib/mock/data";
import { ProGate } from "@/components/pro/ProGate";

const VIBES = [
  { id: "all", label: "All" },
  { id: "flexible", label: "Flexible" },
  { id: "high-protein", label: "High protein" },
  { id: "craving", label: "Cravings" },
  { id: "lighter", label: "Lighter" },
] as const;

export default function PlansPage() {
  const { nutritionPlan, user, onboarding } = useAuth();
  const { assignedPlan } = useTraining();
  const { toast } = useToast();
  const [vibe, setVibe] = useState<(typeof VIBES)[number]["id"]>("all");
  const [dayIndex, setDayIndex] = useState(0);

  const filteredSuggestions = useMemo(() => {
    if (vibe === "all") return MEAL_SUGGESTIONS;
    return MEAL_SUGGESTIONS.filter((s) => s.vibe === vibe);
  }, [vibe]);

  const dayPlan = WEEKLY_MEAL_PLAN[dayIndex];

  return (
    <ProGate feature="Meal & training plans">
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Plans
          </h1>
          <p className="mt-1 text-sm text-muted">
            Real-world meals — Chipotle, burgers, pizza, coffee runs — built around
            your calorie targets.
          </p>
        </div>
        <div className="flex gap-2">
          {user?.plan === "pro" ? (
            <Badge variant="accent">Pro</Badge>
          ) : (
            <Badge>Free</Badge>
          )}
          <Button
            variant="outline"
            onClick={() =>
              toast(
                user?.plan === "pro"
                  ? "Weekly meal swaps refreshed with new restaurant options."
                  : "Weekly adjustments are a Pro feature.",
                user?.plan === "pro" ? "success" : "info",
              )
            }
          >
            <RefreshCw size={16} />
            Adjust week
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card elevated>
          <div className="flex items-center gap-2">
            <Utensils size={18} className="text-accent-dim dark:text-accent" />
            <h2 className="font-display text-lg font-semibold">Nutrition plan</h2>
          </div>
          {nutritionPlan ? (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-muted-bg p-4">
                  <p className="text-xs text-muted">Daily calories</p>
                  <p className="font-display text-2xl font-bold">
                    {nutritionPlan.dailyCalorieTarget}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted-bg p-4">
                  <p className="text-xs text-muted">Strategy</p>
                  <p className="font-display text-lg font-semibold capitalize">
                    {nutritionPlan.adjustmentType}
                  </p>
                </div>
              </div>
              <ProgressBar
                label={`Protein ${nutritionPlan.proteinGrams}g`}
                value={nutritionPlan.proteinGrams}
                max={nutritionPlan.proteinGrams}
                color="protein"
              />
              <ProgressBar
                label={`Carbs ${nutritionPlan.carbsGrams}g`}
                value={nutritionPlan.carbsGrams}
                max={nutritionPlan.carbsGrams}
                color="carbs"
              />
              <ProgressBar
                label={`Fat ${nutritionPlan.fatGrams}g`}
                value={nutritionPlan.fatGrams}
                max={nutritionPlan.fatGrams}
                color="fat"
              />
              <p className="text-sm leading-relaxed text-muted">
                {nutritionPlan.strategySummary} Fit fast food in by skipping fries,
                half rice at Chipotle, or pizza + salad instead of a whole pie.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Complete onboarding to generate your nutrition plan.
            </p>
          )}
        </Card>

        <Card elevated>
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-accent-dim dark:text-accent" />
            <h2 className="font-display text-lg font-semibold">Workout program</h2>
          </div>
          <div className="mt-5">
            <p className="font-medium">
              {assignedPlan?.name || "Personalized training plan"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {assignedPlan?.daysPerWeek ?? nutritionPlan?.workoutsPerWeek ?? 4}{" "}
              sessions / week · {onboarding.experienceLevel || "intermediate"} level ·{" "}
              {onboarding.hasGymAccess ? "gym access" : "home-friendly"}
            </p>
            <ul className="mt-4 space-y-2">
              {(assignedPlan?.days || []).slice(0, 4).map((day) => (
                <li
                  key={day.id}
                  className="flex justify-between rounded-xl bg-muted-bg px-3 py-2 text-sm"
                >
                  <span>{day.name}</span>
                  <span className="text-muted">{day.estimatedMinutes} min</span>
                </li>
              ))}
            </ul>
            <Link href="/workouts">
              <Button className="mt-4" fullWidth variant="secondary">
                Open training plan
              </Button>
            </Link>
            <Link href="/recipes">
              <Button className="mt-2" fullWidth variant="outline">
                Recipe library
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="mt-6" elevated>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">
              This week&apos;s meal plan
            </h2>
            <p className="mt-1 text-sm text-muted">
              Mix of grocery staples and restaurants you&apos;d actually go to.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WEEKLY_MEAL_PLAN.map((d, i) => (
              <button
                key={d.day}
                type="button"
                onClick={() => setDayIndex(i)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  dayIndex === i
                    ? "bg-accent text-accent-fg"
                    : "bg-muted-bg text-muted hover:text-foreground"
                }`}
              >
                {d.day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {dayPlan.meals.map((slot) => {
            const suggestion = getSuggestionById(slot.suggestionId);
            if (!suggestion) return null;
            return (
              <div
                key={`${dayPlan.day}-${slot.slot}`}
                className="rounded-2xl border border-border bg-muted-bg/40 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge>{slot.slot}</Badge>
                  {suggestion.brand && (
                    <span className="text-xs text-muted">{suggestion.brand}</span>
                  )}
                </div>
                <p className="mt-2 font-medium">{suggestion.name}</p>
                <p className="mt-1 text-xs text-muted">{suggestion.macros}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {suggestion.why}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() =>
                    toast(`Added ${suggestion.name} to ${slot.slot} (demo).`, "success")
                  }
                >
                  Log this meal
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent-dim dark:text-accent" />
            <h2 className="font-display text-lg font-semibold">
              Meal ideas for remaining macros
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VIBES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVibe(v.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  vibe === v.id
                    ? "bg-accent text-accent-fg"
                    : "bg-muted-bg text-muted"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSuggestions.map((s) => (
            <div
              key={s.id}
              className="flex flex-col rounded-2xl border border-border bg-muted-bg/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{s.meal}</Badge>
                <Badge variant="accent" className="capitalize">
                  {s.vibe.replace("-", " ")}
                </Badge>
              </div>
              <p className="mt-3 font-medium">{s.name}</p>
              {s.brand && (
                <p className="mt-0.5 text-xs font-medium text-accent-dim dark:text-accent">
                  {s.brand}
                </p>
              )}
              <p className="mt-1 text-xs text-muted">{s.macros}</p>
              <p className="mt-3 flex-1 text-xs leading-relaxed text-muted">
                {s.why}
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-4"
                onClick={() =>
                  toast(`Added suggestion: ${s.name} (demo).`, "success")
                }
              >
                Add to plan
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">Popular places in your food log</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Chipotle",
              "McDonald's",
              "Chick-fil-A",
              "Domino's",
              "Taco Bell",
              "Starbucks",
              "Subway",
              "Wendy's",
              "In-N-Out",
              "Panda Express",
            ].map((place) => (
              <span
                key={place}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted"
              >
                {place} · {FOODS.filter((f) => f.brand === place).length} items
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
    </ProGate>
  );
}
