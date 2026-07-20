"use client";

import { useMemo, useState } from "react";
import {
  Dumbbell,
  Footprints,
  Trophy,
  Medal,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PR_PRESETS } from "@/lib/mock/socialUsers";
import { useSocial } from "@/components/social/SocialProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import type {
  AthletePersonalRecord,
  PrCategory,
} from "@/lib/types/social";

const CATEGORY_ICONS: Record<PrCategory, typeof Dumbbell> = {
  strength: Dumbbell,
  running: Footprints,
  endurance: Trophy,
  other: Medal,
};

const CATEGORY_ORDER: PrCategory[] = [
  "strength",
  "running",
  "endurance",
  "other",
];

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export function ProfilePrList({
  records,
  canEdit = false,
}: {
  records: AthletePersonalRecord[];
  canEdit?: boolean;
}) {
  const { updateMyProfile, myProfile } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["social", "common"]);
  const [addOpen, setAddOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<PrCategory, AthletePersonalRecord[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const r of records) {
      const list = map.get(r.category) ?? map.get("other")!;
      list.push(r);
    }
    return CATEGORY_ORDER.map((cat) => ({
      cat,
      items: map.get(cat) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [records]);

  function removePr(id: string) {
    if (!myProfile) return;
    updateMyProfile({
      personalRecords: (myProfile.personalRecords ?? []).filter(
        (r) => r.id !== id,
      ),
    });
    toast(t("pr.removed"), "info");
  }

  if (records.length === 0 && !canEdit) {
    return (
      <EmptyState
        icon={<Trophy size={28} />}
        title={t("pr.emptyOtherTitle")}
        description={t("pr.emptyOtherHint")}
      />
    );
  }

  if (records.length === 0 && canEdit) {
    return (
      <>
        <EmptyState
          icon={<Trophy size={28} />}
          title={t("pr.emptyOwnTitle")}
          description={t("pr.emptyOwnHint")}
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={16} />
              {t("pr.add")}
            </Button>
          }
        />
        <AddPrModal open={addOpen} onClose={() => setAddOpen(false)} />
      </>
    );
  }

  return (
    <div className="space-y-5">
      {canEdit && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            {t("pr.add")}
          </Button>
        </div>
      )}

      {grouped.map(({ cat, items }) => {
        const Icon = CATEGORY_ICONS[cat];
        return (
          <section key={cat} className="min-w-0">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Icon size={14} />
              {t(`pr.category.${cat}`)}
            </h3>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {items.map((r) => {
                const when = formatDate(r.achievedAt);
                return (
                  <li
                    key={r.id}
                    className="flex min-h-14 items-center gap-3 px-3.5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.label}</p>
                      {when ? (
                        <p className="text-xs text-muted">{when}</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 font-display text-base font-bold tabular-nums">
                      {r.value}
                    </p>
                    {canEdit && (
                      <button
                        type="button"
                        className="evolve-press inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-muted-bg hover:text-foreground"
                        aria-label={t("buttons.remove", { ns: "common" })}
                        onClick={() => removePr(r.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <AddPrModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddPrModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { myProfile, updateMyProfile } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["social", "common"]);
  const [presetIdx, setPresetIdx] = useState(0);
  const [customLabel, setCustomLabel] = useState("");
  const [value, setValue] = useState("");

  const preset = PR_PRESETS[presetIdx] ?? PR_PRESETS[0];
  const isCustom = preset.label === "Custom";

  function save() {
    if (!myProfile) return;
    const label = (isCustom ? customLabel : preset.label).trim();
    const v = value.trim();
    if (!label || !v) {
      toast(t("pr.needLabelValue"), "error");
      return;
    }
    const next: AthletePersonalRecord = {
      id: `pr_${Math.random().toString(36).slice(2, 10)}`,
      category: preset.category,
      label,
      value: v,
      achievedAt: new Date().toISOString().slice(0, 10),
    };
    const others = (myProfile.personalRecords ?? []).filter(
      (r) => r.label.toLowerCase() !== label.toLowerCase(),
    );
    updateMyProfile({ personalRecords: [next, ...others] });
    toast(t("pr.saved"), "success");
    setValue("");
    setCustomLabel("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t("pr.modalTitle")}>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">{t("pr.whatHit")}</p>
          <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto">
            {PR_PRESETS.map((p, i) => (
              <button
                key={`${p.category}-${p.label}`}
                type="button"
                onClick={() => setPresetIdx(i)}
                className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  presetIdx === i
                    ? "border-accent bg-accent-soft text-accent-dim dark:text-accent"
                    : "border-border text-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {isCustom && (
          <Input
            label={t("pr.label")}
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder={t("pr.labelPh")}
          />
        )}

        <Input
          label={t("pr.result")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={preset.placeholder}
        />

        <Button fullWidth onClick={save}>
          {t("pr.savePr")}
        </Button>
      </div>
    </Modal>
  );
}
