"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { messagesStorage } from "@/lib/storage/messages";
import type { DirectMessage, InboxThread } from "@/lib/types/messages";

interface MessagesContextValue {
  ready: boolean;
  tick: number;
  inbox: () => InboxThread[];
  messagesWith: (peerUserId: string) => DirectMessage[];
  send: (peerUserId: string, body: string) => DirectMessage | null;
  markRead: (peerUserId: string) => void;
  openThread: (peerUserId: string) => void;
  unreadTotal: () => number;
  refresh: () => void;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setReady(true);
  }, []);

  const value = useMemo<MessagesContextValue>(() => {
    void tick;
    const viewerId = user?.id;
    return {
      ready,
      tick,
      refresh,
      inbox: () => (viewerId ? messagesStorage.listInbox(viewerId) : []),
      messagesWith: (peerUserId) =>
        viewerId ? messagesStorage.getMessages(viewerId, peerUserId) : [],
      send: (peerUserId, body) => {
        if (!viewerId) return null;
        const msg = messagesStorage.sendMessage(viewerId, peerUserId, body);
        if (msg) refresh();
        return msg;
      },
      markRead: (peerUserId) => {
        if (!viewerId) return;
        messagesStorage.markRead(viewerId, peerUserId);
        refresh();
      },
      openThread: (peerUserId) => {
        if (!viewerId || peerUserId === viewerId) return;
        messagesStorage.ensureConversation(viewerId, peerUserId);
        refresh();
      },
      unreadTotal: () =>
        viewerId ? messagesStorage.unreadTotal(viewerId) : 0,
    };
  }, [tick, user?.id, ready, refresh]);

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
