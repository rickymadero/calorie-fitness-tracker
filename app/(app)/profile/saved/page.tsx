"use client";

import { useMemo } from "react";
import Link from "next/link";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { FeedList } from "@/components/feed/FeedComponents";
import { Button } from "@/components/ui/Button";
import { usePosts } from "@/components/posts/PostsProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function SavedPostsPage() {
  const { user } = useAuth();
  const { tick, listSavedPosts } = usePosts();
  const { t } = useAppTranslation(["common", "profile"]);

  const posts = useMemo(() => {
    void tick;
    return listSavedPosts();
  }, [tick, listSavedPosts]);

  if (!user) return null;

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg">
      <SettingsBackHeader title={t("savedTitle", { ns: "profile" })} />
      <FeedList
        posts={posts}
        emptyTitle={t("savedEmpty", { ns: "profile" })}
        emptyHint={t("savedEmptyHint", { ns: "profile" })}
        emptyAction={
          <Link href="/feed">
            <Button>{t("browseFeed", { ns: "profile" })}</Button>
          </Link>
        }
      />
    </div>
  );
}
