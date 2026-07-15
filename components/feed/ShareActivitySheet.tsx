"use client";

import { useEffect, useState } from "react";
import {
  Share2,
  Download,
  Link2,
  AtSign,
  MessageCircle,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { generateActivityShareImage } from "@/lib/share/activityCardImage";
import {
  formatDurationClock,
  formatPace,
} from "@/lib/geo/routes";
import type { WorkoutPost } from "@/lib/types/posts";

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
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const author = getCard(post.authorId);
  const displayName = author?.profile.displayName ?? "Athlete";
  const username = author?.profile.username ?? "athlete";

  useEffect(() => {
    if (!open) return;
    let alive = true;
    let objectUrl: string | null = null;
    setBusy(true);
    generateActivityShareImage({ post, displayName, username })
      .then((b) => {
        if (!alive) return;
        setBlob(b);
        objectUrl = URL.createObjectURL(b);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (alive) toast("Could not build share image.", "error");
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, post, displayName, username, toast]);

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${post.id}`
      : `/posts/${post.id}`;

  const caption = buildCaption(post, displayName, username, link);

  async function shareNative(files?: File[]) {
    try {
      if (files?.length && navigator.canShare?.({ files })) {
        await navigator.share({
          files,
          title: post.title,
          text: caption,
        });
        toast("Shared.", "success");
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: post.title, text: caption, url: link });
        toast("Shared.", "success");
        return;
      }
      await navigator.clipboard.writeText(caption);
      toast("Summary copied — paste it anywhere.", "success");
    } catch {
      toast("Share cancelled.", "info");
    }
  }

  async function shareToInstagram() {
    if (!blob) {
      toast("Preparing image…", "info");
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
        toast(
          "Choose Instagram Stories in the share sheet to post your card.",
          "success",
        );
        return;
      }
      // Desktop / unsupported file share — download for Stories upload
      downloadBlob(blob, `evolve-${post.id}.png`);
      toast(
        "Image saved. Open Instagram → Stories → add from camera roll.",
        "success",
      );
    } catch {
      toast("Share cancelled.", "info");
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
    downloadBlob(blob, `evolve-${post.id}.png`);
    toast("Image downloaded.", "success");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    toast("Link copied.", "success");
  }

  const pace = formatPace(post.paceMinPerKm);

  return (
    <Modal open={open} onClose={onClose} title="Share activity" size="md">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Your card includes activity type, time, pace, map (when available),
          and Evolve branding — ready for Instagram Stories or other apps.
        </p>

        {/* Mini live stats strip */}
        <div className="grid grid-cols-4 gap-2 rounded-2xl bg-muted-bg p-3 text-center">
          <MiniStat
            label="Type"
            value={post.type.slice(0, 1).toUpperCase() + post.type.slice(1)}
          />
          <MiniStat
            label="Time"
            value={
              post.durationMin != null
                ? formatDurationClock(post.durationMin)
                : "—"
            }
          />
          <MiniStat
            label="Pace"
            value={pace?.replace("/km", "") ?? (post.distanceKm != null ? `${post.distanceKm}k` : "—")}
          />
          <MiniStat
            label="Cal"
            value={
              post.caloriesBurned != null ? String(post.caloriesBurned) : "—"
            }
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-nav">
          {busy || !previewUrl ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-white/60">
              <Loader2 className="animate-spin" size={18} />
              Building share card…
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Share preview"
              className="mx-auto max-h-80 w-auto object-contain"
            />
          )}
        </div>

        <div className="grid gap-2">
          <Button
            fullWidth
            size="lg"
            disabled={busy || !blob}
            onClick={() => void shareToInstagram()}
          >
            <AtSign size={18} />
            Share to Instagram Stories
          </Button>
          <Button
            fullWidth
            variant="secondary"
            disabled={busy || !blob}
            onClick={() => void shareImageAnywhere()}
          >
            <Share2 size={18} />
            Share image (WhatsApp, Messages…)
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={busy || !blob}
              onClick={downloadImage}
            >
              <Download size={16} />
              Save image
            </Button>
            <Button variant="outline" onClick={() => void copyLink()}>
              <Link2 size={16} />
              Copy link
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => void shareNative()}
          >
            <MessageCircle size={16} />
            Share link only
          </Button>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-muted">
          <ImageIcon size={12} className="mr-1 inline" />
          Instagram doesn&apos;t allow apps to post Stories directly from the
          browser. On iPhone, use the share sheet and pick Instagram Stories.
          On desktop, save the image and upload it in the Instagram app.
        </p>
      </div>
    </Modal>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="truncate font-display text-sm font-bold">{value}</p>
      <p className="text-[10px] uppercase text-muted">{label}</p>
    </div>
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
  a.click();
  URL.revokeObjectURL(url);
}
