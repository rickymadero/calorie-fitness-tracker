import type { EvolveClient } from "@/lib/services/auth";

export const messagingService = {
  async createConversation(client: EvolveClient, memberIds: string[]) {
    const { data: conversation, error } = await client
      .from("conversations")
      .insert({})
      .select()
      .single();
    if (error || !conversation) return { data: null, error };

    const { error: memberError } = await client
      .from("conversation_members")
      .insert(
        memberIds.map((user_id) => ({
          conversation_id: conversation.id,
          user_id,
        })),
      );
    if (memberError) return { data: null, error: memberError };
    return { data: conversation, error: null };
  },

  async sendMessage(
    client: EvolveClient,
    input: {
      conversationId: string;
      senderId: string;
      body: string;
    },
  ) {
    return client
      .from("messages")
      .insert({
        conversation_id: input.conversationId,
        sender_id: input.senderId,
        body: input.body,
      })
      .select()
      .single();
  },

  async listMessages(client: EvolveClient, conversationId: string) {
    return client
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
  },
};
