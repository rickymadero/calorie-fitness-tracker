import { resolveAtmosphereId } from "@/lib/share/AtmosphereThemes";
import {
  collectAvailableMetrics,
  defaultShareTitle,
  pickHeroMetric,
  pickSupportingMetrics,
  signalKindForType,
} from "@/lib/share/HeroMetricSelector";
import { extractShareRoutePoints } from "@/lib/share/routeContext";
import { generateSignalPoints } from "@/lib/share/WorkoutSignalGenerator";
import type {
  BuildShareModelInput,
  WorkoutShareModel,
} from "@/lib/share/WorkoutShareModel";

export function buildWorkoutShareModel(
  input: BuildShareModelInput,
): WorkoutShareModel {
  const {
    post,
    athlete,
    heroKey,
    atmosphereId,
    title,
    showLocation = Boolean(post.locationName),
    showDate = true,
    showUsername = false,
  } = input;

  const routePoints = extractShareRoutePoints(post);
  const showRouteContext =
    input.showRouteContext ?? routePoints.length >= 2;

  const availableHeroes = collectAvailableMetrics(post);
  const hero =
    pickHeroMetric(post, heroKey) ??
    ({
      key: "duration" as const,
      label: "Session",
      value: "—",
    } as const);
  const supporting = pickSupportingMetrics(post, hero.key, 4);

  return {
    activityId: post.id,
    activityType: post.type,
    signalKind: signalKindForType(post.type),
    hero,
    supporting,
    availableHeroes,
    athlete,
    title: (title?.trim() || defaultShareTitle(post)).slice(0, 48),
    startedAt: post.occurredAt || post.createdAt,
    location: post.locationName,
    routePoints: routePoints.length >= 2 ? routePoints : undefined,
    signalPoints: generateSignalPoints(post),
    atmosphereId: resolveAtmosphereId(atmosphereId),
    templateId: "signal_core",
    showLocation,
    showDate,
    showUsername,
    showRouteContext: showRouteContext && routePoints.length >= 2,
  };
}
