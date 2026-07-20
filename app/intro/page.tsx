"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Dumbbell,
  Flame,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

const FEATURE_IDS = [
  { id: "feed", icon: Activity },
  { id: "discover", icon: Flame },
  { id: "profile", icon: Dumbbell },
  { id: "pro", icon: BarChart3 },
  { id: "free", icon: Lightbulb },
] as const;

export default function IntroPage() {
  const { user, isReady, markIntroSeen } = useAuth();
  const router = useRouter();
  const { t } = useAppTranslation(["common", "auth"]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isReady) return;
    if (!user) router.replace("/");
    else if (!user.onboardingComplete) router.replace("/onboarding");
  }, [user, isReady, router]);

  const features = useMemo(
    () =>
      FEATURE_IDS.map((f) => ({
        ...f,
        title: t(`intro.features.${f.id}.title`, { ns: "auth" }),
        points: t(`intro.features.${f.id}.points`, {
          ns: "auth",
          returnObjects: true,
        }) as string[],
      })),
    [t],
  );

  if (!isReady || !user) return <PageLoader />;

  const feature = features[index];
  const Icon = feature.icon;

  function finish() {
    markIntroSeen();
    if (!user?.pricingSeen) router.push("/pricing");
    else router.push("/feed");
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <EvolveLogo size="sm" />
          <p className="text-sm text-muted">
            {index + 1} / {features.length}
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col px-4 py-10 md:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("intro.title", { ns: "auth" })}
        </h1>
        <p className="mt-2 text-muted">
          {t("intro.subtitle", { ns: "auth" })}
        </p>

        <div className="relative mt-8 min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <Card elevated className="min-h-[360px]">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-dim dark:text-accent">
                  <Icon size={24} />
                </div>
                <h2 className="font-display text-2xl font-semibold">{feature.title}</h2>
                <ul className="mt-5 space-y-3">
                  {(Array.isArray(feature.points) ? feature.points : []).map(
                    (p) => (
                      <li
                        key={p}
                        className="flex items-start gap-3 text-sm text-muted"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {p}
                      </li>
                    ),
                  )}
                </ul>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label={t("intro.previous", { ns: "auth" })}
          >
            <ChevronLeft size={18} />
            {t("buttons.back")}
          </Button>
          <div className="flex gap-1.5">
            {features.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t("intro.goToFeature", { ns: "auth", n: i + 1 })}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-accent" : "w-2 bg-ring-track"
                }`}
              />
            ))}
          </div>
          {index < features.length - 1 ? (
            <Button onClick={() => setIndex((i) => i + 1)}>
              {t("buttons.next")}
              <ChevronRight size={18} />
            </Button>
          ) : (
            <Button onClick={finish}>
              {t("intro.dashboard", { ns: "auth" })}
            </Button>
          )}
        </div>

        {index < features.length - 1 && (
          <button
            type="button"
            onClick={finish}
            className="mt-6 text-center text-sm text-muted underline-offset-2 hover:underline"
          >
            {t("intro.skip", { ns: "auth" })}
          </button>
        )}
      </main>
    </div>
  );
}
