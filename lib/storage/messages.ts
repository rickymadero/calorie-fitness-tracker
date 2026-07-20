import type {
  Conversation,
  DirectMessage,
  InboxThread,
  MessagesStore,
} from "@/lib/types/messages";

const KEY = "evolve.messages";

function canUse() {
  return typeof window !== "undefined";
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function conversationIdFor(a: string, b: string) {
  return [a, b].sort().join("__");
}

function emptyStore(): MessagesStore {
  return { conversations: [], messages: [] };
}

function read(): MessagesStore {
  if (!canUse()) return emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = emptyStore();
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as MessagesStore;
    if (!Array.isArray(parsed.conversations)) parsed.conversations = [];
    if (!Array.isArray(parsed.messages)) parsed.messages = [];
    return parsed;
  } catch {
    return emptyStore();
  }
}

function write(store: MessagesStore) {
  if (!canUse()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch (err) {
    console.error("evolve.messages: write failed", err);
  }
}

function peerOf(convo: Conversation, viewerId: string) {
  return convo.participantIds[0] === viewerId
    ? convo.participantIds[1]
    : convo.participantIds[0];
}

/** Seed a couple of welcome DMs the first time this viewer opens Messages. */
function ensureWelcomeThreads(store: MessagesStore, viewerId: string) {
  const seeds = [
    {
      peerId: "seed-maya",
      body: "Hey! Saw you’re on Evolve — welcome. Let’s crush some miles 💪",
      hoursAgo: 5,
    },
    {
      peerId: "seed-jordan",
      body: "Nice work getting started. Hit me up if you want a lift session.",
      hoursAgo: 26,
    },
  ] as const;

  let changed = false;
  for (const seed of seeds) {
    if (seed.peerId === viewerId) continue;
    const cid = conversationIdFor(viewerId, seed.peerId);
    if (store.conversations.some((c) => c.id === cid)) continue;

    const createdAt = new Date(
      Date.now() - seed.hoursAgo * 60 * 60 * 1000,
    ).toISOString();

    store.conversations.push({
      id: cid,
      participantIds: [viewerId, seed.peerId].sort() as [string, string],
      updatedAt: createdAt,
    });
    store.messages.push({
      id: uid("msg"),
      conversationId: cid,
      senderId: seed.peerId,
      body: seed.body,
      createdAt,
    });
    changed = true;
  }
  return changed;
}

export const messagesStorage = {
  conversationIdFor,

  listInbox(viewerId: string): InboxThread[] {
    const store = read();
    if (ensureWelcomeThreads(store, viewerId)) write(store);

    return store.conversations
      .filter((c) => c.participantIds.includes(viewerId))
      .map((c) => {
        const msgs = store.messages
          .filter((m) => m.conversationId === c.id)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );
        const last = msgs[msgs.length - 1] ?? null;
        const unreadCount = msgs.filter(
          (m) => m.senderId !== viewerId && !m.readAt,
        ).length;
        return {
          conversationId: c.id,
          peerUserId: peerOf(c, viewerId),
          lastMessage: last,
          unreadCount,
          updatedAt: c.updatedAt,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  },

  getMessages(viewerId: string, peerUserId: string): DirectMessage[] {
    const store = read();
    if (viewerId === peerUserId) return [];
    const cid = conversationIdFor(viewerId, peerUserId);
    return store.messages
      .filter((m) => m.conversationId === cid)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  },

  ensureConversation(viewerId: string, peerUserId: string): Conversation {
    const store = read();
    const cid = conversationIdFor(viewerId, peerUserId);
    let convo = store.conversations.find((c) => c.id === cid);
    if (!convo) {
      convo = {
        id: cid,
        participantIds: [viewerId, peerUserId].sort() as [string, string],
        updatedAt: new Date().toISOString(),
      };
      store.conversations.push(convo);
      write(store);
    }
    return convo;
  },

  sendMessage(
    senderId: string,
    peerUserId: string,
    body: string,
  ): DirectMessage | null {
    const text = body.trim();
    if (!text || senderId === peerUserId) return null;
    const store = read();
    const cid = conversationIdFor(senderId, peerUserId);
    let convo = store.conversations.find((c) => c.id === cid);
    const now = new Date().toISOString();
    if (!convo) {
      convo = {
        id: cid,
        participantIds: [senderId, peerUserId].sort() as [string, string],
        updatedAt: now,
      };
      store.conversations.push(convo);
    } else {
      convo.updatedAt = now;
    }
    const msg: DirectMessage = {
      id: uid("msg"),
      conversationId: cid,
      senderId,
      body: text.slice(0, 2000),
      createdAt: now,
    };
    store.messages.push(msg);
    write(store);
    return msg;
  },

  markRead(viewerId: string, peerUserId: string) {
    const store = read();
    const cid = conversationIdFor(viewerId, peerUserId);
    let changed = false;
    const now = new Date().toISOString();
    for (const m of store.messages) {
      if (
        m.conversationId === cid &&
        m.senderId !== viewerId &&
        !m.readAt
      ) {
        m.readAt = now;
        changed = true;
      }
    }
    if (changed) write(store);
  },

  unreadTotal(viewerId: string): number {
    return this.listInbox(viewerId).reduce((n, t) => n + t.unreadCount, 0);
  },
};
