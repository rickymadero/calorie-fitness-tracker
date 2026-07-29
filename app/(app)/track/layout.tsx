"use client";

import { TrackWorkoutProvider } from "@/components/track/TrackWorkoutProvider";

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TrackWorkoutProvider>{children}</TrackWorkoutProvider>;
}
