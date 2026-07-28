import type { WorkoutPost } from "@/lib/types/posts";

export function buildShareCaption(
  post: WorkoutPost,
  name: string,
  username: string,
  link: string,
  title: string,
): string {
  const bits: string[] = [
    `${title} — ${post.type}`,
    "Put in the work. Here's the signal. Tracked with Evolve.",
  ];
  if (post.distanceKm != null) bits.push(`${post.distanceKm} km`);
  bits.push(`by ${name} (@${username})`);
  bits.push(link);
  return bits.join(" · ");
}

export function downloadShareBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function shareNativePayload(options: {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}): Promise<"shared" | "copied" | "cancelled" | "no_files"> {
  const { title, text, url, files } = options;
  try {
    if (files?.length) {
      if (navigator.canShare?.({ files })) {
        await navigator.share({ files, title, text });
        return "shared";
      }
      return "no_files";
    }
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "cancelled";
  }
}

export async function saveImageOnDevice(
  blob: Blob,
  filename: string,
  shareNative: (files?: File[]) => Promise<void>,
): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && navigator.canShare?.({ files: [file] })) {
    await shareNative([file]);
    return "shared";
  }
  downloadShareBlob(blob, filename);
  return "downloaded";
}
