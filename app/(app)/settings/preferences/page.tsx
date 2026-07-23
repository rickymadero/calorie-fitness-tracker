"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Moon, Sun } from "lucide-react";
import { SettingsBackHeader } from "@/components/settings/SettingsBackHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { settingsPrefs } from "@/lib/storage/settingsPrefs";
import type { MeasurementSystem } from "@/lib/types";

export default function PreferencesPage() {
  const { user, updateUser, setPlan, userSettings, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { t, locale, setLocale, languages } = useAppTranslation([
    "common",
    "settings",
  ]);

  const [email, setEmail] = useState("");
  const [measurement, setMeasurement] = useState<MeasurementSystem>("metric");
  const [twoFa, setTwoFa] = useState(false);
  const [language, setLanguage] = useState(locale);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email);
    setMeasurement(
      (userSettings?.preferred_units as MeasurementSystem | undefined) ??
        user.measurementSystem,
    );
    setTwoFa(settingsPrefs.getTwoFa());
    setLanguage(userSettings?.language || locale);
  }, [user, locale, userSettings]);

  if (!user) return null;

  async function persistPreferenceSettings(next?: {
    measurement?: MeasurementSystem;
    language?: string;
    theme?: "light" | "dark";
  }) {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { userSettingsService } = await import(
        "@/lib/services/userSettings"
      );
      const supabase = createClient();
      await userSettingsService.updateOwn(supabase, user!.id, {
        preferred_units: next?.measurement ?? measurement,
        language: next?.language ?? language,
        theme: next?.theme ?? theme,
      });
      await refreshProfile();
    } catch {
      /* local still updated */
    }
  }

  function applySave(nextEmail?: string) {
    updateUser({
      email: nextEmail ?? email.trim(),
      measurementSystem: measurement,
    });
    settingsPrefs.setTwoFa(twoFa);
    setLocale(language);
    return true;
  }

  async function saveChanges() {
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail || !nextEmail.includes("@")) {
      toast(t("common:errors.invalidEmail"), "error");
      return;
    }

    const passwordAttempt =
      currentPassword || newPassword || confirmPassword;
    if (passwordAttempt) {
      if (newPassword.length < 8) {
        toast(t("common:errors.passwordShort8"), "error");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast(t("common:errors.passwordMismatch"), "error");
        return;
      }
      if (!currentPassword) {
        toast(t("common:errors.currentPassword"), "error");
        return;
      }
      setConfirmPasswordOpen(true);
      return;
    }

    if (nextEmail !== user!.email.toLowerCase()) {
      setPendingEmail(nextEmail);
      setConfirmEmailOpen(true);
      return;
    }

    setSaving(true);
    applySave();
    await persistPreferenceSettings();
    setSaving(false);
    toast(t("common:success.settingsSaved"), "success");
  }

  async function confirmEmailChange() {
    if (!pendingEmail) return;
    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { authService } = await import("@/lib/services/auth");
      const supabase = createClient();
      const { error } = await authService.updateEmail(supabase, pendingEmail);
      if (error) {
        toast(error.message, "error");
        setSaving(false);
        return;
      }
      applySave(pendingEmail);
      await persistPreferenceSettings();
      setConfirmEmailOpen(false);
      setPendingEmail(null);
      toast(t("common:success.emailUpdated"), "success");
    } catch {
      toast(t("common:errors.generic"), "error");
    }
    setSaving(false);
  }

  async function confirmPasswordChange() {
    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { authService } = await import("@/lib/services/auth");
      const supabase = createClient();
      const { error } = await authService.updatePassword(supabase, newPassword);
      if (error) {
        toast(error.message, "error");
        setSaving(false);
        return;
      }
      applySave();
      await persistPreferenceSettings();
      setConfirmPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast(t("common:success.passwordUpdated"), "success");
    } catch {
      toast(t("common:errors.generic"), "error");
    }
    setSaving(false);
  }

  function onLanguageChange(next: string) {
    setLanguage(next);
    setLocale(next);
    void persistPreferenceSettings({ language: next });
    window.setTimeout(() => {
      toast(t("common:success.languageUpdated"), "success");
    }, 50);
  }

  function onToggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    toggleTheme();
    void persistPreferenceSettings({ theme: next });
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg pb-8">
      <SettingsBackHeader title={t("settings:preferences")} href="/profile" />

      <div className="space-y-7">
        <section className="space-y-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            {t("settings:preferences")}
          </h2>

          <div>
            <label
              htmlFor="app-language"
              className="mb-2 block text-sm font-medium"
            >
              {t("settings:language")}
            </label>
            <select
              id="app-language"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.native}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">
              {t("settings:languageHint")}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">
              {t("settings:measurement")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["metric", "imperial"] as MeasurementSystem[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setMeasurement(s)}
                  className={`min-h-11 rounded-2xl border text-sm font-medium capitalize ${
                    measurement === s
                      ? "border-accent bg-accent-soft"
                      : "border-border"
                  }`}
                >
                  {t(`common:labels.${s}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t("settings:appearance")}</p>
              <p className="mt-0.5 text-xs text-muted">
                {theme === "dark" ? t("settings:dark") : t("settings:light")}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={onToggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {t("common:buttons.toggle")}
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            {t("settings:account")}
          </h2>
          <Input
            label={t("settings:email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label={t("settings:passwordCurrent")}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            hint={t("settings:passwordHint")}
          />
          <Input
            label={t("settings:passwordNew")}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label={t("settings:passwordConfirm")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            {t("settings:security")}
          </h2>
          <label className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{t("settings:twoFactor")}</p>
              <p className="text-xs text-muted">{t("settings:twoFactorHint")}</p>
            </div>
            <input
              type="checkbox"
              checked={twoFa}
              onChange={(e) => setTwoFa(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
          </label>
          <Link
            href="/settings/privacy"
            className="block text-sm font-medium text-accent"
          >
            {t("settings:blockReport")}
          </Link>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{t("settings:subscription")}</p>
              <Badge variant={user.plan === "pro" ? "accent" : "default"}>
                {user.plan === "pro"
                  ? t("common:labels.pro")
                  : t("common:labels.free")}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted">
              {t("settings:subscriptionBody")}
            </p>
            <div className="mt-3">
              {user.plan !== "pro" ? (
                <Button
                  fullWidth
                  size="sm"
                  onClick={() => {
                    setPlan("pro");
                    toast(t("common:success.upgradedPro"), "success");
                  }}
                >
                  <Crown size={14} />
                  {t("common:buttons.upgradePro")}
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPlan("free");
                    toast(t("common:success.movedFree"), "info");
                  }}
                >
                  {t("common:buttons.switchFree")}
                </Button>
              )}
            </div>
          </div>
        </section>

        <div className="border-t border-border pt-5">
          <Button
            type="button"
            fullWidth
            size="lg"
            loading={saving}
            onClick={() => void saveChanges()}
          >
            {t("common:buttons.saveChanges")}
          </Button>
        </div>
      </div>

      <Modal
        open={confirmEmailOpen}
        onClose={() => {
          setConfirmEmailOpen(false);
          setPendingEmail(null);
        }}
        title={t("settings:emailChangeTitle")}
        size="sm"
      >
        <p className="text-sm text-muted">
          {t("settings:emailChangeBody", { email: pendingEmail ?? "" })}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setConfirmEmailOpen(false);
              setPendingEmail(null);
            }}
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button loading={saving} onClick={confirmEmailChange}>
            {t("common:buttons.confirm")}
          </Button>
        </div>
      </Modal>

      <Modal
        open={confirmPasswordOpen}
        onClose={() => setConfirmPasswordOpen(false)}
        title={t("settings:passwordChangeTitle")}
        size="sm"
      >
        <p className="text-sm text-muted">{t("settings:passwordChangeBody")}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setConfirmPasswordOpen(false)}
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button loading={saving} onClick={confirmPasswordChange}>
            {t("settings:updatePassword")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
