"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { AthleteDemoMedia } from "@/lib/training/exerciseMedia";

interface AthleteFormDemoProps {
  media: AthleteDemoMedia;
  title: string;
  compact?: boolean;
  className?: string;
  /** When true, video plays muted auto-loop (Pro full demo). */
  interactive?: boolean;
}

export function AthleteFormDemo({
  media,
  title,
  compact,
  className = "",
  interactive = true,
}: AthleteFormDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !interactive) return;
    el.load();
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [media.videoSrc, interactive]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const replay = () => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play();
    setPlaying(true);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-accent/20 bg-[#050806] ${
        compact ? "aspect-[16/10]" : "aspect-[16/10] sm:aspect-[16/9]"
      } ${className}`}
    >
      {/* object-contain keeps full body in frame — cover was cropping athletes to faces */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain bg-black"
        src={media.videoSrc}
        poster={media.posterSrc}
        muted={muted}
        loop
        playsInline
        autoPlay={interactive}
        preload="metadata"
        aria-label={`${title} athlete form demonstration`}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <span className="rounded-full border border-accent/40 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent backdrop-blur">
          Live athlete form
        </span>
        <span className="hidden rounded-full bg-black/50 px-2 py-1 text-[10px] text-white/70 backdrop-blur sm:inline">
          Loop
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 px-3 pb-3 pt-12">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="truncate text-[10px] text-accent/85">
            {media.label} · real-time movement
          </p>
        </div>
        {interactive && (
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/15"
              aria-label={playing ? "Pause demo" : "Play demo"}
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              type="button"
              onClick={replay}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/15"
              aria-label="Replay demo"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                const el = videoRef.current;
                const next = !muted;
                setMuted(next);
                if (el) el.muted = next;
              }}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/15"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Silent looping preview for cards / Free blur backgrounds */
export function AthleteFormThumb({
  media,
  className = "",
}: {
  media: AthleteDemoMedia;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#050806] ${className}`}>
      <video
        className="absolute inset-0 h-full w-full object-contain bg-black"
        src={media.videoSrc}
        poster={media.posterSrc}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
