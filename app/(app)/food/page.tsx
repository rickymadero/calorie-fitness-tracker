"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Barcode,
  BookOpen,
  Crown,
  Heart,
  Plus,
  Search,
  Trash2,
  Utensils,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { BarcodeScanner } from "@/components/food/BarcodeScanner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { FOODS, SAMPLE_MEALS } from "@/lib/mock/data";
import { scaleFood } from "@/lib/mock/barcodeDatabase";
import { foodLogStorage } from "@/lib/storage/foodLog";
import type { FoodCategory, FoodItem, LoggedMeal } from "@/lib/types";
import { ProGate } from "@/components/pro/ProGate";
import { ExploreBackHeader } from "@/components/layout/ExploreBackHeader";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const FOOD_FILTER_IDS = [
  "all",
  "protein",
  "carb",
  "fat",
  "fruit",
  "vegetable",
  "condiment",
  "snack",
  "drink",
  "prepared",
  "grocery",
  "fast-food",
  "restaurant",
] as const;

const FILTER_KEY: Record<(typeof FOOD_FILTER_IDS)[number], string> = {
  all: "filter.all",
  protein: "filter.protein",
  carb: "filter.carb",
  fat: "filter.fat",
  fruit: "filter.fruit",
  vegetable: "filter.vegetable",
  condiment: "filter.condiment",
  snack: "filter.snacks",
  drink: "filter.drinks",
  prepared: "filter.prepared",
  grocery: "filter.grocery",
  "fast-food": "filter.fastFood",
  restaurant: "filter.restaurant",
};

const SERVING_PRESETS = [0.5, 1, 1.5, 2, 3];
const RESULT_CAP = 80;

type FoodTab = "diary" | "add" | "favorites";

