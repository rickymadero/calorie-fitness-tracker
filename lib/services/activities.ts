import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";
import type {
  ActivityInsertPayload,
  ActivityMetricInput,
  ActivitySplitInput,
  HeartRateZoneInput,
  RoutePointInput,
} from "@/lib/activities/mapLocalToSupabase";

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
type ActivityUpdate = Database["public"]["Tables"]["activities"]["Update"];
type MetricRow = Database["public"]["Tables"]["activity_metrics"]["Row"];
type SplitRow = Database["public"]["Tables"]["activity_splits"]["Row"];
type ZoneRow = Database["public"]["Tables"]["heart_rate_zones"]["Row"];
type RouteRow = Database["public"]["Tables"]["route_points"]["Row"];

export type {
  ActivityRow,
  MetricRow,
  SplitRow,
  ZoneRow,
  RouteRow,
};

export type CreateActivityWithMetricsInput = {
  activity: ActivityInsertPayload;
  metrics?: ActivityMetricInput[];
  splits?: ActivitySplitInput[];
  heartRateZones?: HeartRateZoneInput[];
  routePoints?: RoutePointInput[];
};

export type ActivityDetail = {
  activity: ActivityRow;
  metrics: MetricRow[];
  splits: SplitRow[];
  heartRateZones: ZoneRow[];
  routePoints: RouteRow[];
};

const ROUTE_BATCH = 200;

function validateActivityInsert(row: ActivityInsertPayload): string | null {
  if (!row.user_id) return "user_id is required.";
  if (!row.title?.trim()) return "title is required.";
  if (row.duration_seconds != null && row.duration_seconds < 0) {
    return "duration_seconds cannot be negative.";
  }
  if (row.distance_meters != null && row.distance_meters < 0) {
    return "distance_meters cannot be negative.";
  }
  if (row.calories != null && row.calories < 0) {
    return "calories cannot be negative.";
  }
  if (row.average_heart_rate != null && row.average_heart_rate < 0) {
    return "average_heart_rate cannot be negative.";
  }
  if (row.maximum_heart_rate != null && row.maximum_heart_rate < 0) {
    return "maximum_heart_rate cannot be negative.";
  }
  if (row.elevation_gain_meters != null && row.elevation_gain_meters < 0) {
    return "elevation_gain_meters cannot be negative.";
  }
  return null;
}

