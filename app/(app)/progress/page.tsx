"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Crown,
  Flame,
  Ruler,
  Scale,
  Timer,
  TrendingUp,
  Route,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePosts } from "@/components/posts/PostsProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { ExploreBackHeader } from "@/components/layout/ExploreBackHeader";
import { weekStatsFromActivities } from "@/lib/activities/statsFromActivities";
import type { WeekStats } from "@/lib/activities/statsFromActivities";

const MEASUREMENT_KEYS = ["chest", "waist", "hips", "arms"] as const;
const MEASUREMENT_VALUES: Record<(typeof MEASUREMENT_KEYS)[number], string> = {
  chest: "102 cm",
  waist: "84 cm",
  hips: "96 cm",
  arms: "36 cm",
};

function formatDuration(totalMin: number) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function ProgressPage() {
  const { user, onboarding, updateOnboarding, setPlan } = useAuth();
  const { tick, weekStats } = usePosts();
  const { toast } = useToast();
  const { t } = useAppTranslation(["progress", "common"]);
  const [weightOpen, setWeightOpen] = useState(false);
  const [measureOpen, setMeasureOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [photos, setPhotos] = useState<{ id: string; label: string }[]>([]);

  const isPro = user?.plan === "pro";
  const unit =
    (user?.measurementSystem || onboarding.measurementSystem) === "imperial"
      ? "lb"
      : "kg";

  const localStats = useMemo(() => {
    void tick;
    if (!user) {
      return {
        days: [],
        totals: { workouts: 0, minutes: 0, distanceKm: 0, calories: 0 },
      } satisfies WeekStats;
    }
    return weekStats(user.id);
  }, [tick, user, weekStats]);

  const [remoteStats, setRemoteStats] = useState<WeekStats | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setRemoteStats(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const { activitiesService } = await import("@/lib/services/activities");
        const supabase = createClient();
        const { data } = await activitiesService.getCurrentUserActivities(
          supabase,
          user.id,
          { limit: 100, offset: 0 },
        );
        if (cancelled) return;
        if (data && data.length > 0) {
          setRemoteStats(weekStatsFromActivities(data));
        } else {
          setRemoteStats(null);
        }
      } catch {
        if (!cancelled) setRemoteStats(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, tick]);

  const stats = remoteStats ?? localStats;

  const maxMinutes = Math.max(1, ...stats.days.map((d) => d.minutes));

  const currentWeight =
    typeof onboarding.currentWeight === "number"
      ? onboarding.currentWeight
      : 78.4;
  const goalWeight =
    typeof onboarding.targetWeight === "number" ? onboarding.targetWeight : 72;

  const weightHistory = [
    { date: "Jun 1", value: Math.round((currentWeight + 2.8) * 10) / 10 },
    { date: "Jun 8", value: Math.round((currentWeight + 2.1) * 10) / 10 },
    { date: "Jun 15", value: Math.round((currentWeight + 1.4) * 10) / 10 },
    { date: "Jun 22", value: Math.round((currentWeight + 0.7) * 10) / 10 },
    { date: "Jun 29", value: Math.round((currentWeight + 0.3) * 10) / 10 },
    { date: t("chartToday"), value: currentWeight },
  ];
  const maxW = Math.max(...weightHistory.map((w) => w.value));
  const minW = Math.min(...weightHistory.map((w) => w.value));
  const change = Math.round((weightHistory[0].value - currentWeight) * 10) / 10;

  return (
    <div>
      <ExploreBackHeader title={t("basic.title")} />
      {/* Free basic stats */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{t("basic.subtitle")}</p>
        </div>
        <Badge variant="default">{t("basic.freeBadge")}</Badge>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Card padding="sm">
          <div className="flex items-center gap-1.5 text-muted">
            <Route size={14} />
            <p className="text-[11px] font-medium uppercase tracking-wide">
              {t("basic.distance")}
            </p>
          </div>
          <p className="mt-2 font-display text-xl font-bold tabular-nums">
            {stats.totals.distanceKm}
            <span className="ml-1 text-xs font-medium text-muted">km</span>
          </p>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-1.5 text-muted">
            <Timer size={14} />
            <p className="text-[11px] font-medium uppercase tracking-wide">
              {t("basic.time")}
            </p>
          </div>
          <p className="mt-2 font-display text-xl font-bold tabular-nums">
            {formatDuration(stats.totals.minutes)}
          </p>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-1.5 text-muted">
            <Flame size={14} />
            <p className="text-[11px] font-medium uppercase tracking-wide">
              {t("basic.calories")}
            </p>
          </div>
          <p className="mt-2 font-display text-xl font-bold tabular-nums">
            {stats.totals.calories}
          </p>
        </Card>
      </div>

      <Card elevated className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">
            {t("basic.weeklyActivity")}
          </h2>
          <p className="text-xs text-muted">
            {t("basic.workoutsCount", { n: stats.totals.workouts })}
          </p>
        </div>

        {stats.totals.workouts === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<TrendingUp size={28} />}
              title={t("basic.empty")}
              description={t("basic.emptyHint")}
              action={
                <Link href="/posts/new">
                  <Button size="sm">{t("basic.logWorkout")}</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 flex h-40 items-end gap-2">
            {stats.days.map((day) => {
              const height =
                day.minutes > 0
                  ? Math.max(12, (day.minutes / maxMinutes) * 100)
                  : 6;
              return (
                <div
                  key={day.key}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-[10px] tabular-nums text-muted">
                    {day.minutes > 0 ? `${day.minutes}m` : "—"}
                  </span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-lg ${
                      day.minutes > 0 ? "bg-accent" : "bg-muted-bg"
                    }`}
                    style={{ height }}
                    title={`${day.label}: ${day.minutes} min`}
                  />
                  <span className="text-[10px] text-muted">{day.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Advanced Pro analytics */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        {isPro ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setMeasureOpen(true)}>
              <Ruler size={16} />
              {t("measurements")}
            </Button>
            <Button variant="outline" onClick={() => setPhotoOpen(true)}>
              <Camera size={16} />
              {t("photo")}
            </Button>
            <Button onClick={() => setWeightOpen(true)}>
              <Scale size={16} />
              {t("logWeight")}
            </Button>
          </div>
        ) : (
          <Badge variant="accent">
            <Crown size={12} className="mr-1" />
            {t("labels.pro", { ns: "common" })}
          </Badge>
        )}
      </div>

      {!isPro ? (
        <Card className="mt-4 border-accent/30 bg-accent-soft/40 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-dim dark:text-accent">
            <Crown size={22} />
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">
            {t("basic.unlockTitle")}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {t("basic.unlockBody")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => {
                setPlan("pro");
                toast(t("success.upgradedPro", { ns: "common" }), "success");
              }}
            >
              <Crown size={16} />
              {t("proGate.upgradeDemo", { ns: "common" })}
            </Button>
            <Link href="/pricing">
              <Button variant="outline">
                {t("proGate.viewPlans", { ns: "common" })}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card elevated className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  {t("weightTrend")}
                </h2>
                <Badge variant="accent">
                  {t("changeThisMonth", {
                    sign: change > 0 ? "−" : change < 0 ? "+" : "",
                    amount: Math.abs(change),
                    unit,
                  })}
                </Badge>
              </div>
              <div className="mt-8 flex h-48 items-end gap-3">
                {weightHistory.map((point) => {
                  const pct =
                    ((point.value - minW) / (maxW - minW || 1)) * 100;
                  const height = 40 + pct * 0.9;
                  return (
                    <div
                      key={point.date}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <span className="text-[10px] text-muted">
                        {point.value}
                      </span>
                      <div
                        className="w-full max-w-[48px] rounded-t-xl bg-accent"
                        style={{ height }}
                      />
                      <span className="text-[10px] text-muted">
                        {point.date}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-muted">
                {t("currentGoal", {
                  current: currentWeight,
                  unit,
                  goal: goalWeight,
                })}
              </p>
            </Card>

            <Card>
              <h2 className="font-display text-lg font-semibold">
                {t("bodyMeasurements")}
              </h2>
              <ul className="mt-4 space-y-3">
                {MEASUREMENT_KEYS.map((key) => (
                  <li
                    key={key}
                    className="flex justify-between rounded-xl bg-muted-bg px-3 py-2 text-sm"
                  >
                    <span>{t(`measure.${key}`)}</span>
                    <span className="font-medium">
                      {MEASUREMENT_VALUES[key]}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="font-display text-lg font-semibold">
                {t("consistency")}
              </h2>
              <div className="mt-5 space-y-4">
                <ProgressBar
                  label={t("calorieAdherence")}
                  value={86}
                  max={100}
                  showValue
                />
                <ProgressBar
                  label={t("workoutConsistency")}
                  value={75}
                  max={100}
                  showValue
                />
                <ProgressBar
                  label={t("habitCompletion")}
                  value={68}
                  max={100}
                  showValue
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  {t("progressPhotos")}
                </h2>
                <TrendingUp size={18} className="text-muted" />
              </div>
              {photos.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    icon={<Camera size={28} />}
                    title={t("photosEmptyTitle")}
                    description={t("photosEmptyDescription")}
                    action={
                      <Button onClick={() => setPhotoOpen(true)}>
                        {t("addPhoto")}
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="flex aspect-[3/4] items-end rounded-2xl border border-border bg-gradient-to-br from-muted-bg to-border p-3"
                    >
                      <span className="text-xs font-medium">{p.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="mt-6">
            <h2 className="font-display text-lg font-semibold">
              {t("monthlyOverview")}
            </h2>
            <p className="mt-2 text-sm text-muted">{t("monthlyOverviewBody")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: t("avgDailyCalories"), value: "2,080" },
                { label: t("workoutsCompleted"), value: "14" },
                {
                  label: t("bestStreak"),
                  value: t("bestStreakValue", { n: 9 }),
                },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-muted-bg p-4">
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="mt-1 font-display text-xl font-bold">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <Modal
        open={weightOpen}
        onClose={() => setWeightOpen(false)}
        title={t("modal.logWeightTitle")}
      >
        <Input
          label={t("modal.weightLabel", { unit })}
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={String(currentWeight)}
        />
        <Button
          className="mt-4"
          fullWidth
          onClick={() => {
            const next = Number(weight);
            if (!Number.isFinite(next) || next <= 0) {
              toast(t("toast.invalidWeight"), "error");
              return;
            }
            updateOnboarding({ currentWeight: next });
            toast(t("toast.weightLogged"), "success");
            setWeightOpen(false);
            setWeight("");
          }}
        >
          {t("buttons.save", { ns: "common" })}
        </Button>
      </Modal>

      <Modal
        open={measureOpen}
        onClose={() => setMeasureOpen(false)}
        title={t("modal.updateMeasurements")}
      >
        <div className="space-y-3">
          {MEASUREMENT_KEYS.map((key) => (
            <Input
              key={key}
              label={t(`measure.${key}`)}
              defaultValue={MEASUREMENT_VALUES[key]}
            />
          ))}
          <Button
            fullWidth
            onClick={() => {
              toast(t("toast.measurementsUpdated"), "success");
              setMeasureOpen(false);
            }}
          >
            {t("buttons.save", { ns: "common" })}
          </Button>
        </div>
      </Modal>

      <Modal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        title={t("modal.addPhotoTitle")}
      >
        <p className="text-sm text-muted">{t("modal.addPhotoBody")}</p>
        <Button
          className="mt-4"
          fullWidth
          onClick={() => {
            setPhotos((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                label: new Date().toLocaleDateString(),
              },
            ]);
            setPhotoOpen(false);
            toast(t("toast.photoAdded"), "success");
          }}
        >
          {t("addPlaceholderPhoto")}
        </Button>
      </Modal>
    </div>
  );
}
