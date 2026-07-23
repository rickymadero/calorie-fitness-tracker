"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Dumbbell,
  Utensils,
  Calculator,
  Crown,
  ScanLine,
  Flame,
  Activity,
  BookOpen,
  TrendingUp,
  Target,
  History,
  Heart,
  MessageSquare,
  Sparkles,
  Ban,
  Bookmark,
  Apple,
  LifeBuoy,
} from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { BarcodeScanner } from "@/components/food/BarcodeScanner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { foodLogStorage } from "@/lib/storage/foodLog";
import type { FoodItem } from "@/lib/types";

type ExploreTab = "foryou" | "workouts" | "nutrition" | "tools" | "pro";
type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

type FeatureKey =
  | "basicLogging"
  | "basicStats"
  | "plans"
  | "macros"
  | "scanner"
  | "formGuides"
  | "history"
  | "library"
  | "goals"
  | "meals"
  | "recipes"
  | "analytics"
  | "body"
  | "health"
  | "support"
  | "adFree"
  | "forums";

type ToolCard = {
  href: string;
  feature: FeatureKey;
  icon: typeof Dumbbell;
  pro?: boolean;
};

function SectionLabel({ free }: { free: boolean }) {
  const { t } = useAppTranslation(["explore", "common"]);
  return (
    <div className="mb-2 mt-1 flex items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {free ? t("explore:sections.free") : t("explore:sections.pro")}
      </p>
      <Badge variant={free ? "default" : "accent"}>
        {free ? t("common:labels.free") : t("common:labels.pro")}
      </Badge>
    </div>
  );
}

function SectionCard({
  href,
  feature,
  icon: Icon,
  pro,
  isProUser,
  onOpenScanner,
}: ToolCard & {
  isProUser: boolean;
  onOpenScanner?: () => void;
}) {
  const { t } = useAppTranslation(["common", "explore"]);
  const isScanner = feature === "scanner";
  const locked = Boolean(pro && !isProUser && !isScanner);
  const destination = locked ? "/pricing" : href;

  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-dim dark:text-accent">
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 flex-1 truncate font-display text-sm font-semibold">
            {t(`explore:features.${feature}.title`)}
          </p>
          <span className="shrink-0">
            {pro ? (
              <Badge variant="accent">{t("common:labels.pro")}</Badge>
            ) : (
              <Badge variant="default">{t("common:labels.free")}</Badge>
            )}
          </span>
        </div>
        <p className="mt-0.5 break-words text-xs leading-relaxed text-muted">
          {t(`explore:features.${feature}.desc`)}
        </p>
        {locked ? (
          <p className="mt-2 text-xs font-semibold text-accent">
            {t("explore:upgradeCta")}
          </p>
        ) : null}
      </div>
    </>
  );

  if (isScanner && onOpenScanner) {
    return (
      <button
        type="button"
        onClick={onOpenScanner}
        className="evolve-card-lift flex min-h-[88px] w-full min-w-0 max-w-full gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-apex"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={destination}
      className="evolve-card-lift flex min-h-[88px] w-full min-w-0 max-w-full gap-3 rounded-2xl border border-border bg-card p-4 shadow-apex"
    >
      {content}
    </Link>
  );
}

function ToolList({
  items,
  isProUser,
  onOpenScanner,
}: {
  items: ToolCard[];
  isProUser: boolean;
  onOpenScanner?: () => void;
}) {
  const free = items.filter((i) => !i.pro);
  const pro = items.filter((i) => i.pro);
  return (
    <div className="grid min-w-0 max-w-full gap-3">
      {free.length > 0 && (
        <>
          <SectionLabel free />
          {free.map((item) => (
            <SectionCard
              key={`free-${item.feature}-${item.href}`}
              {...item}
              isProUser={isProUser}
              onOpenScanner={onOpenScanner}
            />
          ))}
        </>
      )}
      {pro.length > 0 && (
        <>
          <SectionLabel free={false} />
          {pro.map((item) => (
            <SectionCard
              key={`pro-${item.feature}-${item.href}`}
              {...item}
              isProUser={isProUser}
              onOpenScanner={onOpenScanner}
            />
          ))}
        </>
      )}
    </div>
  );
}

const PRO_CATALOG: ToolCard[] = [
  { href: "/food", feature: "macros", icon: Flame, pro: true },
  { href: "/plans", feature: "plans", icon: Dumbbell, pro: true },
  { href: "/food?scan=1", feature: "scanner", icon: ScanLine, pro: true },
  { href: "/progress", feature: "analytics", icon: TrendingUp, pro: true },
  { href: "/plans", feature: "meals", icon: Utensils, pro: true },
  { href: "/progress", feature: "body", icon: Activity, pro: true },
  { href: "/exercises", feature: "formGuides", icon: BookOpen, pro: true },
  { href: "/workouts", feature: "history", icon: History, pro: true },
  { href: "/settings/help", feature: "support", icon: LifeBuoy, pro: true },
  { href: "/pricing", feature: "adFree", icon: Ban, pro: true },
  { href: "/profile/saved", feature: "library", icon: Bookmark, pro: true },
  { href: "/plans", feature: "goals", icon: Target, pro: true },
  { href: "/network", feature: "forums", icon: MessageSquare, pro: false },
  { href: "/recipes", feature: "recipes", icon: Sparkles, pro: true },
  { href: "/settings/health", feature: "health", icon: Apple, pro: true },
];

