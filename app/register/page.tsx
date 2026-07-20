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

export default function RegisterPage() {
  const { updateRegisterDraft, completeRegistration, clearRegisterDraft } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "auth"]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError(t("errors.requiredName"));
      return;
    }
    if (!email.includes("@")) {
      setError(t("errors.invalidEmail"));
      return;
    }
    if (password.length < 6) {
      setError(t("errors.passwordShort"));
      return;
    }
    setLoading(true);
    updateRegisterDraft({ fullName, email, password });
    await new Promise((r) => setTimeout(r, 500));
    completeRegistration();
    clearRegisterDraft();
    setLoading(false);
    toast(t("success.accountCreated"), "success");
    router.push("/onboarding");
  }

  return (
    <MinimalAuthShell>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          label={t("fullName", { ns: "auth" })}
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t("namePlaceholder", { ns: "auth" })}
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          {t("createAccount", { ns: "auth" })}
        </Button>
        <p className="text-center text-xs text-white/35">
          {t("termsHint", { ns: "auth" })}
        </p>
      </form>

      <AuthDivider label={t("labels.or")} />
      <InstagramContinueButton label={t("signUpInstagram", { ns: "auth" })} />

      <AuthSwitchLink
        prompt={t("hasAccount", { ns: "auth" })}
        actionLabel={t("logIn", { ns: "auth" })}
        href="/login"
      />
    </MinimalAuthShell>
  );
}
