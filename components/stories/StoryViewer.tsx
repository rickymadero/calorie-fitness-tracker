"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { useStories } from "@/components/stories/StoriesProvider";
import { SocialAvatar } from "@/components/social/PersonCard";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import type { DualStory, StoryReactionKind } from "@/lib/types/stories";

const REACTION_IDS: StoryReactionKind[] = [
  "strong",
  "great_work",
  "keep_going",
  "pr",
  "fire",
  "respect",
  "lets_train",
];

const REACTION_EMOJI: Record<StoryReactionKind, string> = {
  strong: "💪",
  great_work: "🙌",
  keep_going: "🔥",
  pr: "🏆",
  fire: "⚡",
  respect: "👏",
  lets_train: "🤝",
};

const REACTION_LABEL_KEYS: Record<StoryReactionKind, string> = {
  strong: "reactLabels.strong",
  great_work: "reactLabels.greatWork",
  keep_going: "reactLabels.keepGoing",
  pr: "reactLabels.pr",
  fire: "reactLabels.fire",
  respect: "reactLabels.respect",
  lets_train: "reactLabels.letsTrain",
};

export function StoryViewer({
  stories,
  startIndex = 0,
  onClose,
}: {
  stories: DualStory[];
  startIndex?: number;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { getCard } = useSocial();
  const { viewStory, react, reply, deleteStory, muteUser } = useStories();
  const { toast } = useToast();
  const { t } = useAppTranslation(["stories", "common"]);
  const [index, setIndex] = useState(startIndex);
  const [replyText, setReplyText] = useState("");
  const [showReact, setShowReact] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mounted, setMounted] = useState(false);
  /** Viewer can flip main/PiP like BeReal without changing the posted layout. */
  const [swapOverride, setSwapOverride] = useState(false);

  const story = stories[index];
  const card = story ? getCard(story.userId) : null;
  const name = card?.profile.displayName ?? t("labels.athlete", { ns: "common" });
  const username = card?.profile.username;
  const isOwner = user?.id === story?.userId;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSwapOverride(false);
    setConfirmDelete(false);
  }, [index]);

  // recordView is a no-op after the first write, so this does not loop on tick.
  useEffect(() => {
    if (!story) return;
    viewStory(story.id);
  }, [story, viewStory]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!story || !mounted) return null;

  const postedMainIsRear =
    story.layout === "overlay_rear_main" ||
    (story.layout !== "overlay_selfie_main" && story.primaryImage === "rear");
  const mainIsRear = swapOverride ? !postedMainIsRear : postedMainIsRear;
  const mainSrc = mainIsRear ? story.rearImageUrl : story.frontImageUrl;
  const overlaySrc = mainIsRear ? story.frontImageUrl : story.rearImageUrl;
  const mirrorMain = !mainIsRear;
  const mirrorOverlay = mainIsRear;

  /** Demo SVG frames include readable labels — don't mirror those. Real selfies still flip. */
  function selfieMirrorClass(src: string, wantMirror: boolean) {
    if (!wantMirror) return "";
    if (src.startsWith("data:image/svg")) return "";
    return "scale-x-[-1]";
  }

  const hoursLeft = Math.max(
    0,
    Math.ceil(
      (new Date(story.expiresAt).getTime() - Date.now()) / (60 * 60 * 1000),
    ),
  );

  function onDeleteStory() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const ok = deleteStory(story.id);
    if (ok) toast(t("deleted"), "success");
    else toast(t("deleteFail"), "error");
    onClose();
  }

  /** Tap sides to move between stories — never auto-closes; use X to leave. */
  function onTap(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const mid = rect.width / 2;
    if (x < mid) {
      if (index > 0) setIndex((i) => i - 1);
    } else if (index < stories.length - 1) {
      setIndex((i) => i + 1);
    }
  }

  const ui = (
    <div
      className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label={t("storyFallback")}
    >
      {/* Full-bleed media under all chrome — no black half-gap */}
      <div className="absolute inset-0" onClick={onTap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainSrc}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${selfieMirrorClass(mainSrc, mirrorMain)}`}
        />
        {story.layout === "split" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={overlaySrc}
            alt=""
            className={`absolute inset-y-0 right-0 w-1/2 object-cover ${selfieMirrorClass(overlaySrc, mirrorOverlay)}`}
          />
        ) : story.layout === "stack" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={overlaySrc}
            alt=""
            className={`absolute inset-x-0 bottom-0 h-1/2 object-cover ${selfieMirrorClass(overlaySrc, mirrorOverlay)}`}
          />
        ) : (
          <button
            type="button"
            aria-label={t("swapPhotos")}
            className="absolute left-3 top-[4.75rem] z-[1] overflow-hidden rounded-2xl border-2 border-white shadow-lg active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setSwapOverride((v) => !v);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={overlaySrc}
              alt=""
              className={`h-28 w-28 object-cover ${selfieMirrorClass(overlaySrc, mirrorOverlay)}`}
            />
          </button>
        )}
      </div>

      {/* Chrome column — caption naturally sits above footer */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
        <div
          className="pointer-events-auto flex items-center gap-2 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
        >
          <Link
            href={username ? `/social/u/${username}` : "#"}
            className="flex min-w-0 flex-1 items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <SocialAvatar name={name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold drop-shadow">{name}</p>
              <p className="text-[10px] text-white/70">
                {new Date(story.createdAt).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {story.workoutType ? ` · ${story.workoutType}` : ""}
                {isOwner
                  ? ` · ${t("expiresIn", { hours: hoursLeft })}`
                  : ""}
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center"
            aria-label={t("buttons.close", { ns: "common" })}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        <div className="min-h-0 flex-1" />

        {(story.caption || story.activityStats) && (
          <div className="bg-gradient-to-t from-black/50 via-black/10 to-transparent px-4 pb-3 pt-14">
            {story.activityStats && (
              <p className="text-xs font-medium text-accent">{story.activityStats}</p>
            )}
            {story.caption && (
              <p className="mt-1 text-sm leading-relaxed drop-shadow">
                {story.caption}
              </p>
            )}
          </div>
        )}

        <div
          className="pointer-events-auto space-y-2 bg-gradient-to-t from-black/85 via-black/70 to-black/40 px-3 pt-2 backdrop-blur-[2px]"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {showReact && (
            <div className="flex flex-wrap justify-center gap-2 pb-1">
              {REACTION_IDS.map((id) => {
                const label = t(REACTION_LABEL_KEYS[id]);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    title={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl transition active:scale-90 hover:bg-white/25"
                    onClick={() => {
                      react(story.id, id);
                      setShowReact(false);
                    }}
                  >
                    <span aria-hidden>{REACTION_EMOJI[id]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {!isOwner && story.repliesEnabled && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                reply(story.id, replyText, story.userId);
                setReplyText("");
              }}
            >
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("replyPlaceholder")}
                className="min-h-11 flex-1 rounded-full border border-white/20 bg-black/40 px-4 text-sm outline-none placeholder:text-white/40"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setShowReact((v) => !v)}
              >
                {t("react")}
              </Button>
              <Button type="submit" size="sm" disabled={!replyText.trim()}>
                <MessageCircle size={16} />
              </Button>
            </form>
          )}

          {isOwner && confirmDelete && (
            <div className="ml-auto max-w-[16rem] rounded-2xl border border-white/20 bg-black/60 px-3 py-3 text-right shadow-lg">
              <p className="text-sm font-medium">{t("deleteConfirm")}</p>
              <p className="mt-1 text-[11px] text-white/55">
                {t("deleteConfirmHint")}
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setConfirmDelete(false);
                  }}
                >
                  {t("buttons.cancel", { ns: "common" })}
                </Button>
                <Button size="sm" onClick={onDeleteStory}>
                  <Trash2 size={14} />
                  {t("buttons.delete", { ns: "common" })}
                </Button>
              </div>
            </div>
          )}

          {!isOwner && (
            <button
              type="button"
              className="text-xs text-white/45"
              onClick={() => {
                muteUser(story.userId);
                onClose();
              }}
            >
              {t("mute")}
            </button>
          )}
        </div>

        {/* Delete — bottom right (owners only) */}
        {isOwner && !confirmDelete && (
          <button
            type="button"
            className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur-sm active:scale-95"
            aria-label={t("buttons.delete", { ns: "common" })}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteStory();
            }}
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}
