"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ExerciseCardLink } from "@/components/training/ExerciseDemo";
import { EXERCISES } from "@/lib/mock/exercises";
import type { MuscleGroup } from "@/lib/types/training";
import { ProGate } from "@/components/pro/ProGate";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { ExploreBackHeader } from "@/components/layout/ExploreBackHeader";

const MUSCLES: Array<MuscleGroup | "all"> = [
  "all",
  "chest",
  "back",
  "shoulders",
  "quads",
  "hamstrings",
  "glutes",
  "core",
  "biceps",
  "triceps",
  "cardio",
];

export default function ExercisesPage() {
  const { t } = useAppTranslation(["workouts", "common"]);
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<(typeof MUSCLES)[number]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      const mOk =
        muscle === "all" ||
        e.primaryMuscle === muscle ||
        e.secondaryMuscles.includes(muscle);
      const qOk =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.tags.some((tag) => tag.includes(q));
      return mOk && qOk;
    });
  }, [query, muscle]);

  return (
    <ProGate feature={t("features.exerciseLibrary", { ns: "common" })}>
    <div>
      <ExploreBackHeader title={t("exercises.title")} />
      <p className="text-sm text-muted">
        {t("exercises.subtitle")}
      </p>

      <Card className="mt-6">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("exercises.searchPlaceholder")}
            className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 outline-none focus:border-accent"
          />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
          {MUSCLES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMuscle(m)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm capitalize ${
                muscle === m
                  ? "bg-accent text-accent-fg font-medium"
                  : "bg-muted-bg text-muted"
              }`}
            >
              {m === "all" ? t("exercises.muscleAll") : m}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((ex) => (
          <ExerciseCardLink
            key={ex.id}
            exercise={ex}
            href={`/exercises/${ex.id}`}
          />
        ))}
      </div>
    </div>
    </ProGate>
  );
}
