"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/lib/services/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "auth"]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError(t("errors.passwordShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("errors.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await authService.updatePassword(
        supabase,
        password,
      );
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      toast(t("success.passwordUpdated"), "success");
      router.replace("/feed");
    } catch {
      setError(t("errors.generic"));
    }
    setLoading(false);
  }

  return (
    <AuthShell showQuote={false}>
      <div>
        <h2 className="font-display text-2xl font-bold">
          {t("forgotPassword.title", { ns: "auth" })}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {t("forgotPassword.body", { ns: "auth" })}
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Input
            label={t("password", { ns: "auth" })}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label={t("password", { ns: "auth" })}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={loading}>
            {t("buttons.save")}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