export const activitiesService = {
  async createActivity(client: EvolveClient, row: ActivityInsertPayload) {
    const invalid = validateActivityInsert(row);
    if (invalid) {
      return { data: null, error: { message: invalid } };
    }
    return client.from("activities").insert(row).select("*").single();
  },

  async getActivityById(client: EvolveClient, id: string) {
    return client.from("activities").select("*").eq("id", id).maybeSingle();
  },

  /** @deprecated Prefer getActivityById */
  async getById(client: EvolveClient, id: string) {
    return this.getActivityById(client, id);
  },

  async getByExternalId(
    client: EvolveClient,
    userId: string,
    source: Database["public"]["Enums"]["activity_source"],
    externalActivityId: string,
  ) {
    return client
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .eq("source", source)
      .eq("external_activity_id", externalActivityId)
      .maybeSingle();
  },

  async getCurrentUserActivities(
    client: EvolveClient,
    userId: string,
    opts?: { limit?: number; offset?: number },
  ) {
    const limit = opts?.limit ?? 20;
    const offset = opts?.offset ?? 0;
    return client
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
  },

  /** @deprecated Prefer getCurrentUserActivities */
  async listForUser(client: EvolveClient, userId: string, limit = 20) {
    return this.getCurrentUserActivities(client, userId, { limit, offset: 0 });
  },

  async updateActivity(
    client: EvolveClient,
    userId: string,
    activityId: string,
    patch: Omit<ActivityUpdate, "id" | "user_id">,
  ) {
    const { id: _id, user_id: _uid, ...safe } = patch as ActivityUpdate;
    void _id;
    void _uid;
    return client
      .from("activities")
      .update(safe)
      .eq("id", activityId)
      .eq("user_id", userId)
      .select("*")
      .single();
  },

  async updateActivityVisibility(
    client: EvolveClient,
    userId: string,
    activityId: string,
    visibility: Database["public"]["Enums"]["visibility_level"],
  ) {
    return this.updateActivity(client, userId, activityId, { visibility });
  },

  async deleteActivity(client: EvolveClient, userId: string, activityId: string) {
    return client
      .from("activities")
      .delete()
      .eq("id", activityId)
      .eq("user_id", userId);
  },

  /** @deprecated Prefer deleteActivity with userId */
  async delete(client: EvolveClient, id: string) {
    return client.from("activities").delete().eq("id", id);
  },

  async getActivityMetrics(client: EvolveClient, activityId: string) {
    return client
      .from("activity_metrics")
      .select("*")
      .eq("activity_id", activityId)
      .order("created_at", { ascending: true });
  },

  async listMetrics(client: EvolveClient, activityId: string) {
    return this.getActivityMetrics(client, activityId);
  },

  async getActivitySplits(client: EvolveClient, activityId: string) {
    return client
      .from("activity_splits")
      .select("*")
      .eq("activity_id", activityId)
      .order("split_index", { ascending: true });
  },

  async getHeartRateZones(client: EvolveClient, activityId: string) {
    return client
      .from("heart_rate_zones")
      .select("*")
      .eq("activity_id", activityId)
      .order("zone_number", { ascending: true });
  },

  async getRoutePoints(client: EvolveClient, activityId: string) {
    return client
      .from("route_points")
      .select("*")
      .eq("activity_id", activityId)
      .order("sequence_number", { ascending: true });
  },

  async addMetric(
    client: EvolveClient,
    row: Database["public"]["Tables"]["activity_metrics"]["Insert"],
  ) {
    return client.from("activity_metrics").insert(row).select("*").single();
  },

  async create(
    client: EvolveClient,
    row: Database["public"]["Tables"]["activities"]["Insert"],
  ) {
    return this.createActivity(client, row as ActivityInsertPayload);
  },

  /**
   * Insert activity then related rows. On child failure, deletes the activity
   * (cascades) so callers never keep a partial graph.
   */
  async createActivityWithMetrics(
    client: EvolveClient,
    input: CreateActivityWithMetricsInput,
  ): Promise<{
    data: ActivityDetail | null;
    error: { message: string } | null;
  }> {
    const { data: activity, error: createError } = await this.createActivity(
      client,
      input.activity,
    );
    if (createError || !activity) {
      return {
        data: null,
        error: { message: createError?.message || "Failed to create activity." },
      };
    }

    const activityId = activity.id;

    try {
      const metrics = input.metrics ?? [];
      if (metrics.length) {
        const rows = metrics.map((m) => ({
          activity_id: activityId,
          metric_key: m.metric_key,
          label: m.label,
          numeric_value: m.numeric_value ?? null,
          text_value: m.text_value ?? null,
          unit: m.unit ?? null,
          category: m.category ?? ("basic" as const),
          source: m.source ?? ("manual" as const),
        }));
        const { error } = await client.from("activity_metrics").insert(rows);
        if (error) throw new Error(error.message);
      }

      const splits = input.splits ?? [];
      if (splits.length) {
        const rows = splits.map((s) => ({
          activity_id: activityId,
          split_index: s.split_index,
          distance_meters: s.distance_meters ?? null,
          duration_seconds: s.duration_seconds ?? null,
          pace_seconds_per_km: s.pace_seconds_per_km ?? null,
          average_heart_rate: s.average_heart_rate ?? null,
          elevation_change_meters: s.elevation_change_meters ?? null,
        }));
        const { error } = await client.from("activity_splits").insert(rows);
        if (error) throw new Error(error.message);
      }

      const zones = input.heartRateZones ?? [];
      if (zones.length) {
        const rows = zones.map((z) => ({
          activity_id: activityId,
          zone_number: z.zone_number,
          minimum_bpm: z.minimum_bpm ?? null,
          maximum_bpm: z.maximum_bpm ?? null,
          duration_seconds: z.duration_seconds ?? null,
          percentage: z.percentage ?? null,
        }));
        const { error } = await client.from("heart_rate_zones").insert(rows);
        if (error) throw new Error(error.message);
      }

      const points = input.routePoints ?? [];
      for (let i = 0; i < points.length; i += ROUTE_BATCH) {
        const chunk = points.slice(i, i + ROUTE_BATCH).map((p) => ({
          activity_id: activityId,
          sequence_number: p.sequence_number,
          latitude: p.latitude,
          longitude: p.longitude,
          elevation_meters: p.elevation_meters ?? null,
          recorded_at: p.recorded_at ?? null,
        }));
        const { error } = await client.from("route_points").insert(chunk);
        if (error) throw new Error(error.message);
      }

      const [metricsRes, splitsRes, zonesRes] = await Promise.all([
        this.getActivityMetrics(client, activityId),
        this.getActivitySplits(client, activityId),
        this.getHeartRateZones(client, activityId),
      ]);

      return {
        data: {
          activity,
          metrics: metricsRes.data ?? [],
          splits: splitsRes.data ?? [],
          heartRateZones: zonesRes.data ?? [],
          // Skip full route reload on create — expensive; empty is fine for callers.
          routePoints: [],
        },
        error: null,
      };
    } catch (err) {
      await client.from("activities").delete().eq("id", activityId);
      const message =
        err instanceof Error ? err.message : "Failed to save activity details.";
      return { data: null, error: { message } };
    }
  },

  async getActivityDetail(
    client: EvolveClient,
    activityId: string,
    opts?: { includeRoute?: boolean },
  ): Promise<{
    data: ActivityDetail | null;
    error: { message: string } | null;
  }> {
    const { data: activity, error } = await this.getActivityById(
      client,
      activityId,
    );
    if (error || !activity) {
      return {
        data: null,
        error: { message: error?.message || "Activity not found." },
      };
    }

    const includeRoute = opts?.includeRoute !== false;
    const [metricsRes, splitsRes, zonesRes, routeRes] = await Promise.all([
      this.getActivityMetrics(client, activityId),
      this.getActivitySplits(client, activityId),
      this.getHeartRateZones(client, activityId),
      includeRoute
        ? this.getRoutePoints(client, activityId)
        : Promise.resolve({ data: [] as RouteRow[], error: null }),
    ]);

    return {
      data: {
        activity,
        metrics: metricsRes.data ?? [],
        splits: splitsRes.data ?? [],
        heartRateZones: zonesRes.data ?? [],
        routePoints: routeRes.data ?? [],
      },
      error: null,
    };
  },
};
