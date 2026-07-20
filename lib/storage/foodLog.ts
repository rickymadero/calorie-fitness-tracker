/** Persist daily food logs per user (demo localStorage). */

import type { FoodItem, LoggedMeal } from "@/lib/types";

const KEY = "evolve.food.logs.v1";
const FAV_KEY = "evolve.food.favorites.v1";

type DayMap = Record<string, LoggedMeal[]>; // date YYYY-MM-DD -> meals
type Store = Record<string, DayMap>; // userId -> days

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore quota */
  }
}

function readFavs(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, string[]>;
    return all[userId] ?? [];
  } catch {
    return [];
  }
}

function writeFavs(userId: string, ids: string[]) {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    all[userId] = ids;
    localStorage.setItem(FAV_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export const foodLogStorage = {
  todayKey,

  listDay(userId: string, date = todayKey()): LoggedMeal[] {
    const store = readStore();
    return store[userId]?.[date] ?? [];
  },

  /** Recent dates that have at least one log, newest first (includes today even if empty). */
  listDates(userId: string, limit = 14): string[] {
    const store = readStore();
    const days = store[userId] ?? {};
    const keys = Object.keys(days)
      .filter((k) => (days[k]?.length ?? 0) > 0)
      .sort((a, b) => (a < b ? 1 : -1));
    const today = todayKey();
    if (!keys.includes(today)) keys.unshift(today);
    return keys.slice(0, limit);
  },

  add(
    userId: string,
    mealType: LoggedMeal["mealType"],
    food: FoodItem,
    date = todayKey(),
    servings = 1,
  ): LoggedMeal {
    const entry: LoggedMeal = {
      id: crypto.randomUUID(),
      mealType,
      food,
      loggedAt: new Date().toISOString(),
      servings,
    };
    const store = readStore();
    if (!store[userId]) store[userId] = {};
    if (!store[userId][date]) store[userId][date] = [];
    store[userId][date] = [...store[userId][date], entry];
    writeStore(store);
    return entry;
  },

  remove(userId: string, mealId: string, date = todayKey()): boolean {
    const store = readStore();
    const list = store[userId]?.[date];
    if (!list) return false;
    const next = list.filter((m) => m.id !== mealId);
    if (next.length === list.length) return false;
    store[userId][date] = next;
    writeStore(store);
    return true;
  },

  clearDay(userId: string, date = todayKey()) {
    const store = readStore();
    if (!store[userId]) return;
    store[userId][date] = [];
    writeStore(store);
  },

  getFavorites(userId: string) {
    return readFavs(userId);
  },

  setFavorites(userId: string, ids: string[]) {
    writeFavs(userId, ids);
  },

  dayTotals(meals: LoggedMeal[]) {
    return meals.reduce(
      (acc, m) => {
        acc.calories += m.food.calories;
        acc.protein += m.food.protein;
        acc.carbs += m.food.carbs;
        acc.fat += m.food.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  },
};
