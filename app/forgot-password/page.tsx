"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "auth"]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
    toast(t("forgotPassword.toastSent", { ns: "auth" }), "success");
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
