"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getTrackActivity,
  type TrackActivityId,
} from "@/lib/track/activityCatalog";
import {
  activeWorkoutStorage,
  computeElapsedSeconds,
  type ActiveWorkoutSnapshot,
  type TrackGoal,
} from "@/lib/track/activeWorkoutStorage";
import {
  canFinish,
  canResume,
  canTransition,
  type WorkoutPhase,
} from "@/lib/track/WorkoutStateMachine";
import {
  shouldAcceptGpsPoint,
  type GpsSample,
} from "@/lib/track/gpsFilter";
import {
  buildDistanceSplits,
  elevationGainMeters,
  estimateCalories,
  pathDistanceMeters,
  paceSecondsPerKm,
  speedKmh,
} from "@/lib/track/metrics";
import {
  appendPaceSample,
  estimateCadenceSpm,
  instantPaceSecondsPerKm,
  instantSpeedKmh,
} from "@/lib/track/liveMetrics";
import type { StrengthSetLog } from "@/lib/track/activeWorkoutStorage";

type GpsStatus = "idle" | "acquiring" | "ready" | "denied" | "unsupported" | "weak";

type TrackWorkoutContextValue = {
  snapshot: ActiveWorkoutSnapshot | null;
  elapsedSeconds: number;
  gpsStatus: GpsStatus;
  paceSecondsPerKm: number | null;
  /** Instant / rolling pace from recent GPS */
  instantPaceSecondsPerKm: number | null;
  speedKmh: number | null;
  instantSpeedKmh: number | null;
  prepare: (activityId: TrackActivityId, goal?: TrackGoal) => void;
  setReady: () => void;
  setGpsDenied: (denied: boolean) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  requestFinish: () => void;
  confirmFinish: () => void;
  continueFromFinish: () => void;
  discard: () => void;
  addLap: () => void;
  logStrengthSet: (input: {
    name: string;
    weightKg: number;
    reps: number;
  }) => void;
  completeHyroxStation: () => void;
  setManualDistanceMeters: (meters: number) => void;
  updateMeta: (
    patch: Partial<
      Pick<
        ActiveWorkoutSnapshot,
        "title" | "notes" | "photoUrl" | "videoUrl" | "visibility" | "privacyRouteMode"
      >
    >,
  ) => void;
  loadExisting: () => ActiveWorkoutSnapshot | null;
  clearLocal: () => void;
};

const TrackWorkoutContext = createContext<TrackWorkoutContextValue | null>(
  null,
);

