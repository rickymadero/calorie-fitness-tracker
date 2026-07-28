import type { AtmosphereId, HeroMetricKey } from "@/lib/share/WorkoutShareModel";
import type { WorkoutPost } from "@/lib/types/posts";
import { getAtmosphere } from "@/lib/share/AtmosphereThemes";
import { buildWorkoutShareModel } from "@/lib/share/buildShareModel";
import {
  loadImage,
  renderShareCardToBlob,
} from "@/lib/share/CanvasRenderer";

export interface ShareCardInput {
  post: WorkoutPost;
  displayName: string;
  username: string;
  avatarUrl?: string;
  /** @deprecated Theme no longer drives map tiles; atmospheres control look. */
  theme?: "light" | "dark";
  atmosphereId?: AtmosphereId;
  heroKey?: HeroMetricKey;
  title?: string;
  showLocation?: boolean;
  showDate?: boolean;
  showUsername?: boolean;
  showRouteContext?: boolean;
}

/**
 * Evolve Stories export — Signal Badge via Canvas.
 * Preserves the historical entry point used by ShareStudio.
 */
export async function generateActivityShareImage(
  input: ShareCardInput,
): Promise<Blob> {
  const model = buildWorkoutShareModel({
    post: input.post,
    athlete: {
      displayName: input.displayName,
      username: input.username,
      avatarUrl: input.avatarUrl,
    },
    atmosphereId: input.atmosphereId,
    heroKey: input.heroKey,
    title: input.title,
    showLocation: input.showLocation,
    showDate: input.showDate,
    showUsername: input.showUsername,
    showRouteContext: input.showRouteContext,
  });
  const atmosphere = getAtmosphere(model.atmosphereId);
  const avatarImage = input.avatarUrl
    ? await loadImage(input.avatarUrl)
    : null;
  return renderShareCardToBlob({
    model,
    atmosphere,
    format: "stories",
    avatarImage,
  });
}
