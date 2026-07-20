"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Archive } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useStories } from "@/components/stories/StoriesProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function StoryArchivePage() {
  const { t } = useAppTranslation("stories");
  const { tick, listArchive } = useStories();

  const archived = useMemo(() => {
    void tick;
    return listArchive();
  }, [tick, listArchive]);

  return (
    <div>
      <PageHeader
        title={t("archiveTitle")}
        subtitle={t("archiveSubtitle")}
        backHref="/profile"
        sticky
      />

      <div className="mt-4 space-y-3">
        {archived.length === 0 ? (
          <EmptyState
            icon={<Archive size={28} />}
            title={t("archiveEmpty")}
            description={t("archiveHint")}
            action={
              <Link href="/stories/new">
                <Button>{t("create")}</Button>
              </Link>
            }
          />
        ) : (
          archived.map((s) => (
            <div
              key={s.id}
              className="flex gap-3 rounded-2xl border border-border bg-card p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.rearImageUrl}
                alt=""
                className="h-20 w-14 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {s.caption || s.workoutType || t("storyFallback")}
                </p>
                <p className="text-xs text-muted">
                  {new Date(s.archivedAt ?? s.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
