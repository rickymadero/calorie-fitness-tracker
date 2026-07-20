"use client";

import Link from "next/link";
import { ChevronLeft, Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { ExploreBackHeader } from "@/components/layout/ExploreBackHeader";

export function ProGate({
  children,
  feature,
}: {
  children: React.ReactNode;
  feature?: string;
}) {
  const { user, setPlan } = useAuth();
  const { t } = useAppTranslation("common");
  const isPro = user?.plan === "pro";
  const featureLabel = feature || t("proGate.defaultFeature");

  if (isPro) return <>{children}</>;

  return (
    <div>
      <ExploreBackHeader title={featureLabel} />
      <div className="mx-auto max-w-lg py-4">
        <Card className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-dim dark:text-accent">
            <Crown size={28} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            {t("proGate.title")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t("proGate.body", { feature: featureLabel })}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => {
                setPlan("pro");
              }}
            >
              <Crown size={16} />
              {t("proGate.upgradeDemo")}
            </Button>
            <Link href="/explore">
              <Button variant="outline">
                <ChevronLeft size={16} />
                {t("nav.evofit")}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost">{t("proGate.viewPlans")}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
