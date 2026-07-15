"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { RoutePoint } from "@/lib/types/posts";
import { useTheme } from "@/components/providers/ThemeProvider";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
  points?: RoutePoint[];
  hideStart?: boolean;
  hideEnd?: boolean;
  routeVisible?: boolean;
  href?: string;
  height?: number;
  label?: string;
  interactive?: boolean;
}

function MapFallback({ height, message }: { height: number; message: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-border bg-muted-bg text-sm text-muted"
      style={{ height }}
    >
      {message}
    </div>
  );
}

/**
 * Street map route preview (Leaflet + Carto Voyager tiles).
 * Shows roads and buildings like Google Maps — no API key required.
 */
export function RouteMapPreview({
  points,
  hideStart,
  hideEnd,
  routeVisible = true,
  href,
  height = 180,
  label = "Route map",
  interactive = true,
}: RouteMapProps) {
  if (routeVisible === false) {
    return <MapFallback height={height} message="Route hidden by privacy settings" />;
  }

  if (!points || points.length < 2) {
    return <MapFallback height={height} message="Map unavailable" />;
  }

  // Feed cards (href) and interactive=false must not steal page scroll on iOS.
  const canInteract = interactive && !href;
  const map = (
    <LeafletRouteMap
      points={points}
      hideStart={hideStart}
      hideEnd={hideEnd}
      height={height}
      label={label}
      scrollWheel={canInteract}
      dragging={canInteract}
    />
  );

  const frame = (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-muted-bg shadow-apex"
      style={{ height }}
    >
      {map}
      {/* Soft Evolve gradient fade at bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/25 to-transparent dark:from-black/40" />
    </div>
  );

  if (href && interactive) {
    return (
      <Link href={href} className="block" aria-label="Open full route">
        {frame}
      </Link>
    );
  }

  return frame;
}

function LeafletRouteMap({
  points,
  hideStart,
  hideEnd,
  height,
  label,
  scrollWheel,
  dragging,
}: {
  points: RoutePoint[];
  hideStart?: boolean;
  hideEnd?: boolean;
  height: number;
  label: string;
  scrollWheel: boolean;
  dragging: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    async function boot() {
      if (!containerRef.current) return;
      try {
        const L = (await import("leaflet")).default;

        if (cancelled || !containerRef.current) return;

        // Tear down previous instance (theme / remount)
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const latLngs = points.map(
          (p) => [p.lat, p.lng] as [number, number],
        );

        map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: true,
          scrollWheelZoom: scrollWheel,
          dragging,
          doubleClickZoom: scrollWheel,
          boxZoom: false,
          keyboard: false,
          touchZoom: scrollWheel,
          preferCanvas: true,
        });
        mapRef.current = map;
        if (!dragging) {
          // Let the page scroll under non-interactive feed/detail maps on iOS
          containerRef.current.style.touchAction = "pan-y";
        }

        // Voyager = streets + buildings (Google Maps–like). Dark Matter for dark theme.
        const isDark = theme === "dark";
        const tiles = isDark
          ? L.tileLayer(
              "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
              {
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: "abcd",
                maxZoom: 20,
              },
            )
          : L.tileLayer(
              "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
              {
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: "abcd",
                maxZoom: 20,
              },
            );
        tiles.addTo(map);

        const route = L.polyline(latLngs, {
          color: isDark ? "#22d484" : "#1dbf73",
          weight: 5,
          opacity: 0.95,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);

        const startIcon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:999px;background:${isDark ? "#22d484" : "#1dbf73"};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const endIcon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:999px;background:#0a0a0a;border:2.5px solid ${isDark ? "#22d484" : "#1dbf73"};box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        if (!hideStart) {
          L.marker(latLngs[0], { icon: startIcon, interactive: false }).addTo(map);
        }
        if (!hideEnd) {
          L.marker(latLngs[latLngs.length - 1], {
            icon: endIcon,
            interactive: false,
          }).addTo(map);
        }

        map.fitBounds(route.getBounds(), { padding: [28, 28], maxZoom: 16 });
        // Fix gray tiles when container was hidden / size unknown
        requestAnimationFrame(() => {
          map?.invalidateSize();
          setLoading(false);
        });
      } catch {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points, hideStart, hideEnd, theme, scrollWheel, dragging]);

  if (failed) {
    return <MapFallback height={height} message="Map could not load" />;
  }

  return (
    <div className="relative h-full w-full" aria-label={label}>
      {loading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-muted-bg text-xs text-muted">
          Loading map…
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" style={{ height }} />
    </div>
  );
}
