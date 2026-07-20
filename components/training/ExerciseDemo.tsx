"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ExerciseDefinition } from "@/lib/types/training";
import { getAthleteDemoMedia } from "@/lib/training/exerciseMedia";
import {
  AthleteFormDemo,
  AthleteFormThumb,
} from "@/components/training/AthleteFormDemo";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export function ProDemoGate({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { t } = useAppTranslation(["workouts", "common"]);
  return (
    <div className="rounded-apex-lg border border-accent/40 bg-card p-6 text-center shadow-apex-lg">
      {onClose && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-muted"
            aria-label={t("buttons.close", { ns: "common" })}
          >
            <X size={18} />
          </button>
        </div>
      )}
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-dim dark:text-accent">
        <Crown size={22} />
      </div>
      <h3 className="font-display text-xl font-bold">
        {t("demo.gateTitle")}
      </h3>
      <p className="mt-3 text-sm text-muted">
        {t("demo.gateBody")}
      </p>
      <Button
        className="mt-6"
        size="lg"
        fullWidth
        onClick={() => router.push("/pricing")}
      >
        {t("buttons.upgradePro", { ns: "common" })}
      </Button>
      <p className="mt-3 text-xs text-muted">
        {t("demo.gateFooter")}
      </p>
    </div>
  );
}

export function ExerciseDemoPlayer({
  exercise,
  isPro,
  compact,
}: {
  exercise: ExerciseDefinition;
  isPro: boolean;
  compact?: boolean;
}) {
  const { t } = useAppTranslation(["workouts", "common"]);
  const media = getAthleteDemoMedia(exercise.id, exercise.tags);

  if (!isPro) {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        <AthleteFormThumb media={media} className="aspect-video opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
          <div className="max-w-sm">
            <ProDemoGate />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <AthleteFormDemo
        media={media}
        title={exercise.name}
        compact={compact}
      />
      <div className="flex items-center justify-between gap-2 border-t border-border bg-card px-3 py-2 text-xs text-muted">
        <span>{t("demo.footerCaption")}</span>
        <Badge variant="accent">{t("labels.pro", { ns: "common" })}</Badge>
      </div>
    </div>
  );
}

export function ExerciseCardLink({
  exercise,
  href,
}: {
  exercise: ExerciseDefinition;
  href: string;
}) {
  const media = getAthleteDemoMedia(exercise.id, exercise.tags);

  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-apex-lg border border-border bg-card shadow-apex transition hover:border-accent/40"
    >
      <AthleteFormThumb media={media} className="aspect-[16/10]" />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Badge className="capitalize">{exercise.primaryMuscle}</Badge>
          <Badge variant="default" className="capitalize">
            {exercise.difficulty}
          </Badge>
        </div>
        <h3 className="mt-2 font-display font-semibold">{exercise.name}</h3>
        <p className="mt-1 text-xs text-muted">
          {exercise.equipment.join(", ")}
        </p>
      </div>
    </Link>
  );
}
