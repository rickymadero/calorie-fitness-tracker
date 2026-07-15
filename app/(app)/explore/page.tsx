"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { Search, UserSearch } from "lucide-react";
import { FeedList, FeedSkeleton } from "@/components/feed/FeedComponents";
import { PersonCard } from "@/components/social/PersonCard";
import { usePosts } from "@/components/posts/PostsProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";

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
      <PageHeader
        title="Explore"
        subtitle="Public workouts and athletes to follow."
        sticky
      />

      <div className="mt-4">
        <SegmentedControl
          segments={[
            { id: "posts", label: "Workouts" },
            { id: "people", label: "People" },
          ]}
          value={tab}
          onChange={setTab}
        />
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

      <div className="mt-5">
        {tab === "posts" ? (
          <FeedList
            posts={posts}
            emptyTitle="No public posts yet"
            emptyHint="Be the first to share a workout."
          />
        ) : (
          <div className="grid gap-3">
            {people.length === 0 ? (
              <EmptyState
                icon={<UserSearch size={28} />}
                title={deferred ? "No athletes found" : "No suggestions yet"}
                description={
                  deferred
                    ? "Try a different name or username."
                    : "Check back as more athletes join Evolve."
                }
              />
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
