"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthDivider,
  AuthField,
  AuthSwitchLink,
  InstagramContinueButton,
  MinimalAuthShell,
} from "@/components/auth/MinimalAuthShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { getPostAuthPath } from "@/lib/auth/routes";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "auth"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError(t("errors.invalidEmail"));
      return;
    }
    if (password.length < 6) {
      setError(t("errors.passwordShort"));
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || t("errors.loginFailed"));
      return;
    }
    toast(t("success.welcomeBack"), "success");
    router.push(getPostAuthPath(result.user ?? null));
  }

  return (
    <MinimalAuthShell>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          label={t("email", { ns: "auth" })}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder", { ns: "auth" })}
        />
        <AuthField
          label={t("password", { ns: "auth" })}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <p className="text-right text-xs text-white/45">
          <Link href="/forgot-password" className="text-accent hover:text-accent/80">
            {t("forgotPrompt", { ns: "auth" })}
          </Link>
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          {t("signIn", { ns: "auth" })}
        </Button>
      </form>

      <AuthDivider label={t("labels.or")} />
      <InstagramContinueButton label={t("continueInstagram", { ns: "auth" })} />

      <AuthSwitchLink
        prompt={t("newToApp", { ns: "auth" })}
        actionLabel={t("createAccount", { ns: "auth" })}
        href="/register"
      />
    </MinimalAuthShell>
  );
}
