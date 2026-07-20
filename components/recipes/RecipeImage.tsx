"use client";

import { useState } from "react";

/** Reliable meal fallback if a remote URL 404s or fails to load. */
export const RECIPE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

export function RecipeImage({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (current !== RECIPE_IMAGE_FALLBACK) setCurrent(RECIPE_IMAGE_FALLBACK);
      }}
    />
  );
}
