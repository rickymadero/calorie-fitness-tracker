"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** iPhone 15 CSS viewport */
const IPHONE_15 = { id: "iphone-15", label: "iPhone 15", width: 390, height: 844 } as const;

const DEVICES = [
  IPHONE_15,
  { id: "iphone-se", label: "iPhone SE", width: 375, height: 667 },
  { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max", width: 430, height: 932 },
  { id: "pixel-7", label: "Pixel 7", width: 412, height: 915 },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

/**
 * Dev-only phone frame for Cursor Simple Browser.
 * Open: ⌘⇧B → Evolve: Mobile Preview → /dev/preview
 *
 * Important: do NOT CSS-scale the iframe (that made content look cut off).
 * The phone is the real 390×844 viewport; the page scrolls if the desk is smaller.
 *
 * Path input drives the iframe only on Enter / Reload — SPA navigation inside
 * the frame updates the path display without remounting.
 */
export default function DevPhonePreviewPage() {
  const [deviceId, setDeviceId] = useState<DeviceId>("iphone-15");
  const [pathInput, setPathInput] = useState("/profile");
  const [loadedSrc, setLoadedSrc] = useState("/profile");
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const device = useMemo(
    () => DEVICES.find((d) => d.id === deviceId) ?? IPHONE_15,
    [deviceId],
  );

  const src = loadedSrc.startsWith("/") ? loadedSrc : `/${loadedSrc}`;

  function commitPath(next?: string) {
    const raw = (next ?? pathInput).trim() || "/feed";
    const normalized = raw.startsWith("/") ? raw : `/${raw}`;
    setPathInput(normalized);
    setLoadedSrc(normalized);
    setIframeKey((k) => k + 1);
  }

  // Mirror in-app SPA navigations into the path field (same-origin).
  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        const loc = iframeRef.current?.contentWindow?.location;
        if (!loc || loc.origin === "null") return;
        const next = `${loc.pathname}${loc.search}${loc.hash}`;
        if (next && next !== pathInput) setPathInput(next);
      } catch {
        /* cross-origin or unloading */
      }
    }, 400);
    return () => window.clearInterval(id);
  }, [pathInput, iframeKey, deviceId]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#0c0e12] text-[#e8eaed]">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold tracking-wide">
            Evolve · Mobile Preview
          </p>
          <p className="text-[11px] text-white/45">
            Real {device.width}px viewport · HMR live
          </p>
        </div>

        <label className="ml-auto flex items-center gap-2 text-xs text-white/60">
          Device
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value as DeviceId)}
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-accent"
          >
            {DEVICES.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#12151b] text-white">
                {d.label} ({d.width}×{d.height})
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-white/60">
          Path
          <input
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitPath();
            }}
            className="w-40 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-accent sm:w-52"
            placeholder="/profile"
          />
        </label>

        <button
          type="button"
          onClick={() => commitPath()}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
        >
          Reload frame
        </button>
      </header>

      <div className="flex flex-1 justify-center overflow-auto p-6">
        <div
          className="relative shrink-0 rounded-[2.75rem] border border-white/20 bg-black px-[10px] pb-[10px] pt-[38px] shadow-[0_25px_80px_rgba(0,0,0,0.65)]"
          style={{
            width: device.width + 20,
            height: device.height + 48,
          }}
        >
          {/* Dynamic Island sits in the top bezel — not over app chrome */}
          <div className="pointer-events-none absolute left-1/2 top-[14px] z-20 h-[26px] w-[100px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
          <iframe
            ref={iframeRef}
            key={`${iframeKey}-${device.id}`}
            title="Evolve iPhone preview"
            src={src}
            width={device.width}
            height={device.height}
            className="block rounded-[2.15rem] border-0 bg-background"
            style={{ width: device.width, height: device.height }}
          />
        </div>
      </div>
    </div>
  );
}
