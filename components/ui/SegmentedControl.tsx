"use client";

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
 * Enforces 44px tap targets.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  scroll = false,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex gap-1 rounded-full bg-muted-bg p-1 ${
        scroll ? "-mx-1 overflow-x-auto px-1 hide-scrollbar" : ""
      } ${className}`}
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
            className={`relative min-h-11 flex-1 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors ${
              scroll ? "shrink-0" : ""
            } ${active ? "text-accent-fg" : "text-muted hover:text-foreground"}`}
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
  );
}
