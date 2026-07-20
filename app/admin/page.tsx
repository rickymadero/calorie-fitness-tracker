"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTraining } from "@/components/training/TrainingProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { generatePersonalizedPlan } from "@/lib/training/generatePlan";
import type { FitnessGoal, ExperienceLevel } from "@/lib/types";

const GOAL_KEY: Record<FitnessGoal, string> = {
  "lose-weight": "editor.goal.loseWeight",
  "build-muscle": "editor.goal.buildMuscle",
  "increase-strength": "editor.goal.increaseStrength",
  "improve-endurance": "editor.goal.improveEndurance",
  "overall-health": "editor.goal.overallHealth",
  "athletic-performance": "editor.goal.athleticPerformance",
  "maintain-weight": "editor.goal.maintainWeight",
};

const LEVEL_KEY: Record<ExperienceLevel, string> = {
  beginner: "editor.level.beginner",
  intermediate: "editor.level.intermediate",
  advanced: "editor.level.advanced",
};

export default function AdminHomePage() {
  const { user, onboarding, isReady: authReady } = useAuth();
  const {
    isReady,
    plans,
    savePlan,
    deletePlan,
    assignPlanToUser,
    duplicateAsTemplate,
  } = useTraining();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAppTranslation(["admin", "common"]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) router.replace("/login");
  }, [authReady, user, router]);

  if (!authReady || !isReady || !user) return <PageLoader />;

  const templates = plans.filter((p) => p.isTemplate);
  const assigned = plans.filter((p) => !p.isTemplate);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <EvolveLogo href="/feed" size="sm" />
          <div className="flex gap-2">
            <Link href="/workouts">
              <Button variant="outline" size="sm">
                {t("home.userWorkouts")}
              </Button>
            </Link>
            <Link href="/admin/plans/new">
              <Button size="sm">
                <Plus size={16} />
                {t("home.newPlan")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("home.title")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t("home.subtitle")}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const plan = generatePersonalizedPlan(onboarding, user.id);
              plan.isTemplate = true;
              plan.name = t("home.templateNamePrefix", { name: plan.name });
              plan.assignedUserIds = [];
              savePlan(plan);
              toast(t("toast.templateGenerated"), "success");
            }}
          >
            {t("home.generateTemplate")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const plan = generatePersonalizedPlan(onboarding, user.id);
              savePlan(plan);
              assignPlanToUser(plan.id, user.id, false);
              toast(t("toast.planAssigned"), "success");
            }}
          >
            <Users size={16} />
            {t("home.assignFresh")}
          </Button>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">{t("home.templates")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {templates.length === 0 && (
              <Card>
                <p className="text-sm text-muted">{t("home.noTemplates")}</p>
              </Card>
            )}
            {templates.map((plan) => (
              <Card key={plan.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge>{t("home.templateBadge")}</Badge>
                    <h3 className="mt-2 font-display font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {t("home.templateMeta", {
                        days: plan.daysPerWeek,
                        level: t(LEVEL_KEY[plan.experienceLevel]),
                        goal: t(GOAL_KEY[plan.mainGoal]),
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/plans/${plan.id}`}>
                    <Button size="sm" variant="secondary">
                      {t("buttons.edit", { ns: "common" })}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => {
                      assignPlanToUser(plan.id, user.id, true);
                      toast(t("toast.assignedCopy"), "success");
                    }}
                  >
                    {t("home.assignToMe")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      duplicateAsTemplate(plan.id);
                      toast(t("toast.templateDuplicated"), "success");
                    }}
                  >
                    <Copy size={14} />
                    {t("home.duplicate")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      deletePlan(plan.id);
                      toast(t("toast.templateDeleted"), "info");
                    }}
                  >
                    {t("buttons.delete", { ns: "common" })}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">{t("home.assignedSection")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {assigned.length === 0 && (
              <Card>
                <p className="text-sm text-muted">{t("home.noAssigned")}</p>
              </Card>
            )}
            {assigned.map((plan) => (
              <Card key={plan.id}>
                <Badge variant="accent">{t("home.assignedBadge")}</Badge>
                <h3 className="mt-2 font-display font-semibold">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {t("home.assignedMeta", {
                    users: plan.assignedUserIds.join(", ") || "—",
                    parent: plan.parentTemplateId
                      ? t("home.parentLinked")
                      : t("home.parentOriginal"),
                  })}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/plans/${plan.id}`}>
                    <Button size="sm">{t("home.editAssigned")}</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      duplicateAsTemplate(plan.id);
                      toast(t("toast.savedAsTemplate"), "success");
                    }}
                  >
                    {t("home.saveAsTemplate")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
