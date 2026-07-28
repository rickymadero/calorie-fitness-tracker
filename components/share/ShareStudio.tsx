"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { SharePreview } from "@/components/share/SharePreview";
import { ShareCustomizationPanel } from "@/components/share/ShareCustomizationPanel";
import { ShareExportControls } from "@/components/share/ShareExportControls";
import { EvolveBranding } from "@/components/share/EvolveBranding";
import { generateActivityShareImage } from "@/lib/share/activityCardImage";
import { ATMOSPHERE_LIST } from "@/lib/share/AtmosphereThemes";
import { buildWorkoutShareModel } from "@/lib/share/buildShareModel";
import { defaultShareTitle } from "@/lib/share/HeroMetricSelector";
import { extractShareRoutePoints } from "@/lib/share/routeContext";
import { describeSignalKind } from "@/lib/share/WorkoutSignalGenerator";
import {
  buildShareCaption,
  saveImageOnDevice,
  shareNativePayload,
} from "@/lib/share/InstagramSharing";
import type { WorkoutPost } from "@/lib/types/posts";
import type { AtmosphereId, HeroMetricKey } from "@/lib/share/WorkoutShareModel";

interface ShareStudioProps {
  post: WorkoutPost;
  open: boolean;
  onClose: () => void;
}

export function ShareStudio({ post, open, onClose }: ShareStudioProps) {
  const { getCard } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "feed"]);

  const author = getCard(post.authorId);
  const displayName = author?.profile.displayName ?? t("labels.athlete");
  const username = author?.profile.username ?? "athlete";
  const avatarUrl = author?.profile.avatarUrl || undefined;

  const [atmosphereId, setAtmosphereId] = useState<AtmosphereId>("midnight");
  const [heroKey, setHeroKey] = useState<HeroMetricKey | undefined>();
  const [title, setTitle] = useState(defaultShareTitle(post));
  const [showLocation, setShowLocation] = useState(Boolean(post.locationName));
  const [showDate, setShowDate] = useState(true);
  const hasRoute = extractShareRoutePoints(post).length >= 2;
  const [showRouteContext, setShowRouteContext] = useState(hasRoute);

  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const previewUrlRef = useRef<string | null>(null);
  const renderGen = useRef(0);

  const draft = useMemo(
    () =>
      buildWorkoutShareModel({
        post,
        athlete: { displayName, username, avatarUrl },
        atmosphereId,
        heroKey,
        title,
        showLocation,
        showDate,
        showUsername: false,
        showRouteContext,
      }),
    [
      post,
      displayName,
      username,
      avatarUrl,
      atmosphereId,
      heroKey,
      title,
      showLocation,
      showDate,
      showRouteContext,
    ],
  );

  const rebuild = useCallback(() => {
    if (!open) return;
    const gen = ++renderGen.current;
    setBusy(true);
    setFailed(false);
    void generateActivityShareImage({
      post,
      displayName,
      username,
      avatarUrl,
      atmosphereId: draft.atmosphereId,
      heroKey: draft.hero.key,
      title: draft.title,
      showLocation: draft.showLocation,
      showDate: draft.showDate,
      showUsername: false,
      showRouteContext: draft.showRouteContext,
    })
      .then((b) => {
        if (gen !== renderGen.current) return;
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        const url = URL.createObjectURL(b);
        previewUrlRef.current = url;
        setBlob(b);
        setPreviewUrl(url);
      })
      .catch(() => {
        if (gen !== renderGen.current) return;
        setFailed(true);
        toast(t("share.toastBuildFail", { ns: "feed" }), "error");
      })
      .finally(() => {
        if (gen === renderGen.current) setBusy(false);
      });
  }, [open, post, displayName, username, avatarUrl, draft, toast, t]);

  useEffect(() => {
    if (!open) {
      const clearId = window.setTimeout(() => {
        setBusy(false);
        setFailed(false);
        setBlob(null);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
        setPreviewUrl(null);
        setAtmosphereId("midnight");
        setHeroKey(undefined);
        setTitle(defaultShareTitle(post));
        setShowLocation(Boolean(post.locationName));
        setShowDate(true);
        setShowRouteContext(extractShareRoutePoints(post).length >= 2);
      }, 0);
      return () => window.clearTimeout(clearId);
    }
    const timer = window.setTimeout(() => rebuild(), 180);
    return () => window.clearTimeout(timer);
  }, [open, rebuild, post]);

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${post.id}`
      : `/posts/${post.id}`;

  const caption = buildShareCaption(
    post,
    displayName,
    username,
    link,
    draft.title,
  );

  async function shareNative(files?: File[]) {
    const result = await shareNativePayload({
      title: draft.title,
      text: caption,
      url: link,
      files,
    });
    if (result === "shared") {
      toast(t("share.toastShared", { ns: "feed" }), "success");
    } else if (result === "copied") {
      toast(t("share.toastCopied", { ns: "feed" }), "success");
    } else {
      toast(t("share.toastCancelled", { ns: "feed" }), "info");
    }
  }

  async function shareToInstagram() {
    if (!blob) {
      toast(t("share.toastPreparing", { ns: "feed" }), "info");
      return;
    }
    const file = new File([blob], `evolve-signal-${post.id}.png`, {
      type: "image/png",
    });
    const result = await shareNativePayload({
      title: draft.title,
      text: caption,
      files: [file],
    });
    if (result === "shared") {
      toast(t("share.toastIgPick", { ns: "feed" }), "success");
    } else if (result === "no_files") {
      const { downloadShareBlob } = await import(
        "@/lib/share/InstagramSharing"
      );
      downloadShareBlob(blob, `evolve-signal-${post.id}.png`);
      toast(t("share.toastIgSaved", { ns: "feed" }), "success");
    } else {
      toast(t("share.toastCancelled", { ns: "feed" }), "info");
    }
  }

  async function shareImageAnywhere() {
    if (!blob) return;
    const file = new File([blob], `evolve-signal-${post.id}.png`, {
      type: "image/png",
    });
    await shareNative([file]);
  }

  function downloadImage() {
    if (!blob) return;
    void saveImageOnDevice(
      blob,
      `evolve-signal-${post.id}.png`,
      shareNative,
    ).then((mode) => {
      if (mode === "shared") {
        toast(t("share.toastSaveHint", { ns: "feed" }), "success");
      } else {
        toast(t("share.toastDownloaded", { ns: "feed" }), "success");
      }
    });
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
        <ShareExportControls
          busy={busy}
          hasBlob={Boolean(blob)}
          onInstagram={() => void shareToInstagram()}
          onApps={() => void shareImageAnywhere()}
          onSave={downloadImage}
          onCopyLink={() => void copyLink()}
          onCaption={() => void shareNative()}
          labels={{
            toInstagram: t("share.toInstagram", { ns: "feed" }),
            toAppsShort: t("share.toAppsShort", { ns: "feed" }),
            saveShort: t("share.saveShort", { ns: "feed" }),
            linkShort: t("share.linkShort", { ns: "feed" }),
            captionShort: t("share.captionShort", { ns: "feed" }),
          }}
        />
      }
    >
      <div className="space-y-4 pb-1">
        <div>
          <EvolveBranding size="md" />
          <p className="mt-2 text-center font-display text-xl font-bold leading-tight tracking-tight">
            {draft.title}
          </p>
          <p className="mt-1 text-center text-sm text-muted">
            {t("share.body", { ns: "feed" })}
          </p>
          <p className="mt-1 text-center text-[11px] text-muted">
            {describeSignalKind(draft.signalKind)} ·{" "}
            {t("share.templateCore", { ns: "feed" })}
          </p>
        </div>

        <SharePreview
          previewUrl={previewUrl}
          busy={busy}
          failed={failed}
          buildingLabel={t("share.building", { ns: "feed" })}
          failLabel={t("share.toastBuildFail", { ns: "feed" })}
          alt={t("share.previewAlt", { ns: "feed" })}
        />

        <ShareCustomizationPanel
          title={title}
          onTitleChange={setTitle}
          availableHeroes={draft.availableHeroes}
          heroKey={draft.hero.key}
          onHeroChange={setHeroKey}
          atmospheres={ATMOSPHERE_LIST}
          atmosphereId={draft.atmosphereId}
          onAtmosphereChange={setAtmosphereId}
          showDate={showDate}
          showLocation={showLocation}
          hasLocation={Boolean(post.locationName)}
          showRouteContext={showRouteContext}
          hasRoute={hasRoute}
          onShowDate={setShowDate}
          onShowLocation={setShowLocation}
          onShowRouteContext={setShowRouteContext}
          labels={{
            titleField: t("share.titleField", { ns: "feed" }),
            heroLabel: t("share.heroLabel", { ns: "feed" }),
            atmosphereLabel: t("share.atmosphereLabel", { ns: "feed" }),
            showDate: t("share.showDate", { ns: "feed" }),
            showLocation: t("share.showLocation", { ns: "feed" }),
            showRouteContext: t("share.showRouteContext", { ns: "feed" }),
          }}
        />

        <p className="text-center text-[11px] leading-relaxed text-muted">
          {t("share.igHint", { ns: "feed" })}
        </p>
      </div>
    </Modal>
  );
}
