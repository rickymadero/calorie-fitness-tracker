"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { usePosts } from "@/components/posts/PostsProvider";
import { useToast } from "@/components/providers/ToastProvider";
import type { ActivityType, PostVisibility } from "@/lib/types/posts";

const TYPES: { id: ActivityType; label: string }[] = [
  { id: "running", label: "Running" },
  { id: "walking", label: "Walking" },
  { id: "cycling", label: "Cycling" },
  { id: "hiking", label: "Hiking" },
  { id: "swimming", label: "Swimming" },
  { id: "gym", label: "Gym" },
  { id: "yoga", label: "Yoga" },
  { id: "sports", label: "Sports" },
  { id: "custom", label: "Custom" },
];

export function ActivityTypePicker({
  value,
  onChange,
}: {
  value: ActivityType;
  onChange: (t: ActivityType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            value === t.id
              ? "border-accent bg-accent-soft text-accent-dim dark:text-accent"
              : "border-border text-muted"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function CreatePostForm() {
  const { createPost } = usePosts();
  const { toast } = useToast();
  const router = useRouter();

  const [type, setType] = useState<ActivityType>("running");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [gymSummary, setGymSummary] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const needsDistance = ["running", "walking", "cycling", "swimming"].includes(
    type,
  );
  const needsGym = type === "gym";

  function onPhoto(file: File | null) {
    if (!file) {
      setPhotoUrl(undefined);
      return;
    }
    if (file.size > 2_000_000) {
      toast("Keep photos under 2MB for this demo.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast("Add a title for your workout.", "error");
      return;
    }
    setSaving(true);
    const post = createPost({
      type,
      title: title.trim(),
      caption: caption.trim(),
      occurredAt: new Date().toISOString(),
      visibility,
      photoUrl,
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      durationMin: durationMin ? Number(durationMin) : undefined,
      gymSummary: needsGym ? gymSummary.trim() || undefined : undefined,
    });
    setSaving(false);
    if (!post) {
      toast("Could not publish. Try again.", "error");
      return;
    }
    toast("Workout published.", "success");
    router.push(`/posts/${post.id}`);
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium">Activity type</p>
          <ActivityTypePicker value={type} onChange={setType} />
        </div>

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Morning 5K"
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 280))}
            rows={3}
            placeholder="How did it feel? Add a hashtag…"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </div>

        {needsDistance && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Distance (km)"
              type="number"
              step="0.1"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder="5"
            />
            <Input
              label="Duration (min)"
              type="number"
              min="0"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="28"
            />
          </div>
        )}

        {!needsDistance && (
          <Input
            label="Duration (min)"
            type="number"
            min="0"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="45"
          />
        )}

        {needsGym && (
          <Input
            label="Gym summary"
            value={gymSummary}
            onChange={(e) => setGymSummary(e.target.value)}
            placeholder="10x10 squats, 8x8 deadlifts"
          />
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Who can see this</p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "public", label: "Public" },
                { id: "followers", label: "Followers" },
                { id: "private", label: "Only me" },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVisibility(v.id)}
                className={`rounded-2xl border py-2.5 text-sm font-medium ${
                  visibility === v.id
                    ? "border-accent bg-accent-soft"
                    : "border-border"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-muted-bg file:px-4 file:py-2 file:text-sm file:font-medium"
          />
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="mt-3 max-h-48 rounded-2xl object-cover"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={saving}>
            Publish workout
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