function formatDayLabel(dateKey: string, todayKey: string, t: (k: string) => string) {
  if (dateKey === todayKey) return t("diary.today");
  const d = new Date(`${dateKey}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function foodExtras(food: FoodItem) {
  const extras: string[] = [];
  if (food.fiber != null) extras.push(`Fiber ${food.fiber}g`);
  if (food.sodium != null) extras.push(`Na ${food.sodium}mg`);
  return extras.length ? ` · ${extras.join(" · ")}` : "";
}

export default function FoodPage() {
  const { nutritionPlan, user } = useAuth();
  const { toast } = useToast();
  const { t } = useAppTranslation(["food", "common"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPro = user?.plan === "pro";

  const [tab, setTab] = useState<FoodTab>("diary");
  const [selectedDate, setSelectedDate] = useState(foodLogStorage.todayKey());
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [dates, setDates] = useState<string[]>([foodLogStorage.todayKey()]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof FOOD_FILTER_IDS)[number]>("all");
  const [barcodeOpen, setBarcodeOpen] = useState(
    () => searchParams.get("scan") === "1",
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [logFoodTarget, setLogFoodTarget] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [gramsInput, setGramsInput] = useState("");
  const [activeMeal, setActiveMeal] =
    useState<(typeof MEAL_TYPES)[number]>("lunch");
  const [custom, setCustom] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    serving: "",
  });

  function refresh(date = selectedDate) {
    if (!user) return;
    let day = foodLogStorage.listDay(user.id, date);
    // Seed demo meals once for today if empty
    if (
      date === foodLogStorage.todayKey() &&
      day.length === 0 &&
      !localStorage.getItem(`evolve.food.seeded.${user.id}`)
    ) {
      for (const sample of SAMPLE_MEALS) {
        foodLogStorage.add(user.id, sample.mealType, sample.food, date);
      }
      localStorage.setItem(`evolve.food.seeded.${user.id}`, "1");
      day = foodLogStorage.listDay(user.id, date);
    }
    setMeals(day);
    setDates(foodLogStorage.listDates(user.id));
    setFavorites(foodLogStorage.getFavorites(user.id));
  }

  useEffect(() => {
    if (!user) return;
    refresh(selectedDate);
    setHydrated(true);
  }, [user?.id, selectedDate]);

  useEffect(() => {
    if (searchParams.get("scan") !== "1") return;
    setTab("add");
    setBarcodeOpen(true);
    router.replace("/food", { scroll: false });
  }, [searchParams, router]);

  const target = nutritionPlan?.dailyCalorieTarget ?? 2200;
  const proteinTarget = nutritionPlan?.proteinGrams ?? 160;
  const carbsTarget = nutritionPlan?.carbsGrams ?? 220;
  const fatTarget = nutritionPlan?.fatGrams ?? 70;
  const totals = useMemo(() => foodLogStorage.dayTotals(meals), [meals]);
  const remaining = Math.max(0, target - totals.calories);

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => {
      const matchesCategory =
        category === "all" || f.category === (category as FoodCategory);
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.brand?.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const results = useMemo(
    () => filteredFoods.slice(0, RESULT_CAP),
    [filteredFoods],
  );

  const scaledPreview = useMemo(() => {
    if (!logFoodTarget) return null;
    return scaleFood(logFoodTarget, servings);
  }, [logFoodTarget, servings]);

  function openLogModal(food: FoodItem) {
    setLogFoodTarget(food);
    setServings(1);
    setGramsInput(food.servingGrams ? String(food.servingGrams) : "");
  }

  function setServingsFromGrams(raw: string) {
    setGramsInput(raw);
    if (!logFoodTarget?.servingGrams) return;
    const g = Number(raw);
    if (!Number.isFinite(g) || g <= 0) return;
    setServings(Math.round((g / logFoodTarget.servingGrams) * 100) / 100);
  }

  function commitLog(
    food: FoodItem,
    mealType: (typeof MEAL_TYPES)[number] = activeMeal,
    amount = 1,
  ) {
    if (!user) return;
    const scaled = scaleFood(food, amount);
    foodLogStorage.add(user.id, mealType, scaled, selectedDate, amount);
    refresh();
    toast(
      t("toast.added", {
        name: food.name,
        meal: t(`meal.${mealType}`, { ns: "common" }),
      }),
      "success",
    );
    setTab("diary");
    setLogFoodTarget(null);
  }

  function logFood(
    food: FoodItem,
    mealType: (typeof MEAL_TYPES)[number] = activeMeal,
  ) {
    commitLog(food, mealType, 1);
  }

  function confirmLogWithQuantity() {
    if (!logFoodTarget) return;
    commitLog(logFoodTarget, activeMeal, servings);
  }

  function removeMeal(id: string) {
    if (!user) return;
    foodLogStorage.remove(user.id, id, selectedDate);
    refresh();
    toast(t("diary.removed"), "info");
  }

  function toggleFavorite(id: string) {
    if (!user) return;
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    foodLogStorage.setFavorites(user.id, next);
    setFavorites(next);
  }

  function saveCustom() {
    if (!custom.name || !custom.calories) {
      toast(t("toast.nameCaloriesRequired"), "error");
      return;
    }
    const food: FoodItem = {
      id: crypto.randomUUID(),
      name: custom.name,
      calories: Number(custom.calories),
      protein: Number(custom.protein || 0),
      carbs: Number(custom.carbs || 0),
      fat: Number(custom.fat || 0),
      serving: custom.serving || t("defaultServing"),
      category: "grocery",
    };
    commitLog(food, activeMeal, 1);
    setCustomOpen(false);
    setCustom({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      serving: "",
    });
  }

  if (!hydrated) {
    return <div className="evolve-shimmer h-40 rounded-apex-lg bg-muted-bg" />;
  }

  return (
    <ProGate feature={t("features.foodLogging", { ns: "common" })}>
      <div>
        <ExploreBackHeader title={t("title")} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              {t("kcalRemaining", { remaining, target })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isPro ? "primary" : "outline"}
              onClick={() => setBarcodeOpen(true)}
            >
              <Barcode size={16} />
              {t("scan")}
              {!isPro && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent-dim dark:text-accent">
                  <Crown size={10} />
                  {t("labels.pro", { ns: "common" })}
                </span>
              )}
            </Button>
            <Button
              onClick={() => {
                setTab("add");
                setCustomOpen(true);
              }}
            >
              <Plus size={16} />
              {t("customFood")}
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <SegmentedControl
            segments={[
              { id: "diary", label: t("tabs.diary") },
              { id: "add", label: t("tabs.add") },
              { id: "favorites", label: t("tabs.favorites") },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {/* Macro summary — always visible */}
        <Card className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold">
              {t("diary.daySummary")}
            </h2>
            <Badge>
              {totals.calories} / {target} {t("macros.kcal", { ns: "common" })}
            </Badge>
          </div>
          <div className="mt-4 space-y-3">
            <ProgressBar
              label={t("diary.calories")}
              value={Math.min(totals.calories, target)}
              max={target}
              showValue
            />
            <ProgressBar
              label={t("macros.proteinG", { ns: "common" })}
              value={Math.min(Math.round(totals.protein), proteinTarget)}
              max={proteinTarget}
              showValue
            />
            <ProgressBar
              label={t("macros.carbsG", { ns: "common" })}
              value={Math.min(Math.round(totals.carbs), carbsTarget)}
              max={carbsTarget}
              showValue
            />
            <ProgressBar
              label={t("macros.fatG", { ns: "common" })}
              value={Math.min(Math.round(totals.fat), fatTarget)}
              max={fatTarget}
              showValue
            />
          </div>
        </Card>

        {tab === "diary" && (
          <div className="mt-5 space-y-4">
            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                    selectedDate === d
                      ? "bg-foreground text-background"
                      : "bg-muted-bg text-muted"
                  }`}
                >
                  {formatDayLabel(d, foodLogStorage.todayKey(), (k) => t(k))}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">
                {t("todaysMeals")}
              </h2>
              <Button size="sm" variant="outline" onClick={() => setTab("add")}>
                <Plus size={14} />
                {t("diary.addFood")}
              </Button>
            </div>

            {meals.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={28} />}
                title={t("diary.emptyTitle")}
                description={t("diary.emptyHint")}
                action={
                  <Button onClick={() => setTab("add")}>
                    {t("diary.addFood")}
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {MEAL_TYPES.map((type) => {
                  const items = meals.filter((m) => m.mealType === type);
                  if (items.length === 0) return null;
                  const calories = items.reduce(
                    (s, m) => s + m.food.calories,
                    0,
                  );
                  return (
                    <Card key={type}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium capitalize">
                          {t(`meal.${type}`, { ns: "common" })}
                        </h3>
                        <Badge>
                          {calories} {t("macros.kcal", { ns: "common" })}
                        </Badge>
                      </div>
                      <ul className="mt-3 divide-y divide-border">
                        {items.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {m.food.name}
                              </p>
                              <p className="text-xs text-muted">
                                {m.food.brand ? `${m.food.brand} · ` : ""}
                                {t("foodMeta", {
                                  calories: m.food.calories,
                                  protein: m.food.protein,
                                  carbs: m.food.carbs,
                                  fat: m.food.fat,
                                  serving: m.food.serving,
                                })}
                                {foodExtras(m.food)}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-danger"
                              aria-label={t("diary.remove")}
                              onClick={() => removeMeal(m.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "add" && (
          <div className="mt-5 space-y-4">
            <button
              type="button"
              onClick={() => setBarcodeOpen(true)}
              className="w-full text-left"
            >
              <Card className="border-accent/30 bg-accent-soft/40 transition-colors hover:border-accent/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-semibold">
                      {t("proScanTitle")}
                    </p>
                    <p className="mt-1 text-xs text-muted">{t("proScanBody")}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-fg">
                    {isPro ? <Barcode size={14} /> : <Crown size={14} />}
                    {isPro ? t("scan") : t("tryProScan")}
                  </span>
                </div>
              </Card>
            </button>

            <Card>
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
                {FOOD_FILTER_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                      category === id
                        ? "bg-foreground text-background font-medium"
                        : "bg-muted-bg text-muted"
                    }`}
                  >
                    {t(FILTER_KEY[id])}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setActiveMeal(m)}
                    className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                      activeMeal === m
                        ? "bg-accent text-accent-fg font-medium"
                        : "bg-muted-bg text-muted"
                    }`}
                  >
                    {t("meal.logTo", {
                      ns: "common",
                      meal: t(`meal.${m}`, { ns: "common" }),
                    })}
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">
                {t("searchResults")}
              </h2>
              <p className="text-xs text-muted">
                {t("resultCount", {
                  shown: results.length,
                  total: filteredFoods.length,
                })}
              </p>
            </div>
            {results.length === 0 ? (
              <EmptyState
                icon={<Utensils size={28} />}
                title={t("emptyTitle")}
                description={t("emptyDescription")}
                action={
                  <Button onClick={() => setCustomOpen(true)}>
                    {t("createCustom")}
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {results.map((food) => (
                  <li key={food.id}>
                    <Card padding="sm" className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(food.id)}
                        className={
                          favorites.includes(food.id)
                            ? "text-accent-dim dark:text-accent"
                            : "text-muted"
                        }
                        aria-label={t("favorites")}
                      >
                        <Heart
                          size={18}
                          fill={
                            favorites.includes(food.id) ? "currentColor" : "none"
                          }
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {food.name}
                        </p>
                        <p className="text-xs text-muted">
                          {food.brand ? `${food.brand} · ` : ""}
                          {t("foodMeta", {
                            calories: food.calories,
                            protein: food.protein,
                            carbs: food.carbs,
                            fat: food.fat,
                            serving: food.serving,
                          })}
                          {foodExtras(food)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openLogModal(food)}
                      >
                        {t("log")}
                      </Button>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "favorites" && (
          <div className="mt-5">
            <h2 className="font-display text-lg font-semibold">
              {t("favorites")}
            </h2>
            {favorites.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={<Heart size={28} />}
                  title={t("diary.favEmpty")}
                  description={t("diary.favEmptyHint")}
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {FOODS.filter((f) => favorites.includes(f.id)).map((food) => (
                  <li key={food.id}>
                    <Card padding="sm" className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {food.name}
                        </p>
                        <p className="text-xs text-muted">
                          {food.brand ? `${food.brand} · ` : ""}
                          {food.calories} {t("macros.kcal", { ns: "common" })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFavorite(food.id)}
                        >
                          <Heart size={14} fill="currentColor" />
                        </Button>
                        <Button size="sm" onClick={() => openLogModal(food)}>
                          {t("log")}
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <BarcodeScanner
          open={barcodeOpen}
          isPro={Boolean(isPro)}
          mealType={activeMeal}
          remainingCalories={remaining}
          onClose={() => setBarcodeOpen(false)}
          onLog={(food, mealType) => logFood(food, mealType)}
          onMealTypeChange={setActiveMeal}
        />

        <Modal
          open={Boolean(logFoodTarget)}
          onClose={() => setLogFoodTarget(null)}
          title={t("quantity.title")}
          size="lg"
        >
          {logFoodTarget && scaledPreview && (
            <div className="space-y-4">
              <div>
                <p className="font-display text-base font-semibold">
                  {logFoodTarget.name}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {logFoodTarget.brand ? `${logFoodTarget.brand} · ` : ""}
                  {t("quantity.baseServing", { serving: logFoodTarget.serving })}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted">
                  {t("quantity.servings")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SERVING_PRESETS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setServings(s);
                        if (logFoodTarget.servingGrams) {
                          setGramsInput(
                            String(Math.round(logFoodTarget.servingGrams * s)),
                          );
                        }
                      }}
                      className={`rounded-full px-3 py-1.5 text-sm ${
                        servings === s
                          ? "bg-foreground text-background font-medium"
                          : "bg-muted-bg text-muted"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <Input
                    label={t("quantity.customServings")}
                    type="number"
                    min={0.01}
                    step={0.25}
                    value={String(servings)}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (!Number.isFinite(n) || n <= 0) return;
                      setServings(n);
                      if (logFoodTarget.servingGrams) {
                        setGramsInput(
                          String(Math.round(logFoodTarget.servingGrams * n)),
                        );
                      }
                    }}
                  />
                </div>
              </div>

              {logFoodTarget.servingGrams != null && (
                <Input
                  label={t("quantity.grams")}
                  type="number"
                  min={1}
                  value={gramsInput}
                  onChange={(e) => setServingsFromGrams(e.target.value)}
                />
              )}

              <Card padding="sm" className="bg-muted-bg/60">
                <p className="text-sm font-medium">{t("quantity.preview")}</p>
                <p className="mt-1 text-xs text-muted">
                  {t("foodMeta", {
                    calories: scaledPreview.calories,
                    protein: scaledPreview.protein,
                    carbs: scaledPreview.carbs,
                    fat: scaledPreview.fat,
                    serving: scaledPreview.serving,
                  })}
                  {foodExtras(scaledPreview)}
                </p>
              </Card>

              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setActiveMeal(m)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-sm capitalize ${
                      activeMeal === m
                        ? "bg-accent text-accent-fg font-medium"
                        : "bg-muted-bg text-muted"
                    }`}
                  >
                    {t(`meal.${m}`, { ns: "common" })}
                  </button>
                ))}
              </div>

              <Button fullWidth onClick={confirmLogWithQuantity}>
                {t("quantity.logAmount", {
                  calories: scaledPreview.calories,
                })}
              </Button>
            </div>
          )}
        </Modal>

        <Modal
          open={customOpen}
          onClose={() => setCustomOpen(false)}
          title={t("modal.createTitle")}
          size="lg"
        >
          <div className="space-y-3">
            <Input
              label={t("modal.name")}
              value={custom.name}
              onChange={(e) => setCustom({ ...custom, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("modal.calories")}
                type="number"
                value={custom.calories}
                onChange={(e) =>
                  setCustom({ ...custom, calories: e.target.value })
                }
              />
              <Input
                label={t("modal.serving")}
                value={custom.serving}
                onChange={(e) =>
                  setCustom({ ...custom, serving: e.target.value })
                }
              />
              <Input
                label={t("macros.proteinG", { ns: "common" })}
                type="number"
                value={custom.protein}
                onChange={(e) =>
                  setCustom({ ...custom, protein: e.target.value })
                }
              />
              <Input
                label={t("macros.carbsG", { ns: "common" })}
                type="number"
                value={custom.carbs}
                onChange={(e) => setCustom({ ...custom, carbs: e.target.value })}
              />
              <Input
                label={t("macros.fatG", { ns: "common" })}
                type="number"
                value={custom.fat}
                onChange={(e) => setCustom({ ...custom, fat: e.target.value })}
              />
            </div>
            <Button fullWidth onClick={saveCustom}>
              {t("modal.saveAndLog")}
            </Button>
          </div>
        </Modal>
      </div>
    </ProGate>
  );
}
