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
import { useAppTranslation } from "@/components/providers/LanguageProvider";
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
  const { t } = useAppTranslation(["common", "auth"]);

  useEffect(() => {
    if (!isReady) return;
    if (!user) router.replace("/");
    else if (!user.onboardingComplete || !nutritionPlan)
      router.replace("/onboarding");
  }, [user, isReady, nutritionPlan, router]);

  if (!isReady || !user || !nutritionPlan) return <PageLoader />;

  const adjustmentLabel =
    nutritionPlan.adjustmentType === "deficit"
      ? t("auth:results.deficit")
      : nutritionPlan.adjustmentType === "surplus"
        ? t("auth:results.surplus")
        : t("auth:results.atMaintenance");

  const stats = [
    {
      icon: Flame,
      label: t("auth:results.dailyCalorie"),
      value: `${nutritionPlan.dailyCalorieTarget}`,
      unit: t("common:macros.kcal"),
    },
    {
      icon: Target,
      label: t("auth:results.maintenance"),
      value: `${nutritionPlan.maintenanceCalories}`,
      unit: t("common:macros.kcal"),
    },
    {
      icon: Sparkles,
      label: adjustmentLabel,
      value:
        nutritionPlan.adjustmentType === "maintenance"
          ? "0"
          : `${nutritionPlan.calorieAdjustment}`,
      unit: t("common:macros.kcal"),
    },
    {
      icon: Droplets,
      label: t("auth:results.water"),
      value: `${nutritionPlan.waterLiters}`,
      unit: t("auth:results.waterUnit"),
    },
    {
      icon: Dumbbell,
      label: t("auth:results.workoutsPerWeek"),
      value: `${nutritionPlan.workoutsPerWeek}`,
      unit: t("auth:results.sessions"),
    },
    {
      icon: Calendar,
      label: t("auth:results.timeline"),
      value: nutritionPlan.estimatedWeeksToGoal
        ? `${nutritionPlan.estimatedWeeksToGoal}`
        : "—",
      unit: nutritionPlan.estimatedWeeksToGoal
        ? t("auth:results.weeks")
        : t("auth:results.maintain"),
    },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <EvolveLogo size="sm" />
          <Badge variant="accent">{t("auth:results.badge")}</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {t("auth:results.title")}
          </h1>
          <p className="mt-3 max-w-xl text-muted">{t("auth:results.body")}</p>
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
                <stat.icon
                  className="mb-3 text-accent-dim dark:text-accent"
                  size={20}
                />
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
          <h2 className="font-display text-lg font-semibold">
            {t("auth:results.dailyMacros")}
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-[#60a5fa]">
                {nutritionPlan.proteinGrams}g
              </p>
              <p className="text-xs text-muted">{t("auth:results.protein")}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[#fbbf24]">
                {nutritionPlan.carbsGrams}g
              </p>
              <p className="text-xs text-muted">{t("auth:results.carbs")}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[#f472b6]">
                {nutritionPlan.fatGrams}g
              </p>
              <p className="text-xs text-muted">{t("auth:results.fat")}</p>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold">
            {t("auth:results.strategy")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {nutritionPlan.strategySummary}
          </p>
          <p className="mt-4 rounded-xl bg-muted-bg px-4 py-3 text-xs text-muted">
            {t("auth:results.disclaimer")}
          </p>
        </Card>

        <div className="mt-10 pb-12">
          <Button size="lg" fullWidth onClick={() => router.push("/intro")}>
            {t("auth:results.cta")}
          </Button>
        </div>
      </main>
    </div>
  );
}
