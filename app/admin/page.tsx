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
import { generatePersonalizedPlan } from "@/lib/training/generatePlan";

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
                User workouts
              </Button>
            </Link>
            <Link href="/admin/plans/new">
              <Button size="sm">
                <Plus size={16} />
                New plan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Admin workout builder
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create templates, assign personalized plans, and edit assigned copies without
          changing the original template.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const plan = generatePersonalizedPlan(onboarding, user.id);
              plan.isTemplate = true;
              plan.name = `Template · ${plan.name}`;
              plan.assignedUserIds = [];
              savePlan(plan);
              toast("Template generated from current profile.", "success");
            }}
          >
            Generate template from onboarding
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const plan = generatePersonalizedPlan(onboarding, user.id);
              savePlan(plan);
              assignPlanToUser(plan.id, user.id, false);
              toast("Plan assigned to your account.", "success");
            }}
          >
            <Users size={16} />
            Assign fresh plan to me
          </Button>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Templates</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {templates.length === 0 && (
              <Card>
                <p className="text-sm text-muted">No templates yet.</p>
              </Card>
            )}
            {templates.map((plan) => (
              <Card key={plan.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge>Template</Badge>
                    <h3 className="mt-2 font-display font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {plan.daysPerWeek} days · {plan.experienceLevel} ·{" "}
                      {plan.mainGoal.replace(/-/g, " ")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/plans/${plan.id}`}>
                    <Button size="sm" variant="secondary">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => {
                      assignPlanToUser(plan.id, user.id, true);
                      toast("Assigned a copy to your user account.", "success");
                    }}
                  >
                    Assign to me
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      duplicateAsTemplate(plan.id);
                      toast("Template duplicated.", "success");
                    }}
                  >
                    <Copy size={14} />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      deletePlan(plan.id);
                      toast("Template deleted.", "info");
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Assigned / custom plans</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {assigned.length === 0 && (
              <Card>
                <p className="text-sm text-muted">No assigned plans yet.</p>
              </Card>
            )}
            {assigned.map((plan) => (
              <Card key={plan.id}>
                <Badge variant="accent">Assigned copy</Badge>
                <h3 className="mt-2 font-display font-semibold">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  Users: {plan.assignedUserIds.join(", ") || "—"} · parent{" "}
                  {plan.parentTemplateId ? "linked" : "original"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/plans/${plan.id}`}>
                    <Button size="sm">Edit assigned plan</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      duplicateAsTemplate(plan.id);
                      toast("Saved as template.", "success");
                    }}
                  >
                    Save as template
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
