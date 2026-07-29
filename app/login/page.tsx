"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { safeAppPath } from "@/lib/auth/pricingReturn";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "auth"]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const showDemoSocial = process.env.NODE_ENV !== "production";

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
    const postAuth = getPostAuthPath(result.user ?? null);
    // Honor deep-link return only after onboarding is complete.
    const destination =
      postAuth === "/feed"
        ? safeAppPath(searchParams.get("next"), "/feed")
        : postAuth;
    router.push(destination);
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
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          {t("signIn", { ns: "auth" })}
        </Button>
      </form>

      {showDemoSocial ? (
        <>
          <AuthDivider label={t("labels.or")} />
          <InstagramContinueButton label={t("continueInstagram", { ns: "auth" })} />
        </>
      ) : null}

      <AuthSwitchLink
        prompt={t("newToApp", { ns: "auth" })}
        actionLabel={t("createAccount", { ns: "auth" })}
        href="/register"
      />
    </MinimalAuthShell>
  );
}
