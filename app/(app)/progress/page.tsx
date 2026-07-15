"use client";

import { useState } from "react";
import { Camera, Ruler, Scale, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { ProGate } from "@/components/pro/ProGate";

const MEASUREMENTS = [
  { label: "Chest", value: "102 cm" },
  { label: "Waist", value: "84 cm" },
  { label: "Hips", value: "96 cm" },
  { label: "Arms", value: "36 cm" },
];

export default function ProgressPage() {
  const { user, onboarding, updateOnboarding } = useAuth();
  const { toast } = useToast();
  const [weightOpen, setWeightOpen] = useState(false);
  const [measureOpen, setMeasureOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [photos, setPhotos] = useState<{ id: string; label: string }[]>([]);
  const unit =
    (user?.measurementSystem || onboarding.measurementSystem) === "imperial"
      ? "lb"
      : "kg";

  const currentWeight =
    typeof onboarding.currentWeight === "number" ? onboarding.currentWeight : 78.4;
  const goalWeight =
    typeof onboarding.targetWeight === "number" ? onboarding.targetWeight : 72;

  const weightHistory = [
    { date: "Jun 1", value: Math.round((currentWeight + 2.8) * 10) / 10 },
    { date: "Jun 8", value: Math.round((currentWeight + 2.1) * 10) / 10 },
    { date: "Jun 15", value: Math.round((currentWeight + 1.4) * 10) / 10 },
    { date: "Jun 22", value: Math.round((currentWeight + 0.7) * 10) / 10 },
    { date: "Jun 29", value: Math.round((currentWeight + 0.3) * 10) / 10 },
    { date: "Today", value: currentWeight },
  ];
  const maxW = Math.max(...weightHistory.map((w) => w.value));
  const minW = Math.min(...weightHistory.map((w) => w.value));
  const change = Math.round((weightHistory[0].value - currentWeight) * 10) / 10;

  return (
    <ProGate feature="Progress analytics">
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Progress
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track weight, measurements, photos, and adherence over time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setMeasureOpen(true)}>
            <Ruler size={16} />
            Measurements
          </Button>
          <Button variant="outline" onClick={() => setPhotoOpen(true)}>
            <Camera size={16} />
            Photo
          </Button>
          <Button onClick={() => setWeightOpen(true)}>
            <Scale size={16} />
            Log weight
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card elevated className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Weight trend</h2>
            <Badge variant="accent">
              {change > 0 ? "−" : change < 0 ? "+" : ""}
              {Math.abs(change)} {unit} this month
            </Badge>
          </div>
          <div className="mt-8 flex h-48 items-end gap-3">
            {weightHistory.map((point) => {
              const pct = ((point.value - minW) / (maxW - minW || 1)) * 100;
              const height = 40 + pct * 0.9;
              return (
                <div
                  key={point.date}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-[10px] text-muted">{point.value}</span>
                  <div
                    className="w-full max-w-[48px] rounded-t-xl bg-accent"
                    style={{ height }}
                  />
                  <span className="text-[10px] text-muted">{point.date}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-muted">
            Current: <strong className="text-foreground">{currentWeight} {unit}</strong>
            {" · "}
            Goal: <strong className="text-foreground">{goalWeight} {unit}</strong>
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">Body measurements</h2>
          <ul className="mt-4 space-y-3">
            {MEASUREMENTS.map((m) => (
              <li
                key={m.label}
                className="flex justify-between rounded-xl bg-muted-bg px-3 py-2 text-sm"
              >
                <span>{m.label}</span>
                <span className="font-medium">{m.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-semibold">Consistency</h2>
          <div className="mt-5 space-y-4">
            <ProgressBar label="Calorie adherence" value={86} max={100} showValue />
            <ProgressBar label="Workout consistency" value={75} max={100} showValue />
            <ProgressBar label="Habit completion" value={68} max={100} showValue />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Progress photos</h2>
            <TrendingUp size={18} className="text-muted" />
          </div>
          {photos.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<Camera size={28} />}
                title="No photos yet"
                description="Upload progress photos to compare changes over time."
                action={
                  <Button onClick={() => setPhotoOpen(true)}>Add photo</Button>
                }
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="flex aspect-[3/4] items-end rounded-2xl border border-border bg-gradient-to-br from-muted-bg to-border p-3"
                >
                  <span className="text-xs font-medium">{p.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold">Monthly overview</h2>
        <p className="mt-2 text-sm text-muted">
          Chart placeholders are ready for a charting library or analytics API.
          Current mock shows healthy downward weight trend with solid workout
          adherence.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Avg daily calories", value: "2,080" },
            { label: "Workouts completed", value: "14" },
            { label: "Best streak", value: "9 days" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-muted-bg p-4">
              <p className="text-xs text-muted">{s.label}</p>
              <p className="mt-1 font-display text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={weightOpen} onClose={() => setWeightOpen(false)} title="Log weight">
        <Input
          label={`Weight (${unit})`}
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={String(currentWeight)}
        />
        <Button
          className="mt-4"
          fullWidth
          onClick={() => {
            const next = Number(weight);
            if (!Number.isFinite(next) || next <= 0) {
              toast("Enter a valid weight.", "error");
              return;
            }
            updateOnboarding({ currentWeight: next });
            toast("Weight logged.", "success");
            setWeightOpen(false);
            setWeight("");
          }}
        >
          Save
        </Button>
      </Modal>

      <Modal
        open={measureOpen}
        onClose={() => setMeasureOpen(false)}
        title="Update measurements"
      >
        <div className="space-y-3">
          {MEASUREMENTS.map((m) => (
            <Input key={m.label} label={m.label} defaultValue={m.value} />
          ))}
          <Button
            fullWidth
            onClick={() => {
              toast("Measurements updated.", "success");
              setMeasureOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>

      <Modal open={photoOpen} onClose={() => setPhotoOpen(false)} title="Add progress photo">
        <p className="text-sm text-muted">
          Photo upload will connect to storage later. This demo adds a placeholder.
        </p>
        <Button
          className="mt-4"
          fullWidth
          onClick={() => {
            setPhotos((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                label: new Date().toLocaleDateString(),
              },
            ]);
            setPhotoOpen(false);
            toast("Progress photo added.", "success");
          }}
        >
          Add placeholder photo
        </Button>
      </Modal>
    </div>
    </ProGate>
  );
}
