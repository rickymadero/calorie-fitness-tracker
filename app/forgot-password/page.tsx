"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/lib/services/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "auth"]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError(t("errors.invalidEmail"));
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
      const { error: resetError } = await authService.resetPasswordForEmail(
        supabase,
        email.trim(),
        redirectTo,
      );
      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }
      setSent(true);
      toast(t("forgotPassword.toastSent", { ns: "auth" }), "success");
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

        {sent ? (
          <div className="mt-8 space-y-4">
            <p className="rounded-2xl border border-accent/30 bg-accent-soft p-4 text-sm">
              {t("forgotPassword.sent", { ns: "auth", email })}
            </p>
            <Button fullWidth onClick={() => router.push("/login")}>
              {t("forgotPassword.backToLogin", { ns: "auth" })}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Input
              label={t("email", { ns: "auth" })}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder", { ns: "auth" })}
              required
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {t("forgotPassword.sendLink", { ns: "auth" })}
            </Button>
            <p className="text-center text-sm text-muted">
              <Link href="/login" className="text-accent-dim dark:text-accent">
                {t("forgotPassword.backToLogin", { ns: "auth" })}
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