export default function ExplorePage() {
  const { user, nutritionPlan } = useAuth();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "explore", "feed", "food"]);
  const router = useRouter();
  const [tab, setTab] = useState<ExploreTab>("foryou");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMeal, setScanMeal] = useState<MealType>("lunch");
  const isPro = user?.plan === "pro";
  const showScanMealPicker =
    tab === "foryou" || tab === "nutrition" || tab === "pro";
  const calorieTarget = nutritionPlan?.dailyCalorieTarget ?? 2200;
  const todayTotals = user
    ? foodLogStorage.dayTotals(foodLogStorage.listDay(user.id))
    : { calories: 0 };
  const remainingCalories = Math.max(0, calorieTarget - todayTotals.calories);

  const forYou = useMemo<ToolCard[]>(
    () => [
      { href: "/posts/new", feature: "basicLogging", icon: Activity },
      { href: "/progress", feature: "basicStats", icon: TrendingUp },
      { href: "/plans", feature: "plans", icon: Dumbbell, pro: true },
      { href: "/food", feature: "macros", icon: Flame, pro: true },
      { href: "/food?scan=1", feature: "scanner", icon: ScanLine, pro: true },
      { href: "/exercises", feature: "formGuides", icon: BookOpen, pro: true },
    ],
    [],
  );

  const workouts = useMemo<ToolCard[]>(
    () => [
      { href: "/posts/new", feature: "basicLogging", icon: Activity },
      { href: "/workouts", feature: "plans", icon: Dumbbell, pro: true },
      { href: "/exercises", feature: "formGuides", icon: BookOpen, pro: true },
      { href: "/workouts", feature: "history", icon: History, pro: true },
      { href: "/profile/saved", feature: "library", icon: Bookmark, pro: true },
      { href: "/plans", feature: "goals", icon: Target, pro: true },
    ],
    [],
  );

  const nutrition = useMemo<ToolCard[]>(
    () => [
      { href: "/food", feature: "macros", icon: Flame, pro: true },
      { href: "/food?scan=1", feature: "scanner", icon: ScanLine, pro: true },
      { href: "/plans", feature: "meals", icon: Utensils, pro: true },
      { href: "/recipes", feature: "recipes", icon: Sparkles, pro: true },
    ],
    [],
  );

  const tools = useMemo<ToolCard[]>(
    () => [
      { href: "/progress", feature: "basicStats", icon: Calculator },
      { href: "/progress", feature: "analytics", icon: TrendingUp, pro: true },
      { href: "/progress", feature: "body", icon: Heart, pro: true },
      { href: "/settings/health", feature: "health", icon: Apple, pro: true },
    ],
    [],
  );

  function handleScannerLog(food: FoodItem, mealType: MealType) {
    if (!user) return;
    setScanMeal(mealType);
    foodLogStorage.add(user.id, mealType, food);
    setScannerOpen(false);
    toast(
      t("food:toast.added", {
        name: food.name,
        meal: t(`common:meal.${mealType}`),
      }),
      "success",
    );
    router.push("/food");
  }

  return (
    <div className="min-w-0 w-full max-w-full">
      <PageHeader sticky titleContent={<EvolveLogo size="md" />} />

      <div className="mt-1 min-w-0 max-w-full">
        <SegmentedControl
          scroll
          segments={[
            { id: "foryou", label: t("explore:tabs.forYou") },
            { id: "workouts", label: t("explore:tabs.workouts") },
            { id: "nutrition", label: t("explore:tabs.nutrition") },
            { id: "tools", label: t("explore:tabs.tools") },
            { id: "pro", label: t("explore:tabs.pro") },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-5 min-w-0 max-w-full">
        {showScanMealPicker && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted">
              {t("food:scanner.logTo")}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setScanMeal(m)}
                  className={`min-h-11 rounded-xl px-2 text-xs font-medium capitalize transition ${
                    scanMeal === m
                      ? "bg-accent text-accent-fg"
                      : "border border-border bg-card text-muted hover:text-foreground"
                  }`}
                >
                  {t(`common:meal.${m}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "foryou" && (
          <ToolList
            items={forYou}
            isProUser={isPro}
            onOpenScanner={() => setScannerOpen(true)}
          />
        )}
        {tab === "workouts" && (
          <ToolList items={workouts} isProUser={isPro} />
        )}
        {tab === "nutrition" && (
          <ToolList
            items={nutrition}
            isProUser={isPro}
            onOpenScanner={() => setScannerOpen(true)}
          />
        )}
        {tab === "tools" && <ToolList items={tools} isProUser={isPro} />}

        {tab === "pro" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-apex">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-accent" />
                <p className="font-display font-semibold">
                  {isPro
                    ? t("explore:proHero.onPro")
                    : t("explore:proHero.title")}
                </p>
              </div>
              <p className="mt-2 text-sm text-muted">
                {t("explore:proHero.body")}
              </p>
              {!isPro && (
                <Link href="/pricing" className="mt-3 inline-block">
                  <Button size="sm">
                    <Crown size={14} />
                    {t("common:buttons.upgradePro")}
                  </Button>
                </Link>
              )}
            </div>
            <SectionLabel free={false} />
            {PRO_CATALOG.map((item) => (
              <SectionCard
                key={item.feature}
                {...item}
                isProUser={isPro}
                onOpenScanner={() => setScannerOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      <BarcodeScanner
        open={scannerOpen}
        isPro={Boolean(isPro)}
        mealType={scanMeal}
        remainingCalories={remainingCalories}
        onClose={() => setScannerOpen(false)}
        onLog={handleScannerLog}
        onMealTypeChange={setScanMeal}
      />
    </div>
  );
}
