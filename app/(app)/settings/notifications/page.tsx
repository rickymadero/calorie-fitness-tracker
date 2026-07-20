"use client";

import { useEffect, useState } from "react";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import {
  settingsPrefs,
  type NotificationPrefs,
} from "@/lib/storage/settingsPrefs";

const ROW_KEYS: (keyof NotificationPrefs)[] = [
  "likes",
  "comments",
  "follows",
  "messages",
  "stories",
];

export default function NotificationsSettingsPage() {
  const { toast } = useToast();
  const { t } = useAppTranslation("settings");
  const [prefs, setPrefs] = useState<NotificationPrefs>(
    settingsPrefs.getNotifications(),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(settingsPrefs.getNotifications());
  }, []);

  function toggle(key: keyof NotificationPrefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function save() {
    setSaving(true);
    settingsPrefs.setNotifications(prefs);
    setSaving(false);
    toast(t("notifications.saved"), "success");
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg pb-8">
      <SettingsBackHeader title={t("notifications.title")} href="/profile" />

      <p className="mb-5 text-sm text-muted">{t("notifications.intro")}</p>

      <ul className="space-y-2">
        {ROW_KEYS.map((key) => (
          <li key={key}>
            <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 transition hover:border-accent/40">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {t(`notifications.${key}`)}
                </p>
                <p className="text-xs text-muted">
                  {t(`notifications.${key}Hint`)}
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => toggle(key)}
                className="h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button fullWidth size="lg" loading={saving} onClick={save}>
          {t("notifications.save")}
        </Button>
      </div>
    </div>
  );
}
