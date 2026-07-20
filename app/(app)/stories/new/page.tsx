"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStories } from "@/components/stories/StoriesProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import {
  fileToCompressedDataUrl,
  queryCameraPermission,
  snapBothCameras,
  startDualPreview,
  stopStream,
} from "@/lib/media/dualCapture";
import type { StoryVisibility } from "@/lib/types/stories";

type Phase = "idle" | "starting" | "preview" | "snapping" | "review" | "blocked";

async function waitForEl(
  get: () => HTMLVideoElement | null,
  tries = 40,
): Promise<HTMLVideoElement | null> {
  for (let i = 0; i < tries; i++) {
    const el = get();
    if (el) return el;
    await new Promise((r) => setTimeout(r, 40));
  }
  return null;
}

export default function NewStoryPage() {
  const { createStory } = useStories();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "stories"]);
  const router = useRouter();

  const rearVideoRef = useRef<HTMLVideoElement>(null);
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  const rearStreamRef = useRef<MediaStream | null>(null);
  const frontStreamRef = useRef<MediaStream | null>(null);
  const openingRef = useRef(false);
  const mountedRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [dualLive, setDualLive] = useState(false);
  const [front, setFront] = useState<string | null>(null);
  const [rear, setRear] = useState<string | null>(null);
  /** BeReal-style: which camera fills the frame (tap PiP to flip). */
  const [mainIsRear, setMainIsRear] = useState(true);
  const [caption, setCaption] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [stats, setStats] = useState("");
  const [visibility, setVisibility] = useState<StoryVisibility>("followers");
  const [saving, setSaving] = useState(false);
  const [showUploadFallback, setShowUploadFallback] = useState(false);

  function swapMain() {
    setMainIsRear((v) => !v);
  }

  const cleanupStreams = useCallback(() => {
    stopStream(rearStreamRef.current);
    stopStream(frontStreamRef.current);
    rearStreamRef.current = null;
    frontStreamRef.current = null;
    if (rearVideoRef.current) rearVideoRef.current.srcObject = null;
    if (frontVideoRef.current) frontVideoRef.current.srcObject = null;
  }, []);

  const openCameras = useCallback(async () => {
    if (openingRef.current) return;
    openingRef.current = true;
    setPhase("starting");
    setDualLive(false);

    try {
      const rearVideo = await waitForEl(() => rearVideoRef.current);
      const frontVideo = await waitForEl(() => frontVideoRef.current);
      if (!rearVideo || !frontVideo || !mountedRef.current) {
        setPhase("idle");
        return;
      }

      if (
        rearStreamRef.current?.getTracks().some((t) => t.readyState === "live") &&
        frontStreamRef.current?.getTracks().some((t) => t.readyState === "live") &&
        rearVideo.srcObject === rearStreamRef.current
      ) {
        setDualLive(true);
        setPhase("preview");
        await Promise.all([
          rearVideo.play().catch(() => undefined),
          frontVideo.play().catch(() => undefined),
        ]);
        return;
      }

      cleanupStreams();

      const result = await startDualPreview({ rearVideo, frontVideo });
      if (!mountedRef.current) {
        stopStream(result.rearStream);
        stopStream(result.frontStream);
        return;
      }

      rearStreamRef.current = result.rearStream;
      frontStreamRef.current = result.frontStream;
      setDualLive(result.dualLive);

      if (!result.rearStream) {
        setPhase("blocked");
        setShowUploadFallback(true);
        return;
      }

      if (result.rearStream) {
        rearVideo.srcObject = result.rearStream;
        await rearVideo.play().catch(() => undefined);
      }
      if (result.frontStream) {
        frontVideo.srcObject = result.frontStream;
        await frontVideo.play().catch(() => undefined);
      }

      setPhase("preview");
    } catch {
      if (mountedRef.current) {
        setPhase("blocked");
        setShowUploadFallback(true);
      }
    } finally {
      openingRef.current = false;
    }
  }, [cleanupStreams]);

  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      const permission = await queryCameraPermission();
      if (!mountedRef.current) return;
      if (permission === "denied") {
        setPhase("blocked");
        setShowUploadFallback(true);
        return;
      }
      await openCameras();
    })();

    return () => {
      mountedRef.current = false;
      cleanupStreams();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onShutter() {
    if (phase !== "preview") return;
    const rearVideo = rearVideoRef.current;
    const frontVideo = frontVideoRef.current;
    if (!rearVideo || !frontVideo) return;

    setPhase("snapping");
    try {
      const shot = await snapBothCameras({
        rearVideo,
        frontVideo,
        rearStream: rearStreamRef.current,
        frontStream: frontStreamRef.current,
      });
      rearStreamRef.current = null;
      frontStreamRef.current = null;
      cleanupStreams();
      setRear(shot.rear);
      setFront(shot.front);
      setDualLive(false);
      setPhase("review");
    } catch {
      cleanupStreams();
      setPhase("blocked");
      setShowUploadFallback(true);
      toast(t("captureFail", { ns: "stories" }), "error");
    }
  }

  function retake() {
    setFront(null);
    setRear(null);
    setMainIsRear(true);
    setDualLive(false);
    setPhase("idle");
    window.setTimeout(() => void openCameras(), 80);
  }

  async function onUploadPair(files: FileList | null) {
    if (!files || files.length < 2) {
      toast(t("pickTwo", { ns: "stories" }), "error");
      return;
    }
    const a = await fileToCompressedDataUrl(files[0]!);
    const b = await fileToCompressedDataUrl(files[1]!);
    setRear(a);
    setFront(b);
    cleanupStreams();
    setPhase("review");
  }

  function publish() {
    if (!front || !rear) return;
    setSaving(true);
    const story = createStory({
      frontImageUrl: front,
      rearImageUrl: rear,
      primaryImage: mainIsRear ? "rear" : "front",
      layout: mainIsRear ? "overlay_rear_main" : "overlay_selfie_main",
      caption,
      workoutType: workoutType || undefined,
      activityStats: stats || undefined,
      visibility,
    });
    setSaving(false);
    if (!story) {
      toast(t("publishFail", { ns: "stories" }), "error");
      return;
    }
    toast(t("posted", { ns: "stories" }), "success");
    router.push("/feed");
  }

  const isLive = phase === "preview" || phase === "snapping";
  const isReview = phase === "review" && !!front && !!rear;
  const showGate =
    phase === "idle" || phase === "starting" || phase === "blocked";

  return (
    <div className="min-w-0 pb-4">
      <PageHeader
        title={t("newTitle", { ns: "stories" })}
        backHref="/feed"
        backLabel={t("nav.feed")}
      />

      {!isReview ? (
        <div className="mt-4 space-y-4">
          <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-black">
            {/* Both videos stay mounted; CSS swaps which is main vs PiP */}
            <video
              ref={rearVideoRef}
              playsInline
              muted
              autoPlay
              className={
                mainIsRear
                  ? "absolute inset-0 h-full w-full object-cover"
                  : "pointer-events-none absolute left-3 top-3 z-[5] h-[7.5rem] w-[7.5rem] rounded-2xl border-[3px] border-white object-cover shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:h-32 sm:w-32"
              }
            />

            <video
              ref={frontVideoRef}
              playsInline
              muted
              autoPlay
              className={
                mainIsRear
                  ? `absolute left-3 top-3 z-[5] h-[7.5rem] w-[7.5rem] scale-x-[-1] rounded-2xl border-[3px] border-white object-cover shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-opacity sm:h-32 sm:w-32 ${
                      isLive && dualLive ? "opacity-100" : "opacity-0"
                    }`
                  : "absolute inset-0 h-full w-full scale-x-[-1] object-cover"
              }
            />

            {/* Tap PiP to swap which camera is large (BeReal) */}
            {isLive && dualLive && (
              <button
                type="button"
                onClick={swapMain}
                aria-label={t("swapPhotos", { ns: "stories" })}
                className="absolute left-3 top-3 z-[6] h-[7.5rem] w-[7.5rem] rounded-2xl sm:h-32 sm:w-32"
              />
            )}

            {showGate && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted-bg/95 px-6 text-center">
                <button
                  type="button"
                  onClick={() => void openCameras()}
                  aria-label={t("openCamera", { ns: "stories" })}
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-apex active:scale-95"
                >
                  <Camera size={32} />
                </button>
                <p className="font-display text-base font-semibold">
                  {t("dualMoment", { ns: "stories" })}
                </p>
                {phase === "starting" && (
                  <p className="text-xs text-muted">
                    {t("startingCameras", { ns: "stories" })}
                  </p>
                )}
              </div>
            )}

            {phase === "snapping" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55">
                <p className="font-display text-lg font-semibold text-white">
                  {t("capturing", { ns: "stories" })}
                </p>
              </div>
            )}
          </div>

          {isLive && (
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={phase === "snapping"}
                onClick={() => void onShutter()}
                aria-label={t("captureBoth", { ns: "stories" })}
                className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[5px] border-white bg-accent shadow-apex active:scale-95 disabled:opacity-60"
              >
                <span className="h-14 w-14 rounded-full bg-accent-fg/15 ring-2 ring-white/80" />
              </button>
            </div>
          )}

          {(phase === "blocked" || phase === "idle") && (
            <>
              <button
                type="button"
                className="w-full text-center text-xs font-medium text-muted underline"
                onClick={() => setShowUploadFallback((v) => !v)}
              >
                {t("uploadInstead", { ns: "stories" })}
              </button>
              {showUploadFallback && (
                <label className="flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border px-3 py-5 text-center text-xs text-muted">
                  <ImagePlus size={18} />
                  {t("chooseTwo", { ns: "stories" })}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void onUploadPair(e.target.files)}
                  />
                </label>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainIsRear ? rear! : front!}
              alt=""
              className={`aspect-[9/16] w-full object-cover ${
                !mainIsRear ? "scale-x-[-1]" : ""
              }`}
            />
            <button
              type="button"
              onClick={swapMain}
              aria-label={t("swapPhotos", { ns: "stories" })}
              className="absolute left-3 top-3 overflow-hidden rounded-2xl border-[3px] border-white shadow-lg active:scale-95"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainIsRear ? front! : rear!}
                alt=""
                className={`h-28 w-28 object-cover ${
                  mainIsRear ? "scale-x-[-1]" : ""
                }`}
              />
            </button>
          </div>

          <Input
            label={t("caption", { ns: "stories" })}
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 140))}
            placeholder={t("captionPlaceholder", { ns: "stories" })}
          />
          <Input
            label={t("workoutTag", { ns: "stories" })}
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            placeholder={t("workoutTagPlaceholder", { ns: "stories" })}
          />
          <Input
            label={t("stats", { ns: "stories" })}
            value={stats}
            onChange={(e) => setStats(e.target.value)}
            placeholder={t("statsPlaceholder", { ns: "stories" })}
          />

          <div>
            <p className="mb-2 text-sm font-medium">
              {t("whoCanSee", { ns: "stories" })}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["followers", "visibility.followers"],
                  ["public", "visibility.everyone"],
                  ["close_friends", "visibility.closeFriends"],
                  ["private", "visibility.onlyMe"],
                ] as const
              ).map(([id, key]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVisibility(id)}
                  className={`min-h-11 rounded-xl border text-sm font-medium ${
                    visibility === id
                      ? "border-accent bg-accent-soft"
                      : "border-border"
                  }`}
                >
                  {t(key, { ns: "stories" })}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" fullWidth onClick={retake}>
              <RotateCcw size={16} />
              {t("retake", { ns: "stories" })}
            </Button>
            <Button fullWidth loading={saving} onClick={publish}>
              {t("shareStory", { ns: "stories" })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
