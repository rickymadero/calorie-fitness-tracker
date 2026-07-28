"use client";

import { useState } from "react";
import { Utensils } from "lucide-react";

export function RecipeImage({
  src,
  alt = "",
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  if (!showPhoto) {
    return (
      <div
        className={`flex items-center justify-center bg-muted-bg text-muted ${className ?? ""}`}
        role="img"
        aria-label={alt || "Recipe"}
      >
        <Utensils size={28} strokeWidth={1.5} aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src!}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
