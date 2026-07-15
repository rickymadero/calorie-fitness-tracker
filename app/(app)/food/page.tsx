"use client";

import { useMemo, useState } from "react";
import { Barcode, Crown, Heart, Plus, Search, Utensils } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarcodeScanner } from "@/components/food/BarcodeScanner";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { FOODS, SAMPLE_MEALS } from "@/lib/mock/data";
import type { FoodItem, LoggedMeal } from "@/lib/types";
import { ProGate } from "@/components/pro/ProGate";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
const FOOD_FILTERS = [
  { id: "all", label: "All" },
  { id: "fast-food", label: "Fast food" },
  { id: "restaurant", label: "Restaurant" },
  { id: "grocery", label: "Grocery" },
  { id: "snack", label: "Snacks" },
  { id: "drink", label: "Drinks" },
] as const;

export default function FoodPage() {
  const { nutritionPlan, user } = useAuth();
  const { toast } = useToast();
  const isPro = user?.plan === "pro";
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof FOOD_FILTERS)[number]["id"]>("all");
  const [meals, setMeals] = useState<LoggedMeal[]>(SAMPLE_MEALS);
  const [favorites, setFavorites] = useState<string[]>([
    "ff12",
    "ff6",
    "ff20",
    "ff1",
    "f2",
  ]);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<(typeof MEAL_TYPES)[number]>("lunch");
  const [custom, setCustom] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    serving: "1 serving",
  });

  const target = nutritionPlan?.dailyCalorieTarget ?? 2200;
  const consumed = meals.reduce((sum, m) => sum + m.food.calories, 0);
  const remaining = Math.max(0, target - consumed);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => {
      const matchesCategory = category === "all" || f.category === category;
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.brand?.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  function logFood(
    food: FoodItem,
    mealType: (typeof MEAL_TYPES)[number] = activeMeal,
  ) {
    const entry: LoggedMeal = {
      id: crypto.randomUUID(),
      mealType,
      food,
      loggedAt: new Date().toISOString(),
    };
    setMeals((prev) => [...prev, entry]);
    toast(`Added ${food.name} to ${mealType}.`, "success");
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }

  function saveCustom() {
    if (!custom.name || !custom.calories) {
      toast("Name and calories are required.", "error");
      return;
    }
    const food: FoodItem = {
      id: crypto.randomUUID(),
      name: custom.name,
      calories: Number(custom.calories),
      protein: Number(custom.protein || 0),
      carbs: Number(custom.carbs || 0),
      fat: Number(custom.fat || 0),
      serving: custom.serving,
    };
    logFood(food);
    setCustomOpen(false);
    setCustom({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      serving: "1 serving",
    });
  }

  return (
    <ProGate feature="Food logging & macros">
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Food
          </h1>
          <p className="mt-1 text-sm text-muted">
            {remaining} kcal remaining of {target}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isPro ? "primary" : "outline"}
            onClick={() => setBarcodeOpen(true)}
          >
            <Barcode size={16} />
            Scan
            {!isPro && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent-dim dark:text-accent">
                <Crown size={10} />
                Pro
              </span>
            )}
          </Button>
          <Button onClick={() => setCustomOpen(true)}>
            <Plus size={16} />
            Custom food
          </Button>
        </div>
      </div>

      {!isPro && (
        <Card className="mt-4 border-accent/30 bg-accent-soft/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-semibold">
                Pro barcode scanner
              </p>
              <p className="mt-1 text-xs text-muted">
                Scan packaged foods instantly with live camera detection, serving
                controls, and scan history.
              </p>
            </div>
            <Button size="sm" onClick={() => setBarcodeOpen(true)}>
              <Crown size={14} />
              Try Pro scan
            </Button>
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Chipotle, pizza, burgers..."
            className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
          {FOOD_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setCategory(f.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                category === f.id
                  ? "bg-foreground text-background font-medium"
                  : "bg-muted-bg text-muted"
              }`}
            >
              {f.label}
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
              Log to {m}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold">Search results</h2>
          {results.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<Utensils size={28} />}
                title="No foods found"
                description="Try another search or create a custom food."
                action={
                  <Button onClick={() => setCustomOpen(true)}>Create custom</Button>
                }
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
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
                      aria-label="Favorite"
                    >
                      <Heart
                        size={18}
                        fill={favorites.includes(food.id) ? "currentColor" : "none"}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{food.name}</p>
                      <p className="text-xs text-muted">
                        {food.brand ? `${food.brand} · ` : ""}
                        {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F{" "}
                        {food.fat}g · {food.serving}
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => logFood(food)}>
                      Log
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">Today&apos;s meals</h2>
          <div className="mt-4 space-y-4">
            {MEAL_TYPES.map((type) => {
              const items = meals.filter((m) => m.mealType === type);
              const calories = items.reduce((s, m) => s + m.food.calories, 0);
              return (
                <Card key={type}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium capitalize">{type}</h3>
                    <Badge>{calories} kcal</Badge>
                  </div>
                  {items.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No foods logged yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {items.map((m) => (
                        <li key={m.id} className="flex justify-between text-sm">
                          <span>{m.food.name}</span>
                          <span className="text-muted">{m.food.calories} kcal</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>

          <Card className="mt-4">
            <h3 className="font-medium">Favorites</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {FOODS.filter((f) => favorites.includes(f.id)).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => logFood(f)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-accent/50"
                >
                  {f.brand ? `${f.brand}: ` : ""}
                  {f.name}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <BarcodeScanner
        open={barcodeOpen}
        isPro={Boolean(isPro)}
        mealType={activeMeal}
        remainingCalories={remaining}
        onClose={() => setBarcodeOpen(false)}
        onLog={(food, mealType) => logFood(food, mealType)}
      />

      <Modal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Create custom food"
        size="lg"
      >
        <div className="space-y-3">
          <Input
            label="Name"
            value={custom.name}
            onChange={(e) => setCustom({ ...custom, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Calories"
              type="number"
              value={custom.calories}
              onChange={(e) => setCustom({ ...custom, calories: e.target.value })}
            />
            <Input
              label="Serving"
              value={custom.serving}
              onChange={(e) => setCustom({ ...custom, serving: e.target.value })}
            />
            <Input
              label="Protein (g)"
              type="number"
              value={custom.protein}
              onChange={(e) => setCustom({ ...custom, protein: e.target.value })}
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={custom.carbs}
              onChange={(e) => setCustom({ ...custom, carbs: e.target.value })}
            />
            <Input
              label="Fat (g)"
              type="number"
              value={custom.fat}
              onChange={(e) => setCustom({ ...custom, fat: e.target.value })}
            />
          </div>
          <Button fullWidth onClick={saveCustom}>
            Save & log
          </Button>
        </div>
      </Modal>
    </div>
    </ProGate>
  );
}
