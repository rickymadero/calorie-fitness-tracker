"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { Search } from "lucide-react";
import { FeedList, FeedSkeleton } from "@/components/feed/FeedComponents";
import { PersonCard } from "@/components/social/PersonCard";
import { usePosts } from "@/components/posts/PostsProvider";
import { useSocial } from "@/components/social/SocialProvider";

export default function ExplorePage() {
  const { tick, publicFeed } = usePosts();
  const { ready, searchPeople, suggestedPeople } = useSocial();
  const [tab, setTab] = useState<"posts" | "people">("posts");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim());

  const posts = useMemo(() => {
    void tick;
    return publicFeed();
  }, [tick, publicFeed]);

  const people = useMemo(() => {
    if (deferred) return searchPeople(deferred);
    return suggestedPeople();
  }, [deferred, searchPeople, suggestedPeople]);

  if (!ready) return <FeedSkeleton />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        Explore
      </h1>
      <p className="mt-1 text-sm text-muted">
        Public workouts and athletes to follow.
      </p>

      <div className="mt-6 flex gap-2">
        {(
          [
            { id: "posts", label: "Workouts" },
            { id: "people", label: "People" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "bg-accent text-accent-fg"
                : "bg-muted-bg text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "people" && (
        <div className="relative mt-4">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username…"
            className="h-12 w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      )}

      <div className="mt-6">
        {tab === "posts" ? (
          <FeedList
            posts={posts}
            emptyTitle="No public posts yet"
            emptyHint="Be the first to share a workout."
          />
        ) : (
          <div className="grid gap-3">
            {people.length === 0 ? (
              <p className="text-sm text-muted">No people found.</p>
            ) : (
              people.map((card) => (
                <PersonCard key={card.profile.userId} card={card} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
