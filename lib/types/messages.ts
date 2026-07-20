/** Direct messages between athletes (demo / localStorage). */

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  /** When the recipient read it */
  readAt?: string;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  updatedAt: string;
}

export interface MessagesStore {
  conversations: Conversation[];
  messages: DirectMessage[];
}

export interface InboxThread {
  conversationId: string;
  peerUserId: string;
  lastMessage: DirectMessage | null;
  unreadCount: number;
  updatedAt: string;
}
