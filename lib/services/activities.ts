import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";

type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"];
type MetricInsert = Database["public"]["Tables"]["activity_metrics"]["Insert"];

export const activitiesService = {
  async create(client: EvolveClient, row: ActivityInsert) {
    return client.from("activities").insert(row).select().single();
  },

  async getById(client: EvolveClient, id: string) {
    return client.from("activities").select("*").eq("id", id).maybeSingle();
  },

  async listForUser(client: EvolveClient, userId: string, limit = 20) {
    return client
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
  },

  async addMetric(client: EvolveClient, row: MetricInsert) {
    return client.from("activity_metrics").insert(row).select().single();
  },

  async listMetrics(client: EvolveClient, activityId: string) {
    return client
      .from("activity_metrics")
      .select("*")
      .eq("activity_id", activityId)
      .order("created_at", { ascending: true });
  },

  async delete(client: EvolveClient, id: string) {
    return client.from("activities").delete().eq("id", id);
  },
};
