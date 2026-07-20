"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles, Utensils } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import {
  FOODS,
  MEAL_SUGGESTIONS,
  WEEKLY_MEAL_PLAN,
  getSuggestionById,
} from "@/lib/mock/data";
import { ProGate } from "@/components/pro/ProGate";
import { ExploreBackHeader } from "@/components/layout/ExploreBackHeader";

const VIBE_IDS = [
  "all",
  "flexible",
  "high-protein",
  "craving",
  "lighter",
] as const;

const VIBE_KEY: Record<(typeof VIBE_IDS)[number], string> = {
  all: "vibe.all",
  flexible: "vibe.flexible",
  "high-protein": "vibe.highProtein",
  craving: "vibe.craving",
  lighter: "vibe.lighter",
};

const POPULAR_PLACES = [
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
];

export default function PlansPage() {
  const { nutritionPlan, user } = useAuth();
  const { toast } = useToast();
  const { t } = useAppTranslation(["plans", "common"]);
  const [vibe, setVibe] = useState<(typeof VIBE_IDS)[number]>("all");
  const [dayIndex, setDayIndex] = useState(0);

  const filteredSuggestions = useMemo(() => {
    if (vibe === "all") return MEAL_SUGGESTIONS;
    return MEAL_SUGGESTIONS.filter((s) => s.vibe === vibe);
  }, [vibe]);

  const dayPlan = WEEKLY_MEAL_PLAN[dayIndex];

  return (
    <ProGate feature={t("features.mealTrainingPlans", { ns: "common" })}>
      <div>
        <ExploreBackHeader title={t("title")} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-muted">{t("subtitle")}</p>
          <div className="flex gap-2">
            {user?.plan === "pro" ? (
              <Badge variant="accent">{t("labels.pro", { ns: "common" })}</Badge>
            ) : (
              <Badge>{t("labels.free", { ns: "common" })}</Badge>
            )}
            <Button
              variant="outline"
              onClick={() =>
                toast(
                  user?.plan === "pro"
                    ? t("toast.weekRefreshed")
                    : t("toast.weekProOnly"),
                  user?.plan === "pro" ? "success" : "info",
                )
              }
            >
              <RefreshCw size={16} />
              {t("adjustWeek")}
            </Button>
          </div>
        </div>

        {nutritionPlan && (
          <Card className="mt-6" elevated>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Utensils
                  size={18}
                  className="text-accent-dim dark:text-accent"
                />
                <h2 className="font-display text-lg font-semibold">
                  {t("nutritionTitle")}
                </h2>
              </div>
              <Link href="/recipes">
                <Button size="sm" variant="outline">
                  {t("recipeLibrary")}
                </Button>
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-muted-bg p-4">
                  <p className="text-xs text-muted">{t("dailyCalories")}</p>
                  <p className="font-display text-2xl font-bold">
                    {nutritionPlan.dailyCalorieTarget}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted-bg p-4">
                  <p className="text-xs text-muted">{t("strategy")}</p>
                  <p className="font-display text-lg font-semibold capitalize">
                    {nutritionPlan.adjustmentType}
                  </p>
                </div>
              </div>
              <ProgressBar
                label={t("proteinBar", { n: nutritionPlan.proteinGrams })}
                value={nutritionPlan.proteinGrams}
                max={nutritionPlan.proteinGrams}
                color="protein"
              />
              <ProgressBar
                label={t("carbsBar", { n: nutritionPlan.carbsGrams })}
                value={nutritionPlan.carbsGrams}
                max={nutritionPlan.carbsGrams}
                color="carbs"
              />
              <ProgressBar
                label={t("fatBar", { n: nutritionPlan.fatGrams })}
                value={nutritionPlan.fatGrams}
                max={nutritionPlan.fatGrams}
                color="fat"
              />
              <p className="text-sm leading-relaxed text-muted">
                {nutritionPlan.strategySummary} {t("strategyExtra")}
              </p>
            </div>
          </Card>
        )}

        <Card className="mt-6" elevated>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {t("weekMealPlanTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {t("weekMealPlanSubtitle")}
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
                      <span className="text-xs text-muted">
                        {suggestion.brand}
                      </span>
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
                      toast(
                        t("toast.loggedMealDemo", {
                          name: suggestion.name,
                          slot: slot.slot,
                        }),
                        "success",
                      )
                    }
                  >
                    {t("logThisMeal")}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles
                size={18}
                className="text-accent-dim dark:text-accent"
              />
              <h2 className="font-display text-lg font-semibold">
                {t("mealIdeasTitle")}
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVibe(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    vibe === id
                      ? "bg-accent text-accent-fg"
                      : "bg-muted-bg text-muted"
                  }`}
                >
                  {t(VIBE_KEY[id])}
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
                  <Badge variant="accent">
                    {t(
                      VIBE_KEY[s.vibe as (typeof VIBE_IDS)[number]] ??
                        "vibe.flexible",
                    )}
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
                    toast(
                      t("toast.addedSuggestion", { name: s.name }),
                      "success",
                    )
                  }
                >
                  {t("addToPlan")}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium">{t("popularPlaces")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {POPULAR_PLACES.map((place) => (
                <span
                  key={place}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                >
                  {t("placeCount", {
                    place,
                    count: FOODS.filter((f) => f.brand === place).length,
                  })}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </ProGate>
  );
}
