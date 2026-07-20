"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { Button } from "@/components/ui/Button";
import { Apple, AtSign } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getPostAuthPath } from "@/lib/auth/routes";
import { storage } from "@/lib/storage";

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        opacity="0.7"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        opacity="0.55"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        opacity="0.85"
      />
    </svg>
  );
}

function AndroidIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.3-.15-.67-.04-.83.26l-1.88 3.24a11.46 11.46 0 0 0-8.94 0L5.65 5.71c-.16-.3-.54-.41-.84-.26-.3.16-.42.54-.26.85l1.84 3.18C4.16 11.17 2.9 13.77 2.9 16.7h18.2c0-2.93-1.26-5.53-3.5-7.22zM7.8 14.35a1.05 1.05 0 1 1 0-2.1 1.05 1.05 0 0 1 0 2.1zm8.4 0a1.05 1.05 0 1 1 0-2.1 1.05 1.05 0 0 1 0 2.1z" />
    </svg>
  );
}

export function AuthShell({
  children,
  showQuote = true,
}: {
  children: React.ReactNode;
  showQuote?: boolean;
}) {
  const { t } = useAppTranslation("auth");

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden apex-gradient-bg lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="apex-mesh pointer-events-none absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10">
          <EvolveLogo light size="md" />
        </div>
        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl"
          >
            {t("heroTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg text-white/75"
          >
            {t("heroBody")}
          </motion.p>
          {showQuote && (
            <motion.blockquote
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-10 border-l-2 border-accent pl-5 text-white/90"
            >
              <p className="font-display text-lg italic leading-relaxed">
                &ldquo;{t("quote")}&rdquo;
              </p>
            </motion.blockquote>
          )}
        </div>
        <p className="relative z-10 text-sm text-white/40">
          {t("heroFooter")}
        </p>
      </aside>

      <main className="relative flex flex-col bg-background">
        <div className="apex-gradient-bg relative overflow-hidden px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))] lg:hidden">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10">
            <EvolveLogo light />
            <h1 className="mt-8 font-display text-3xl font-bold leading-tight text-white">
              {t("heroTitle")}
            </h1>
            <p className="mt-3 text-sm text-white/75">
              {t("heroBodyMobile")}
            </p>
            {showQuote && (
              <p className="mt-6 border-l-2 border-accent pl-4 text-sm italic text-white/85">
                &ldquo;{t("quote")}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </main>
    </div>
  );
}

export function SocialAuthButtons({
  layout = "grid",
}: {
  layout?: "grid" | "instagram-first";
}) {
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useAppTranslation("auth");
  const [busy, setBusy] = useState<string | null>(null);

  async function demoSocial(provider: string, email: string) {
    setBusy(provider);
    const result = await login(email, "evolve-social-demo");
    setBusy(null);
    if (!result.ok) {
      toast(result.error || t("signInFailed"), "error");
      return;
    }
    toast(t("signedInWith", { provider }), "success");
    const user = storage.getUser();
    router.push(getPostAuthPath(user));
  }

  const instagram = (
    <Button
      type="button"
      variant={layout === "instagram-first" ? "secondary" : "outline"}
      fullWidth={layout === "instagram-first"}
      size={layout === "instagram-first" ? "lg" : "md"}
      loading={busy === "instagram"}
      onClick={() => demoSocial("Instagram", "instagram.demo@evolve.app")}
    >
      <AtSign size={18} />
      {t("continueInstagram")}
    </Button>
  );

  const others = [
    {
      id: "google",
      label: "Google",
      icon: <GoogleIcon />,
      action: () => toast(t("googleComing")),
    },
    {
      id: "apple",
      label: "Apple",
      icon: <Apple size={18} />,
      action: () => toast(t("appleComing")),
    },
    {
      id: "android",
      label: "Android",
      icon: <AndroidIcon />,
      action: () => toast(t("androidComing")),
    },
  ] as const;

  if (layout === "instagram-first") {
    return (
      <div className="space-y-3">
        {instagram}
        <p className="text-center text-xs text-muted">
          {t("demoSocialHint")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {others.map((p) => (
            <Button
              key={p.id}
              type="button"
              variant="outline"
              size="sm"
              loading={busy === p.id}
              onClick={p.action}
            >
              {p.icon}
              <span className="sr-only sm:not-sr-only sm:ml-1">{p.label}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {instagram}
      <div className="grid grid-cols-3 gap-3">
        {others.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant="outline"
            loading={busy === p.id}
            onClick={p.action}
          >
            {p.icon}
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function AuthDivider({
  label,
}: {
  label?: string;
}) {
  const { t } = useAppTranslation("auth");
  return (
    <div className="relative my-6 text-center text-xs text-muted">
      <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <span className="relative bg-background px-3">
        {label ?? t("continueEmail")}
      </span>
    </div>
  );
}

export function AuthFooterLinks() {
  const { t } = useAppTranslation("auth");
  return (
    <p className="mt-8 text-center text-sm text-muted">
      {t("forgotPrompt")}{" "}
      <Link
        href="/forgot-password"
        className="font-medium text-accent-dim underline-offset-2 hover:underline dark:text-accent"
      >
        {t("resetIt")}
      </Link>
    </p>
  );
}