function newId() {
  return `trk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function splitDistanceForUnits(units: "metric" | "imperial") {
  return units === "imperial" ? 1609.344 : 1000;
}

export function TrackWorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const units =
    user?.measurementSystem === "imperial" ? "imperial" : "metric";
  const [snapshot, setSnapshot] = useState<ActiveWorkoutSnapshot | null>(null);
  const [clockMs, setClockMs] = useState(() => Date.now());
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const snapRef = useRef<ActiveWorkoutSnapshot | null>(null);
  const handleGpsPositionRef = useRef<(pos: GeolocationPosition) => void>(
    () => {},
  );

  const persist = useCallback(
    (next: ActiveWorkoutSnapshot | null) => {
      snapRef.current = next;
      setSnapshot(next);
      if (!userId) return;
      if (!next) {
        activeWorkoutStorage.clear(userId);
        return;
      }
      activeWorkoutStorage.save(next);
    },
    [userId],
  );

  const recomputeDerived = useCallback(
    (snap: ActiveWorkoutSnapshot): ActiveWorkoutSnapshot => {
      const def = getTrackActivity(snap.activityId);
      const distance = def.autoDistance
        ? pathDistanceMeters(snap.points)
        : snap.distanceMeters;
      const elev = elevationGainMeters(snap.points);
      const moving = computeElapsedSeconds(snap);
      const calories = estimateCalories({
        activityId: snap.activityId,
        durationSeconds: moving,
        distanceMeters: distance,
      });
      const splits = def.autoDistance
        ? buildDistanceSplits(
            snap.points,
            snap.startedAtMs,
            splitDistanceForUnits(units),
          )
        : snap.splits;
      const instSpeed = instantSpeedKmh(snap.points);
      const instPace = instantPaceSecondsPerKm(snap.points);
      const cadence =
        snap.activityId === "running" ||
        snap.activityId === "walking" ||
        snap.activityId === "treadmill"
          ? estimateCadenceSpm(instSpeed)
          : null;
      const paceSamples = appendPaceSample(snap.paceSamples ?? [], {
        atMs: Date.now(),
        distanceMeters: distance,
        paceSecondsPerKm: instPace ?? paceSecondsPerKm(distance, moving),
        speedKmh: instSpeed ?? speedKmh(distance, moving),
      });
      return {
        ...snap,
        distanceMeters: distance,
        elevationGainMeters: elev,
        calories,
        splits,
        paceSamples,
        estimatedCadenceSpm: cadence,
        strengthSets: snap.strengthSets ?? [],
        hyroxStationsCompleted: snap.hyroxStationsCompleted ?? 0,
        updatedAtMs: Date.now(),
      };
    },
    [units],
  );

  const stopGps = useCallback(() => {
    if (watchIdRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {
      /* ignore */
    }
    wakeLockRef.current = null;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      wakeLockRef.current = null;
    }
  }, []);

  const handleGpsPosition = useCallback(
    (pos: GeolocationPosition) => {
      const current = snapRef.current;
      if (!current || current.phase !== "active" || !current.usesGps) return;
      const sample: GpsSample = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        altitude: pos.coords.altitude,
        accuracyMeters: pos.coords.accuracy,
        speedMps: pos.coords.speed,
        recordedAt: pos.timestamp || Date.now(),
      };
      const prev = current.points.length
        ? current.points[current.points.length - 1]!
        : null;
      const activityUsesSpeed =
        current.activityId === "cycling" ||
        current.activityId === "indoor_cycling";
      if (
        !shouldAcceptGpsPoint(prev, sample, {
          activityUsesSpeed,
          paused: false,
        })
      ) {
        if (sample.accuracyMeters != null && sample.accuracyMeters > 45) {
          setGpsStatus("weak");
        }
        return;
      }
      setGpsStatus("ready");
      persist(
        recomputeDerived({
          ...current,
          points: [...current.points, sample],
        }),
      );
    },
    [persist, recomputeDerived],
  );

  useEffect(() => {
    handleGpsPositionRef.current = handleGpsPosition;
  }, [handleGpsPosition]);

  const startGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("unsupported");
      return;
    }
    stopGps();
    setGpsStatus("acquiring");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => handleGpsPositionRef.current(pos),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus("denied");
          const current = snapRef.current;
          if (current) {
            persist({ ...current, gpsDenied: true, usesGps: false });
          }
        } else {
          setGpsStatus("weak");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      },
    );
  }, [persist, stopGps]);

  const beginTrackingHardware = useCallback(
    (snap: ActiveWorkoutSnapshot) => {
      void requestWakeLock();
      if (snap.usesGps && !snap.gpsDenied) startGps();
      else stopGps();
    },
    [requestWakeLock, startGps, stopGps],
  );

  const endTrackingHardware = useCallback(() => {
    stopGps();
    void releaseWakeLock();
  }, [releaseWakeLock, stopGps]);

  // Live clock while active/paused
  useEffect(() => {
    if (snapshot?.phase !== "active" && snapshot?.phase !== "paused") return;
    const id = window.setInterval(() => setClockMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [snapshot?.phase, snapshot?.id]);

  useEffect(() => {
    return () => {
      stopGps();
      void releaseWakeLock();
    };
  }, [stopGps, releaseWakeLock]);

  const loadExisting = useCallback(() => {
    if (!userId) return null;
    const existing = activeWorkoutStorage.load(userId);
    if (existing) {
      persist(existing);
      if (existing.phase === "active") {
        beginTrackingHardware(existing);
      }
      return existing;
    }
    return null;
  }, [userId, persist, beginTrackingHardware]);

  const prepare = useCallback(
    (activityId: TrackActivityId, goal: TrackGoal = { kind: "open" }) => {
      if (!userId) return;
      const def = getTrackActivity(activityId);
      const now = Date.now();
      const id = newId();
      const next: ActiveWorkoutSnapshot = {
        id,
        userId,
        activityId,
        phase: "preparing",
        startedAtMs: now,
        pausedMs: 0,
        pauseStartedAtMs: null,
        updatedAtMs: now,
        usesGps: def.usesGps,
        gpsDenied: false,
        goal,
        points: [],
        manualLaps: [],
        splits: [],
        paceSamples: [],
        strengthSets: [],
        hyroxStationsCompleted: 0,
        estimatedCadenceSpm: null,
        title: "",
        notes: "",
        privacyRouteMode: "show",
        visibility: "followers",
        endedAtMs: null,
        distanceMeters: 0,
        elevationGainMeters: 0,
        calories: 0,
        externalActivityId: id,
      };
      setGpsStatus(def.usesGps ? "acquiring" : "idle");
      persist(next);
    },
    [userId, persist],
  );

  const setReady = useCallback(() => {
    const current = snapRef.current;
    if (!current || !canTransition(current.phase, "ready")) return;
    persist({ ...current, phase: "ready", updatedAtMs: Date.now() });
  }, [persist]);

  const setGpsDenied = useCallback(
    (denied: boolean) => {
      const current = snapRef.current;
      if (!current) return;
      persist({
        ...current,
        gpsDenied: denied,
        usesGps: denied ? false : getTrackActivity(current.activityId).usesGps,
        updatedAtMs: Date.now(),
      });
      setGpsStatus(denied ? "denied" : "acquiring");
    },
    [persist],
  );

  const start = useCallback(() => {
    const current = snapRef.current;
    if (!current) return;
    let base = current;
    if (base.phase === "preparing") {
      if (!canTransition(base.phase, "ready")) return;
      base = { ...base, phase: "ready", updatedAtMs: Date.now() };
      persist(base);
    }
    const ready = snapRef.current;
    if (!ready || !canTransition(ready.phase, "active")) return;
    const now = Date.now();
    const next: ActiveWorkoutSnapshot = {
      ...ready,
      phase: "active",
      startedAtMs: now,
      pausedMs: 0,
      pauseStartedAtMs: null,
      endedAtMs: null,
      updatedAtMs: now,
    };
    persist(next);
    beginTrackingHardware(next);
  }, [persist, beginTrackingHardware]);

  const pause = useCallback(() => {
    const current = snapRef.current;
    if (!current || !canTransition(current.phase, "paused")) return;
    const now = Date.now();
    persist({
      ...current,
      phase: "paused",
      pauseStartedAtMs: now,
      updatedAtMs: now,
    });
    stopGps();
  }, [persist, stopGps]);

  const resume = useCallback(() => {
    const current = snapRef.current;
    if (!current || !canResume(current.phase)) return;
    const now = Date.now();
    const extra =
      current.pauseStartedAtMs != null
        ? Math.max(0, now - current.pauseStartedAtMs)
        : 0;
    const next: ActiveWorkoutSnapshot = {
      ...current,
      phase: "active",
      pausedMs: current.pausedMs + extra,
      pauseStartedAtMs: null,
      updatedAtMs: now,
    };
    persist(next);
    beginTrackingHardware(next);
  }, [persist, beginTrackingHardware]);

  const requestFinish = useCallback(() => {
    const current = snapRef.current;
    if (!current || !canFinish(current.phase)) return;
    let pausedMs = current.pausedMs;
    if (current.phase === "paused" && current.pauseStartedAtMs != null) {
      pausedMs += Math.max(0, Date.now() - current.pauseStartedAtMs);
    }
    persist({
      ...current,
      phase: "finishing",
      pausedMs,
      pauseStartedAtMs: null,
      updatedAtMs: Date.now(),
    });
    stopGps();
  }, [persist, stopGps]);

  const confirmFinish = useCallback(() => {
    const current = snapRef.current;
    if (!current || !canTransition(current.phase, "completed")) return;
    const endedAtMs = Date.now();
    const withEnd = recomputeDerived({
      ...current,
      phase: "completed",
      endedAtMs,
      pauseStartedAtMs: null,
      updatedAtMs: endedAtMs,
    });
    if (!withEnd.title) {
      withEnd.title = withEnd.activityId.replace(/_/g, " ");
    }
    persist(withEnd);
    endTrackingHardware();
  }, [persist, recomputeDerived, endTrackingHardware]);

  const continueFromFinish = useCallback(() => {
    const current = snapRef.current;
    if (!current || !canTransition(current.phase, "active")) return;
    const next: ActiveWorkoutSnapshot = {
      ...current,
      phase: "active",
      pauseStartedAtMs: null,
      updatedAtMs: Date.now(),
    };
    persist(next);
    beginTrackingHardware(next);
  }, [persist, beginTrackingHardware]);

  const discard = useCallback(() => {
    endTrackingHardware();
    persist(null);
    setGpsStatus("idle");
  }, [persist, endTrackingHardware]);

  const addLap = useCallback(() => {
    const current = snapRef.current;
    if (!current || current.phase !== "active") return;
    persist({
      ...current,
      manualLaps: [
        ...current.manualLaps,
        { atMs: Date.now(), distanceMeters: current.distanceMeters },
      ],
      updatedAtMs: Date.now(),
    });
  }, [persist]);

  const logStrengthSet = useCallback(
    (input: { name: string; weightKg: number; reps: number }) => {
      const current = snapRef.current;
      if (!current || current.phase !== "active") return;
      const set: StrengthSetLog = {
        id: `set_${Date.now().toString(36)}`,
        atMs: Date.now(),
        name: input.name.trim() || "Set",
        weightKg: Math.max(0, input.weightKg),
        reps: Math.max(0, Math.floor(input.reps)),
      };
      persist({
        ...current,
        strengthSets: [...(current.strengthSets ?? []), set],
        updatedAtMs: Date.now(),
      });
    },
    [persist],
  );

  const completeHyroxStation = useCallback(() => {
    const current = snapRef.current;
    if (!current || current.phase !== "active") return;
    const next = Math.min(8, (current.hyroxStationsCompleted ?? 0) + 1);
    persist({
      ...current,
      hyroxStationsCompleted: next,
      updatedAtMs: Date.now(),
    });
  }, [persist]);

  const setManualDistanceMeters = useCallback(
    (meters: number) => {
      const current = snapRef.current;
      if (!current) return;
      const def = getTrackActivity(current.activityId);
      if (def.autoDistance) return;
      persist(
        recomputeDerived({
          ...current,
          distanceMeters: Math.max(0, meters),
        }),
      );
    },
    [persist, recomputeDerived],
  );

  const updateMeta = useCallback(
    (
      patch: Partial<
        Pick<
          ActiveWorkoutSnapshot,
          "title" | "notes" | "photoUrl" | "videoUrl" | "visibility" | "privacyRouteMode"
        >
      >,
    ) => {
      const current = snapRef.current;
      if (!current) return;
      persist({ ...current, ...patch, updatedAtMs: Date.now() });
    },
    [persist],
  );

  const clearLocal = useCallback(() => {
    persist(null);
    setGpsStatus("idle");
  }, [persist]);

  const elapsedSeconds = snapshot
    ? computeElapsedSeconds(snapshot, clockMs)
    : 0;
  const livePace = snapshot
    ? paceSecondsPerKm(snapshot.distanceMeters, elapsedSeconds)
    : null;
  const liveSpeed = snapshot
    ? speedKmh(snapshot.distanceMeters, elapsedSeconds)
    : null;
  const liveInstantPace = snapshot
    ? instantPaceSecondsPerKm(snapshot.points)
    : null;
  const liveInstantSpeed = snapshot
    ? instantSpeedKmh(snapshot.points)
    : null;

  const value: TrackWorkoutContextValue = {
    snapshot,
    elapsedSeconds,
    gpsStatus,
    paceSecondsPerKm: livePace,
    instantPaceSecondsPerKm: liveInstantPace,
    speedKmh: liveSpeed,
    instantSpeedKmh: liveInstantSpeed,
    prepare,
    setReady,
    setGpsDenied,
    start,
    pause,
    resume,
    requestFinish,
    confirmFinish,
    continueFromFinish,
    discard,
    addLap,
    logStrengthSet,
    completeHyroxStation,
    setManualDistanceMeters,
    updateMeta,
    loadExisting,
    clearLocal,
  };

  return (
    <TrackWorkoutContext.Provider value={value}>
      {children}
    </TrackWorkoutContext.Provider>
  );
}

export function useTrackWorkout() {
  const ctx = useContext(TrackWorkoutContext);
  if (!ctx) {
    throw new Error("useTrackWorkout must be used within TrackWorkoutProvider");
  }
  return ctx;
}

export type { WorkoutPhase, GpsStatus };
