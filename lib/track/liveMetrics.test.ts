import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appendPaceSample,
  estimateCadenceSpm,
  formatHeroMetric,
  heroKindForActivity,
} from "./liveMetrics";

describe("heroKindForActivity", () => {
  it("maps sports to hero kinds", () => {
    assert.equal(heroKindForActivity("running"), "distance");
    assert.equal(heroKindForActivity("hiking"), "elevation");
    assert.equal(heroKindForActivity("swimming"), "laps");
    assert.equal(heroKindForActivity("strength"), "volume");
    assert.equal(heroKindForActivity("hyrox"), "duration");
  });
});

describe("formatHeroMetric", () => {
  it("formats km distance", () => {
    const h = formatHeroMetric({
      kind: "distance",
      distanceMeters: 8500,
      elevationGainMeters: 0,
      elapsedSeconds: 0,
      lapCount: 0,
      volumeKg: 0,
      units: "metric",
    });
    assert.equal(h.value, "8.50");
    assert.equal(h.unit, "km");
  });
});

describe("estimateCadenceSpm", () => {
  it("returns null when too slow", () => {
    assert.equal(estimateCadenceSpm(2), null);
  });
  it("estimates mid-run cadence", () => {
    const c = estimateCadenceSpm(10);
    assert.ok(c != null && c >= 140 && c <= 190);
  });
});

describe("appendPaceSample", () => {
  it("throttles dense samples", () => {
    const a = appendPaceSample(
      [],
      { atMs: 1000, distanceMeters: 0, paceSecondsPerKm: 300, speedKmh: 12 },
      15_000,
    );
    const b = appendPaceSample(
      a,
      { atMs: 2000, distanceMeters: 10, paceSecondsPerKm: 310, speedKmh: 11 },
      15_000,
    );
    assert.equal(b.length, 1);
    const c = appendPaceSample(
      b,
      { atMs: 20_000, distanceMeters: 100, paceSecondsPerKm: 290, speedKmh: 12 },
      15_000,
    );
    assert.equal(c.length, 2);
  });
});
