import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";
import { resolveFeedMetricKeys } from "@/lib/services/feedMetrics";
import type { ActivityType } from "@/lib/services/feedMetrics";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

export const postsService = {
  async create(client: EvolveClient, row: PostInsert) {
    return client.from("posts").insert(row).select().single();
  },

  async getById(client: EvolveClient, id: string) {
    return client.from("posts").select("*").eq("id", id).maybeSingle();
  },

  async listRecent(client: EvolveClient, limit = 20) {
    return client
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
  },

  async setFeedMetrics(
    client: EvolveClient,
    postId: string,
    metricKeys: string[],
  ) {
    const keys = metricKeys.slice(0, 4);
    await client.from("post_metric_visibility").delete().eq("post_id", postId);
    if (keys.length === 0) return { error: null };
    return client.from("post_metric_visibility").insert(
      keys.map((metric_key, display_order) => ({
        post_id: postId,
        metric_key,
        display_order,
      })),
    );
  },

  async getFeedMetricKeys(
    client: EvolveClient,
    postId: string,
    activityType?: ActivityType | null,
  ) {
    const { data } = await client
      .from("post_metric_visibility")
      .select("metric_key, display_order")
      .eq("post_id", postId)
      .order("display_order", { ascending: true });

    const selected = (data ?? []).map((r) => r.metric_key);
    return resolveFeedMetricKeys(activityType, selected);
  },

  async delete(client: EvolveClient, id: string) {
    return client.from("posts").delete().eq("id", id);
  },
};
