/** Dual-camera capture helpers for fitness stories (BeReal-style). */

export function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((t) => t.stop());
}

export async function queryCameraPermission(): Promise<
  "granted" | "denied" | "prompt" | "unknown"
> {
  try {
    const status = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    return status.state as "granted" | "denied" | "prompt";
  } catch {
    return "unknown";
  }
}

export async function openCamera(
  facing: "user" | "environment",
  deviceId?: string,
): Promise<MediaStream> {
  const video: MediaTrackConstraints = deviceId
    ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 1920 } }
    : {
        facingMode: { ideal: facing },
        width: { ideal: 1280 },
        height: { ideal: 1920 },
      };
  return navigator.mediaDevices.getUserMedia({ video, audio: false });
}

export function waitForVideoReady(
  video: HTMLVideoElement,
  timeoutMs = 4500,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("Camera timed out"));
        return;
      }
      requestAnimationFrame(tick);
    };
    video.addEventListener("loadedmetadata", () => tick(), { once: true });
    tick();
  });
}

export async function attachStream(
  video: HTMLVideoElement,
  stream: MediaStream,
) {
  video.style.visibility = "visible";
  video.muted = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.srcObject = stream;
  try {
    await video.play();
  } catch {
    /* gesture / autoplay — metadata wait still helps */
  }
  await waitForVideoReady(video);
}

export function captureFrame(
  video: HTMLVideoElement,
  opts?: { mirror?: boolean; quality?: number },
): string | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (opts?.mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", opts?.quality ?? 0.85);
}

function trackStillLive(stream: MediaStream | null) {
  return !!stream?.getTracks().some((t) => t.readyState === "live");
}

/**
 * BeReal live preview: rear = full frame, front = PiP when the device allows
 * two concurrent video inputs.
 */
export async function startDualPreview(opts: {
  rearVideo: HTMLVideoElement;
  frontVideo: HTMLVideoElement;
}): Promise<{
  rearStream: MediaStream | null;
  frontStream: MediaStream | null;
  dualLive: boolean;
}> {
  let rearStream: MediaStream | null = null;
  let frontStream: MediaStream | null = null;

  try {
    rearStream = await openCamera("environment").catch(() =>
      openCamera("user"),
    );
    await attachStream(opts.rearVideo, rearStream);
  } catch {
    return { rearStream: null, frontStream: null, dualLive: false };
  }

  const rearId = rearStream.getVideoTracks()[0]?.getSettings()?.deviceId;

  // After permission, labels/deviceIds are available — pick a different camera
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter((d) => d.kind === "videoinput");
    const other = cams.find((c) => c.deviceId && c.deviceId !== rearId);

    if (other?.deviceId) {
      try {
        frontStream = await openCamera("user", other.deviceId);
        // Confirm rear survived (some phones kill the first stream)
        if (!trackStillLive(rearStream)) {
          stopStream(frontStream);
          frontStream = null;
          rearStream = await openCamera("environment").catch(() =>
            openCamera("user"),
          );
          await attachStream(opts.rearVideo, rearStream);
        } else {
          await attachStream(opts.frontVideo, frontStream);
        }
      } catch {
        stopStream(frontStream);
        frontStream = null;
      }
    }

    // Fallback: ask for user-facing without an explicit deviceId
    if (!frontStream) {
      try {
        frontStream = await openCamera("user");
        if (!trackStillLive(rearStream)) {
          stopStream(frontStream);
          frontStream = null;
          rearStream = await openCamera("environment").catch(() =>
            openCamera("user"),
          );
          await attachStream(opts.rearVideo, rearStream);
        } else {
          await attachStream(opts.frontVideo, frontStream);
        }
      } catch {
        stopStream(frontStream);
        frontStream = null;
      }
    }
  } catch {
    /* keep rear-only preview */
  }

  const dualLive = trackStillLive(rearStream) && trackStillLive(frontStream);
  return { rearStream, frontStream, dualLive };
}

/**
 * One shutter → scene + selfie (simultaneous when both streams are live).
 */
export async function snapBothCameras(opts: {
  rearVideo: HTMLVideoElement;
  frontVideo: HTMLVideoElement;
  rearStream: MediaStream | null;
  frontStream: MediaStream | null;
}): Promise<{ rear: string; front: string }> {
  const { rearVideo, frontVideo, rearStream, frontStream } = opts;

  if (trackStillLive(rearStream) && trackStillLive(frontStream)) {
    const rear = captureFrame(rearVideo);
    const front =
      captureFrame(frontVideo, { mirror: true }) ?? captureFrame(frontVideo);
    if (rear && front) {
      stopStream(rearStream);
      stopStream(frontStream);
      return { rear, front };
    }
  }

  let rearUrl: string | null = null;
  if (trackStillLive(rearStream)) {
    rearUrl = captureFrame(rearVideo);
    stopStream(rearStream);
  }

  if (!rearUrl) {
    const stream = await openCamera("environment").catch(() =>
      openCamera("user"),
    );
    try {
      await attachStream(rearVideo, stream);
      rearUrl = captureFrame(rearVideo);
    } finally {
      stopStream(stream);
    }
  }

  let frontUrl: string | null = null;
  if (trackStillLive(frontStream)) {
    frontUrl =
      captureFrame(frontVideo, { mirror: true }) ?? captureFrame(frontVideo);
    stopStream(frontStream);
  } else {
    const stream = await openCamera("user");
    try {
      await attachStream(frontVideo, stream);
      frontUrl =
        captureFrame(frontVideo, { mirror: true }) ??
        captureFrame(frontVideo);
    } finally {
      stopStream(stream);
    }
  }

  if (!rearUrl || !frontUrl) {
    throw new Error("Could not capture both cameras");
  }

  return { rear: rearUrl, front: frontUrl };
}

export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 1280;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
