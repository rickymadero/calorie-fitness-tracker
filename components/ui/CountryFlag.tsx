"use client";

import {
  countryName,
  flagEmoji,
  normalizeCountryCode,
} from "@/lib/geo/countryFlag";

/** Renders a country flag emoji from an ISO alpha-2 code or country name. */
export function CountryFlag({
  code,
  className = "",
  size = "md",
}: {
  code?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const cc = normalizeCountryCode(code) ?? code?.toUpperCase();
  const emoji = flagEmoji(cc);
  if (!emoji || !cc) return null;
  const label = countryName(cc) ?? cc;
  const text =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-block leading-none ${text} ${className}`}
    >
      {emoji}
    </span>
  );
}
