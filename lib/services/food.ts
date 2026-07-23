import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";

type FoodInsert = Database["public"]["Tables"]["food_logs"]["Insert"];

export const foodService = {
  async log(client: EvolveClient, row: FoodInsert) {
    return client.from("food_logs").insert(row).select().single();
  },

  async listForUser(client: EvolveClient, userId: string, limit = 50) {
    return client
      .from("food_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(limit);
  },

  async delete(client: EvolveClient, id: string) {
    return client.from("food_logs").delete().eq("id", id);
  },
};
