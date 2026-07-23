import type { EvolveClient } from "@/lib/services/auth";
import type { Database } from "@/lib/supabase/database.types";

type FollowStatus = Database["public"]["Enums"]["follow_status"];

export const socialService = {
  async follow(
    client: EvolveClient,
    followerId: string,
    followingId: string,
    status: FollowStatus = "pending",
  ) {
    return client
      .from("follows")
      .insert({
        follower_id: followerId,
        following_id: followingId,
        status,
      })
      .select()
      .single();
  },

  async setFollowStatus(
    client: EvolveClient,
    followerId: string,
    followingId: string,
    status: FollowStatus,
  ) {
    return client
      .from("follows")
      .update({ status })
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .select()
      .single();
  },

  async like(client: EvolveClient, userId: string, postId: string) {
    return client
      .from("likes")
      .insert({ user_id: userId, post_id: postId })
      .select()
      .single();
  },

  async unlike(client: EvolveClient, userId: string, postId: string) {
    return client
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
  },

  async comment(
    client: EvolveClient,
    input: {
      postId: string;
      userId: string;
      body: string;
      parentCommentId?: string;
    },
  ) {
    return client
      .from("comments")
      .insert({
        post_id: input.postId,
        user_id: input.userId,
        body: input.body,
        parent_comment_id: input.parentCommentId ?? null,
      })
      .select()
      .single();
  },
};
