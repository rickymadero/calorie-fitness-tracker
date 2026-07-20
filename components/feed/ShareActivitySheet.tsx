"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Download,
  Link2,
  AtSign,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { generateActivityShareImage } from "@/lib/share/activityCardImage";
import { formatDurationClock, formatPace } from "@/lib/geo/routes";
import { easeOut } from "@/lib/motion";
import type { WorkoutPost } from "@/lib/types/posts";
import type { ReactNode } from "react";

interface ShareActivitySheetProps {
  post: WorkoutPost;
  open: boolean;
  onClose: () => void;
}

export function ShareActivitySheet({
  post,
  open,
  onClose,
}: ShareActivitySheetProps) {
  const { getCard } = useSocial();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { t } = useAppTranslation(["common", "feed"]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const author = getCard(post.authorId);
  const displayName = author?.profile.displayName ?? t("labels.athlete");
  const username = author?.profile.username ?? "athlete";

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setFailed(false);
      setBlob(null);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreviewUrl(null);
      return;
    }

    let alive = true;
    setBusy(true);
    setFailed(false);
    setBlob(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);

    generateActivityShareImage({ post, displayName, username, theme })
      .then((b) => {
        if (!alive) return;
        const url = URL.createObjectURL(b);
        previewUrlRef.current = url;
        setBlob(b);
        setPreviewUrl(url);
      })
      .catch(() => {
        if (!alive) return;
        setFailed(true);
        toast(t("share.toastBuildFail", { ns: "feed" }), "error");
      })
      .finally(() => {
        if (alive) setBusy(false);
      });

    return () => {
      alive = false;
    };
  }, [open, post, displayName, username, theme, toast, t]);

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${post.id}`
      : `/posts/${post.id}`;

  const caption = buildCaption(post, displayName, username, link);
  const pace = formatPace(post.paceMinPerKm);
  const highlightStats = [
    {
      label: t("share.type", { ns: "feed" }),
      value: post.type.slice(0, 1).toUpperCase() + post.type.slice(1),
    },
    {
      label: t("stats.time", { ns: "feed" }),
      value:
        post.durationMin != null
          ? formatDurationClock(post.durationMin)
          : "—",
    },
    {
      label: t("share.pace", { ns: "feed" }),
      value:
        pace?.replace("/km", "") ??
        (post.distanceKm != null ? `${post.distanceKm}k` : "—"),
    },
    {
      label: t("share.cal", { ns: "feed" }),
      value:
        post.caloriesBurned != null ? String(post.caloriesBurned) : "—",
    },
  ];

  async function shareNative(files?: File[]) {
    try {
      if (files?.length && navigator.canShare?.({ files })) {
        await navigator.share({
          files,
          title: post.title,
          text: caption,
        });
        toast(t("share.toastShared", { ns: "feed" }), "success");
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: post.title, text: caption, url: link });
        toast(t("share.toastShared", { ns: "feed" }), "success");
        return;
      }
      await navigator.clipboard.writeText(caption);
      toast(t("share.toastCopied", { ns: "feed" }), "success");
    } catch {
      toast(t("share.toastCancelled", { ns: "feed" }), "info");
    }
  }

  async function shareToInstagram() {
    if (!blob) {
      toast(t("share.toastPreparing", { ns: "feed" }), "info");
      return;
    }
    const file = new File([blob], `evolve-${post.id}.png`, {
      type: "image/png",
    });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: post.title,
          text: caption,
        });
        toast(t("share.toastIgPick", { ns: "feed" }), "success");
        return;
      }
      downloadBlob(blob, `evolve-${post.id}.png`);
      toast(t("share.toastIgSaved", { ns: "feed" }), "success");
    } catch {
      toast(t("share.toastCancelled", { ns: "feed" }), "info");
    }
  }

  async function shareImageAnywhere() {
    if (!blob) return;
    const file = new File([blob], `evolve-${post.id}.png`, {
      type: "image/png",
    });
    await shareNative([file]);
  }

  function downloadImage() {
    if (!blob) return;
    void saveImageOnDevice(blob, `evolve-${post.id}.png`, shareNative).then(
      (mode) => {
        if (mode === "shared") {
          toast(t("share.toastSaveHint", { ns: "feed" }), "success");
        } else {
          toast(t("share.toastDownloaded", { ns: "feed" }), "success");
        }
      },
    );
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    toast(t("share.toastLinkCopied", { ns: "feed" }), "success");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("share.title", { ns: "feed" })}
      size="md"
      footer={
        <div className="space-y-2.5">
          <Button
            fullWidth
            size="lg"
            disabled={busy || !blob}
            onClick={() => void shareToInstagram()}
            className="shadow-[0_12px_32px_rgba(26,159,99,0.28)]"
          >
            <AtSign size={18} />
            {t("share.toInstagram", { ns: "feed" })}
          </Button>
          <div className="grid grid-cols-4 gap-2">
            <ActionTile
              icon={<Share2 size={18} />}
              label={t("share.toAppsShort", { ns: "feed" })}
              disabled={busy || !blob}
              onClick={() => void shareImageAnywhere()}
            />
            <ActionTile
              icon={<Download size={18} />}
              label={t("share.saveShort", { ns: "feed" })}
              disabled={busy || !blob}
              onClick={downloadImage}
            />
            <ActionTile
              icon={<Link2 size={18} />}
              label={t("share.linkShort", { ns: "feed" })}
              onClick={() => void copyLink()}
            />
            <ActionTile
              icon={<MessageCircle size={18} />}
              label={t("share.captionShort", { ns: "feed" })}
              onClick={() => void shareNative()}
            />
          </div>
        </div>
      }
    >
      <div className="space-y-4 pb-1">
        <div>
          <p className="font-display text-xl font-bold leading-tight tracking-tight">
            {post.title}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t("share.body", { ns: "feed" })}
          </p>
        </div>

        {/* Centered Stories preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className="relative mx-auto flex w-full justify-center"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(46,207,135,0.22),_transparent_70%)] blur-2xl" />
          <div className="relative h-[260px] w-[146px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#12100e] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#171a1f]">
              {busy || (!previewUrl && !failed) ? (
                <div className="flex items-center gap-2 px-3 text-center text-xs text-white/50">
                  <Loader2 className="animate-spin" size={16} />
                  {t("share.building", { ns: "feed" })}
                </div>
              ) : failed ? (
                <p className="px-3 text-center text-xs text-white/50">
                  {t("share.toastBuildFail", { ns: "feed" })}
                </p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl!}
                  alt={t("share.previewAlt", { ns: "feed" })}
                  className="h-full w-full object-cover object-center"
                />
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5">
          {highlightStats.map((s) => (
            <div
              key={s.label}
              className="shrink-0 rounded-2xl border border-border/80 bg-muted-bg/50 px-3 py-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                {s.label}
              </p>
              <p className="font-display text-sm font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] leading-relaxed text-muted">
          {t("share.igHint", { ns: "feed" })}
        </p>
      </div>
    </Modal>
  );
}

function ActionTile({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="evolve-press flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-background/60 px-1 text-center text-[10px] font-medium text-muted transition hover:border-accent/35 hover:text-foreground disabled:opacity-40"
    >
      <span className="text-foreground">{icon}</span>
      {label}
    </button>
  );
}

function buildCaption(
  post: WorkoutPost,
  name: string,
  username: string,
  link: string,
) {
  const bits: string[] = [`${post.title} — ${post.type}`];
  if (post.distanceKm != null) bits.push(`${post.distanceKm} km`);
  if (post.durationMin != null) {
    bits.push(formatDurationClock(post.durationMin));
  }
  const pace = formatPace(post.paceMinPerKm);
  if (pace) bits.push(pace);
  if (post.caloriesBurned != null) bits.push(`${post.caloriesBurned} cal`);
  bits.push(`by ${name} (@${username}) on Evolve`);
  bits.push(link);
  return bits.join(" · ");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function saveImageOnDevice(
  blob: Blob,
  filename: string,
  shareNative: (files?: File[]) => Promise<void>,
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && navigator.canShare?.({ files: [file] })) {
    await shareNative([file]);
    return "shared";
  }
  downloadBlob(blob, filename);
  return "downloaded";
}
