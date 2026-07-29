"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTrackWorkout } from "@/components/track/TrackWorkoutProvider";
import { LiveTrackingDashboard } from "@/components/track/live/LiveTrackingDashboard";

export default function TrackActivePage() {
  const router = useRouter();
  const { user } = useAuth();
  const units =
    user?.measurementSystem === "imperial" ? "imperial" : "metric";
  const {
    snapshot,
    elapsedSeconds,
    gpsStatus,
    paceSecondsPerKm,
    instantPaceSecondsPerKm,
    speedKmh,
    instantSpeedKmh,
    pause,
    resume,
    requestFinish,
    confirmFinish,
    continueFromFinish,
    discard,
    addLap,
    logStrengthSet,
    completeHyroxStation,
    loadExisting,
  } = useTrackWorkout();
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!snapshot && !hydratedRef.current) {
      hydratedRef.current = true;
      const existing = loadExisting();
      if (!existing) {
        router.replace("/track");
        return;
      }
      if (existing.phase === "completed") {
        router.replace("/track/summary");
      } else if (
        existing.phase === "preparing" ||
        existing.phase === "ready" ||
        existing.phase === "idle"
      ) {
        router.replace(`/track/prepare/${existing.activityId}`);
      }
      return;
    }
    if (!snapshot) return;
    if (snapshot.phase === "completed") {
      router.replace("/track/summary");
    } else if (
      snapshot.phase === "idle" ||
      snapshot.phase === "preparing" ||
      snapshot.phase === "ready"
    ) {
      router.replace(`/track/prepare/${snapshot.activityId}`);
    }
  }, [snapshot, loadExisting, router]);

  if (!snapshot) return null;
  if (
    snapshot.phase !== "active" &&
    snapshot.phase !== "paused" &&
    snapshot.phase !== "finishing"
  ) {
    return null;
  }

  return (
    <LiveTrackingDashboard
      snapshot={snapshot}
      elapsedSeconds={elapsedSeconds}
      gpsStatus={gpsStatus}
      avgPaceSecondsPerKm={paceSecondsPerKm}
      instantPaceSecondsPerKm={instantPaceSecondsPerKm}
      avgSpeedKmh={speedKmh}
      instantSpeedKmh={instantSpeedKmh}
      units={units}
      onPause={pause}
      onResume={resume}
      onRequestFinish={requestFinish}
      onConfirmFinish={() => {
        confirmFinish();
        router.push("/track/summary");
      }}
      onContinue={continueFromFinish}
      onDiscard={() => {
        discard();
        router.replace("/track");
      }}
      onLap={addLap}
      onLogSet={logStrengthSet}
      onHyroxStation={completeHyroxStation}
    />
  );
}
