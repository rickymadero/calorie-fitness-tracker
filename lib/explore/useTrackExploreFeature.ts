"use client";

import { useEffect } from "react";
import {
  exploreUsageStorage,
  type ExploreFeatureUsageKey,
} from "@/lib/storage/exploreUsage";

/** Count a visit to a Pro/explore tool so For You can rank it higher. */
export function useTrackExploreFeature(
  userId: string | undefined,
  feature: ExploreFeatureUsageKey | null,
) {
  useEffect(() => {
    if (!userId || !feature) return;
    // One count per browser tab session per feature (avoids Strict Mode / remount noise).
    try {
      const key = `evolve.explore.tracked.${userId}.${feature}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode */
    }
    exploreUsageStorage.record(userId, feature);
  }, [userId, feature]);
}
