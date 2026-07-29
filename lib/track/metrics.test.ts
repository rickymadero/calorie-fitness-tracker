import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDistanceSplits,
  formatDuration,
  formatPace,
  haversineMeters,
  paceSecondsPerKm,
  pathDistanceMeters,
  speedKmh,
} from "./metrics";
import {
  canTransition,
  transition,
  canFinish,
  canAddGpsPoints,
} from "./WorkoutStateMachine";
import {
  isAcceptableAccuracy,
  shouldAcceptGpsPoint,
  type GpsSample,
} from "./gpsFilter";

describe("haversineMeters", () => {
  it("returns ~0 for identical points", () => {
    const p = { latitude: 40.7128, longitude: -74.006 };
    assert.ok(haversineMeters(p, p) < 0.01);
  });

  it("measures ~1km north at equator", () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 0.009, longitude: 0 }; // ~1 km
    const d = haversineMeters(a, b);
    assert.ok(d > 900 && d < 1100, `got ${d}`);
  });
});

describe("pathDistanceMeters", () => {
  it("sums segments", () => {
    const points = [
      { latitude: 0, longitude: 0 },
      { latitude: 0.009, longitude: 0 },
      { latitude: 0.018, longitude: 0 },
    ];
    const d = pathDistanceMeters(points);
    assert.ok(d > 1800 && d < 2200, `got ${d}`);
  });
});

describe("pace and speed", () => {
  it("computes 5:00 /km for 1km in 300s", () => {
    assert.equal(paceSecondsPerKm(1000, 300), 300);
    assert.equal(formatPace(300), "5:00");
  });

  it("returns null for tiny distance", () => {
    assert.equal(paceSecondsPerKm(1, 60), null);
  });

  it("computes 10 km/h for 5km in 30min", () => {
    const s = speedKmh(5000, 1800);
    assert.ok(s != null && Math.abs(s - 10) < 0.01);
  });
});

describe("formatDuration", () => {
  it("formats mm:ss and h:mm:ss", () => {
    assert.equal(formatDuration(65), "1:05");
    assert.equal(formatDuration(3661), "1:01:01");
  });
});

describe("buildDistanceSplits", () => {
  it("creates 1km splits along a path", () => {
    const start = Date.now();
    const points = [];
    for (let i = 0; i <= 20; i++) {
      points.push({
        latitude: i * 0.009, // ~1km each
        longitude: 0,
        recordedAt: start + i * 300_000,
      });
    }
    const splits = buildDistanceSplits(points, start, 1000);
    assert.ok(splits.length >= 2);
    assert.equal(splits[0]!.splitNumber, 1);
  });
});

describe("WorkoutStateMachine", () => {
  it("allows start and pause/resume/finish", () => {
    assert.equal(canTransition("ready", "active"), true);
    assert.equal(canTransition("active", "paused"), true);
    assert.equal(canTransition("paused", "active"), true);
    assert.equal(canFinish("active"), true);
    assert.equal(canAddGpsPoints("paused"), false);
    assert.equal(transition("active", "finishing"), "finishing");
  });

  it("rejects invalid transitions", () => {
    assert.equal(canTransition("idle", "active"), false);
    assert.throws(() => transition("idle", "active"));
  });
});

describe("gpsFilter", () => {
  const base: GpsSample = {
    latitude: 40.0,
    longitude: -74.0,
    accuracyMeters: 10,
    speedMps: 2,
    recordedAt: 1_000_000,
  };

  it("rejects poor accuracy", () => {
    assert.equal(isAcceptableAccuracy(80), false);
    assert.equal(isAcceptableAccuracy(20), true);
  });

  it("rejects impossible jumps", () => {
    const next: GpsSample = {
      ...base,
      latitude: 41.0,
      recordedAt: 1_000_100,
      accuracyMeters: 10,
    };
    assert.equal(
      shouldAcceptGpsPoint(base, next, { activityUsesSpeed: false }),
      false,
    );
  });

  it("accepts first good point", () => {
    assert.equal(
      shouldAcceptGpsPoint(null, base, { activityUsesSpeed: false }),
      true,
    );
  });

  it("rejects while paused", () => {
    assert.equal(
      shouldAcceptGpsPoint(null, base, { paused: true }),
      false,
    );
  });
});
