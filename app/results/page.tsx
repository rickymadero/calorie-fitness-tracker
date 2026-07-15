"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Droplets,
  Flame,
  Target,
  Dumbbell,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function ResultsPage() {
  const { user, isReady, nutritionPlan } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!user) router.replace("/");
    else if (!user.onboardingComplete || !nutritionPlan) router.replace("/onboarding");
  }, [user, isReady, nutritionPlan, router]);

  if (!isReady || !user || !nutritionPlan) return <PageLoader />;

  const adjustmentLabel =
    nutritionPlan.adjustmentType === "deficit"
      ? "Recommended deficit"
      : nutritionPlan.adjustmentType === "surplus"
        ? "Recommended surplus"
        : "At maintenance";

  const stats = [
    {
      icon: Flame,
      label: "Daily calorie target",
      value: `${nutritionPlan.dailyCalorieTarget}`,
      unit: "kcal",
    },
    {
      icon: Target,
      label: "Maintenance calories",
      value: `${nutritionPlan.maintenanceCalories}`,
      unit: "kcal",
    },
    {
      icon: Sparkles,
      label: adjustmentLabel,
      value:
        nutritionPlan.adjustmentType === "maintenance"
          ? "0"
          : `${nutritionPlan.calorieAdjustment}`,
      unit: "kcal",
    },
    {
      icon: Droplets,
      label: "Water intake",
      value: `${nutritionPlan.waterLiters}`,
      unit: "L/day",
    },
    {
      icon: Dumbbell,
      label: "Workouts / week",
      value: `${nutritionPlan.workoutsPerWeek}`,
      unit: "sessions",
    },
    {
      icon: Calendar,
      label: "Estimated timeline",
      value: nutritionPlan.estimatedWeeksToGoal
        ? `${nutritionPlan.estimatedWeeksToGoal}`
        : "—",
      unit: nutritionPlan.estimatedWeeksToGoal ? "weeks" : "maintain",
    },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <EvolveLogo size="sm" href="#" />
          <Badge variant="accent">Personalized plan</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Your Evolve targets
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Based on your goals and lifestyle, here&apos;s a starting framework.
            These are estimates — you can refine them anytime.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Card className="h-full">
                <stat.icon className="mb-3 text-accent-dim dark:text-accent" size={20} />
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {stat.label}
                </p>
                <p className="mt-1 font-display text-3xl font-bold">
                  {stat.value}
                  <span className="ml-1 text-sm font-medium text-muted">
                    {stat.unit}
                  </span>
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="mt-6" elevated>
          <h2 className="font-display text-lg font-semibold">Daily macros</h2>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-[#60a5fa]">
                {nutritionPlan.proteinGrams}g
              </p>
              <p className="text-xs text-muted">Protein</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[#fbbf24]">
                {nutritionPlan.carbsGrams}g
              </p>
              <p className="text-xs text-muted">Carbs</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[#f472b6]">
                {nutritionPlan.fatGrams}g
              </p>
              <p className="text-xs text-muted">Fat</p>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold">
            Recommended fitness strategy
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {nutritionPlan.strategySummary}
          </p>
          <p className="mt-4 rounded-xl bg-muted-bg px-4 py-3 text-xs text-muted">
            These recommendations are estimates generated from the information you
            provided. Adjust targets as your progress and preferences evolve.
          </p>
        </Card>

        <div className="mt-10 pb-12">
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push("/intro")}
          >
            Create My Personalized Plan
          </Button>
        </div>
      </main>
    </div>
  );
}
