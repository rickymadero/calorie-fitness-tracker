"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AtSign } from "lucide-react";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { getPostAuthPath } from "@/lib/auth/routes";
import { storage } from "@/lib/storage";

const easeReveal = [0.16, 1, 0.3, 1] as const;

/**
 * Full-bleed minimal shell for /login, /register, and the landing page.
 * Single centered column at every breakpoint — no split marketing panel.
 * The Evolve wordmark animates in from depth (blur + scale + rise) on load.
 */
export function MinimalAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="evolve-auth-bg relative flex min-h-dvh flex-col overflow-hidden">
      <div className="evolve-auth-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="evolve-auth-glow pointer-events-none absolute left-1/2 top-[18%] -z-0 h-[22rem] w-[22rem] -translate-x-1/2" aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]">
        <motion.div
          initial={{ opacity: 0, scale: 0.78, y: 28, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.85, ease: easeReveal }}
        >
          <EvolveLogo light size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: easeReveal }}
          className="mt-12 w-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/** Input styled for the dark auth background — pinned with !important so it can't lose the cascade to shared Input defaults. */
export function AuthField(props: React.ComponentProps<typeof Input>) {
  const { className = "", labelClassName = "", ...rest } = props;
  return (
    <Input
      {...rest}
      labelClassName={`!text-white/70 ${labelClassName}`}
      className={`!h-14 !border-white/15 !bg-white/[0.05] !text-white !text-[16px] placeholder:!text-white/35 focus:!border-accent focus:!ring-accent/25 ${className}`}
    />
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-white/35">
      <span className="h-px flex-1 bg-white/10" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

/** Self-contained Instagram demo sign-in — reuses existing demo auth so nothing breaks. */
export function InstagramContinueButton({ label = "Continue with Instagram" }: { label?: string }) {
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function demoSocial() {
    setBusy(true);
    const result = await login("instagram.demo@evolve.app", "evolve-social-demo");
    setBusy(false);
    if (!result.ok) {
      toast(result.error || "Sign-in failed.", "error");
      return;
    }
    toast("Signed in with Instagram (demo).", "success");
    const user = storage.getUser();
    router.push(getPostAuthPath(user));
  }

  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      size="lg"
      loading={busy}
      onClick={demoSocial}
      className="!border-white/15 !text-white hover:!border-white/30 hover:!bg-white/[0.06]"
    >
      <AtSign size={18} />
      {label}
    </Button>
  );
}

export function AuthSwitchLink({
  prompt,
  actionLabel,
  href,
}: {
  prompt: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <p className="mt-10 text-center text-sm text-white/45">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-accent hover:text-accent/80">
        {actionLabel}
      </Link>
    </p>
  );
}
