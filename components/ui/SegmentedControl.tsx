"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Segment<T extends string> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Scroll horizontally instead of wrapping (good for many/long tabs). */
  scroll?: boolean;
  className?: string;
}

/**
 * Mobile-first segmented tabs with a sliding active pill.
 * Scroll mode uses an outer clip + inner w-max track so long i18n labels
 * never widen the 390px phone frame (flex min-content was blowing past it).
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  scroll = false,
  className = "",
}: SegmentedControlProps<T>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!scroll) return;
    const scroller = scrollerRef.current;
    const btn = activeRef.current;
    if (!scroller || !btn) return;
    const target =
      btn.offsetLeft - (scroller.clientWidth - btn.offsetWidth) / 2;
    scroller.scrollTo({
      left: Math.max(0, target),
      behavior: "smooth",
    });
  }, [value, scroll, segments]);

  if (!scroll) {
    return (
      <div
        className={`flex w-full min-w-0 gap-1 rounded-full bg-muted-bg p-1 ${className}`}
        role="tablist"
      >
        {segments.map((s) => {
          const active = s.id === value;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(s.id)}
              className={`relative min-h-11 min-w-0 flex-1 rounded-full px-2 text-sm font-medium transition-colors sm:px-4 ${
                active ? "text-accent-fg" : "text-muted hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`segment-${segments.map((x) => x.id).join("-")}`}
                  className="absolute inset-0 rounded-full bg-accent shadow-apex"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 line-clamp-2 leading-tight">
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      className={`w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain touch-pan-x hide-scrollbar ${className}`}
      role="tablist"
    >
      <div className="inline-flex w-max min-w-full gap-1 rounded-full bg-muted-bg p-1">
        {segments.map((s) => {
          const active = s.id === value;
          return (
            <button
              key={s.id}
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(s.id)}
              className={`relative min-h-11 shrink-0 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors ${
                active ? "text-accent-fg" : "text-muted hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`segment-${segments.map((x) => x.id).join("-")}`}
                  className="absolute inset-0 rounded-full bg-accent shadow-apex"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
