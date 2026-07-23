import type { ActivityRow } from "@/lib/services/activities";

export type WeekDayStat = {
  key: string;
  label: string;
  workouts: number;
  minutes: number;
  distanceKm: number;
  calories: number;
};

export type WeekStats = {
  days: WeekDayStat[];
  totals: {
    workouts: number;
    minutes: number;
    distanceKm: number;
    calories: number;
  };
};

export type AuthorActivityStats = {
  workoutsThisMonth: number;
  totalWorkouts: number;
  totalKm: number;
  streakDays: number;
};

function dayKey(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function weekStatsFromActivities(rows: ActivityRow[]): WeekStats {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const days: WeekDayStat[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      workouts: 0,
      minutes: 0,
      distanceKm: 0,
      calories: 0,
    });
  }

  const byKey = new Map(days.map((d) => [d.key, d]));

  for (const a of rows) {
    const key = dayKey(a.started_at ?? a.created_at);
    if (!key) continue;
    const bucket = byKey.get(key);
    if (!bucket) continue;
    bucket.workouts += 1;
    bucket.minutes += Math.round((a.duration_seconds ?? 0) / 60);
    bucket.distanceKm += (a.distance_meters ?? 0) / 1000;
    bucket.calories += a.calories ?? 0;
  }

  const totals = days.reduce(
    (acc, d) => ({
      workouts: acc.workouts + d.workouts,
      minutes: acc.minutes + d.minutes,
      distanceKm: acc.distanceKm + d.distanceKm,
      calories: acc.calories + d.calories,
    }),
    { workouts: 0, minutes: 0, distanceKm: 0, calories: 0 },
  );

  return {
    days: days.map((d) => ({
      ...d,
      distanceKm: Math.round(d.distanceKm * 10) / 10,
    })),
    totals: {
      ...totals,
      distanceKm: Math.round(totals.distanceKm * 10) / 10,
    },
  };
}

export function authorStatsFromActivities(
  rows: ActivityRow[],
): AuthorActivityStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = rows.filter((a) => {
    const t = Date.parse(a.started_at ?? a.created_at);
    return !Number.isNaN(t) && t >= monthStart.getTime();
  });
  const totalKm = rows.reduce(
    (s, a) => s + (a.distance_meters ?? 0) / 1000,
    0,
  );

  const days = new Set<string>();
  for (const a of rows) {
    const key = dayKey(a.started_at ?? a.created_at);
    if (key) days.add(key);
  }
  const sorted = [...days].sort().reverse();
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!sorted.includes(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    workoutsThisMonth: thisMonth.length,
    totalWorkouts: rows.length,
    totalKm: Math.round(totalKm * 10) / 10,
    streakDays: streak,
  };
}
