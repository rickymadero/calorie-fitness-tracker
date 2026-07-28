import type { ShareExportFormat } from "@/lib/share/WorkoutShareModel";

export interface ExportDimensions {
  width: number;
  height: number;
  /** Content inset so Stories chrome doesn't clip. */
  safeMargin: number;
}

/** Primary Stories size; portrait/square stubs for later formats. */
export const EXPORT_DIMENSIONS: Record<ShareExportFormat, ExportDimensions> = {
  stories: { width: 1080, height: 1920, safeMargin: 80 },
  portrait: { width: 1080, height: 1350, safeMargin: 64 },
  square: { width: 1080, height: 1080, safeMargin: 56 },
};

export function getExportDimensions(
  format: ShareExportFormat = "stories",
): ExportDimensions {
  return EXPORT_DIMENSIONS[format];
}
