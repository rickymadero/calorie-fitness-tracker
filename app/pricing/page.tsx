"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function PricingPage() {
  const { user, isReady, markPricingSeen, setPlan } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAppTranslation("pricing");
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!user.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    router.replace("/feed");
  }, [user, isReady, router]);

  const freeFeatures = useMemo(() => {
    const raw = t("freeFeatures", { returnObjects: true });
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const proFeatures = useMemo(() => {
    const raw = t("proFeatures", { returnObjects: true });
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  if (!isReady || !user) return <PageLoader />;

  const monthlyPrice = 12.99;
  const annualMonthly = 7.99;
  const savings = Math.round((1 - annualMonthly / monthlyPrice) * 100);

  function goDashboard() {
    markPricingSeen();
    router.push("/feed");
  }

  function startFree() {
    setPlan("free");
    toast(t("toastFree"), "success");
    goDashboard();
  }

  function startPro(trial?: boolean) {
    setPlan("pro");
    toast(trial ? t("toastTrial") : t("toastPro"), "success");
    goDashboard();
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <EvolveLogo size="sm" />
          <button
            type="button"
            onClick={goDashboard}
            className="text-sm text-muted hover:text-foreground"
          >
            {t("skip")}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-muted">{t("subtitle")}</p>

          <div className="mt-8 inline-flex rounded-2xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                billing === "monthly" ? "bg-muted-bg" : "text-muted"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                billing === "annual" ? "bg-accent text-accent-fg" : "text-muted"
              }`}
            >
              {t("annual")}
              <span className="ml-2 text-xs opacity-80">
                {t("savePercent", { pct: savings })}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="flex h-full flex-col">
              <h2 className="font-display text-xl font-semibold">
                {t("freeTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted">{t("freeBody")}</p>
              <p className="mt-6 font-display text-4xl font-bold">
                {t("freePrice")}
                <span className="text-base font-medium text-muted">
                  {" "}
                  {t("forever")}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0 text-muted" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8"
                variant="outline"
                size="lg"
                fullWidth
                onClick={startFree}
              >
                {t("startFree")}
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Card
              elevated
              className="relative flex h-full flex-col border-accent/50 ring-1 ring-accent/30"
            >
              <div className="absolute -top-3 right-5">
                <Badge variant="accent">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles size={12} /> {t("recommended")}
                  </span>
                </Badge>
              </div>
              <h2 className="font-display text-xl font-semibold">
                {t("proTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted">{t("proBody")}</p>
              <p className="mt-6 font-display text-4xl font-bold">
                ${billing === "annual" ? annualMonthly : monthlyPrice}
                <span className="text-base font-medium text-muted">
                  {" "}
                  {t("perMonth")}
                </span>
              </p>
              {billing === "annual" && (
                <p className="mt-1 text-xs text-muted">
                  {t("billedAnnual", { pct: savings })}
                </p>
              )}
              <ul className="mt-6 flex-1 space-y-3">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-accent-dim dark:text-accent"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-3">
                <Button size="lg" fullWidth onClick={() => startPro(true)}>
                  {t("startTrial")}
                </Button>
                <Button
                  size="lg"
                  fullWidth
                  variant="secondary"
                  onClick={() => startPro(false)}
                >
                  {t("upgrade")}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
