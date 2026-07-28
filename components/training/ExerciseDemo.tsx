"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Crown, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ExerciseDefinition } from "@/lib/types/training";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { pricingHref } from "@/lib/auth/pricingReturn";
import { useLocalizedPricing } from "@/lib/pricing/useLocalizedPricing";

export function ProDemoGate({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useAppTranslation(["workouts", "common", "pricing"]);
  const pricing = useLocalizedPricing();
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
      <p className="mt-3 font-display text-lg font-semibold">
        {pricing.formattedAnnualMonthly}{" "}
        <span className="text-sm font-medium text-muted">
          {t("perMonth", { ns: "pricing" })}
        </span>
      </p>
      <p className="mt-1 text-xs text-muted">
        {t("billedAnnualShort", { ns: "pricing" })}
      </p>
      <Button
        className="mt-6"
        size="lg"
        fullWidth
        onClick={() => router.push(pricingHref(pathname))}
      >
        {t("buttons.upgradePro", { ns: "common" })}
      </Button>
      <p className="mt-3 text-xs text-muted">
        {t("demo.gateFooter")}
      </p>
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
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-apex-lg border border-border bg-card shadow-apex transition hover:border-accent/40"
    >
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
