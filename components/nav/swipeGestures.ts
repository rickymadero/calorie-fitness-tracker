"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const EDGE_PX = 28;
const MIN_DX = 72;
const MAX_DY = 56;

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, button, a, [role='button'], [contenteditable='true']",
    ),
  );
}

function goBack(router: ReturnType<typeof useRouter>, fallbackHref: string) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.push(fallbackHref);
  }
}

/**
 * Edge swipe / drag right → go back.
 * Works with finger (touch) and mouse / trackpad click-drag (pointer).
 */
export function useSwipeBack(fallbackHref: string) {
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const locked = useRef(false);
  const pointerId = useRef<number | null>(null);

  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;
      if (e.clientX > EDGE_PX) {
        tracking.current = false;
        return;
      }
      tracking.current = true;
      locked.current = false;
      pointerId.current = e.pointerId;
      startX.current = e.clientX;
      startY.current = e.clientY;
    }

    function onMove(e: PointerEvent) {
      if (!tracking.current || locked.current) return;
      if (pointerId.current != null && e.pointerId !== pointerId.current) return;
      const dx = e.clientX - startX.current;
      const dy = Math.abs(e.clientY - startY.current);
      if (dy > MAX_DY && dy > Math.abs(dx)) {
        tracking.current = false;
        return;
      }
      if (dx >= MIN_DX && dx > dy) {
        locked.current = true;
        tracking.current = false;
        pointerId.current = null;
        goBack(router, fallbackHref);
      }
    }

    function onUp(e: PointerEvent) {
      if (pointerId.current != null && e.pointerId !== pointerId.current) return;
      tracking.current = false;
      pointerId.current = null;
    }

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, [router, fallbackHref]);
}

/**
 * Swipe / drag left on Feed → Messages.
 * Finger or mouse / trackpad click-drag.
 */
export function useSwipeToMessages(enabled = true) {
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const locked = useRef(false);
  const pointerId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function onDown(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;
      // Leave left edge for swipe-back on other pages
      if (e.clientX < EDGE_PX) {
        tracking.current = false;
        return;
      }
      tracking.current = true;
      locked.current = false;
      pointerId.current = e.pointerId;
      startX.current = e.clientX;
      startY.current = e.clientY;
    }

    function onMove(e: PointerEvent) {
      if (!tracking.current || locked.current) return;
      if (pointerId.current != null && e.pointerId !== pointerId.current) return;
      const dx = e.clientX - startX.current;
      const dy = Math.abs(e.clientY - startY.current);
      if (dy > MAX_DY && dy > Math.abs(dx)) {
        tracking.current = false;
        return;
      }
      if (dx <= -MIN_DX && Math.abs(dx) > dy) {
        locked.current = true;
        tracking.current = false;
        pointerId.current = null;
        router.push("/messages");
      }
    }

    function onUp(e: PointerEvent) {
      if (pointerId.current != null && e.pointerId !== pointerId.current) return;
      tracking.current = false;
      pointerId.current = null;
    }

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, [router, enabled]);
}
