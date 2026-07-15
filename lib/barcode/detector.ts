export type DetectedBarcode = {
  rawValue: string;
  format?: string;
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string; format?: string }>>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorLike;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export function supportsBarcodeDetector(): boolean {
  return typeof window !== "undefined" && typeof window.BarcodeDetector === "function";
}

export async function createBarcodeDetector(): Promise<BarcodeDetectorLike | null> {
  if (!supportsBarcodeDetector() || !window.BarcodeDetector) return null;
  try {
    return new window.BarcodeDetector({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
    });
  } catch {
    try {
      return new window.BarcodeDetector();
    } catch {
      return null;
    }
  }
}

export async function detectFromVideo(
  detector: BarcodeDetectorLike,
  video: HTMLVideoElement,
): Promise<DetectedBarcode | null> {
  if (video.readyState < 2) return null;
  try {
    const codes = await detector.detect(video);
    const first = codes[0];
    if (!first?.rawValue) return null;
    return { rawValue: first.rawValue, format: first.format };
  } catch {
    return null;
  }
}
