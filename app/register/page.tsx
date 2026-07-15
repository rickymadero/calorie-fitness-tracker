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

export default function RegisterPage() {
  const { updateRegisterDraft, completeRegistration, clearRegisterDraft } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    updateRegisterDraft({ fullName, email, password });
    await new Promise((r) => setTimeout(r, 500));
    completeRegistration();
    clearRegisterDraft();
    setLoading(false);
    toast("Account created. Let's set you up.", "success");
    router.push("/onboarding");
  }

  return (
    <MinimalAuthShell>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Alex Rivera"
        />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Create account
        </Button>
        <p className="text-center text-xs text-white/35">
          By continuing you agree to our Terms &amp; Privacy Policy.
        </p>
      </form>

      <AuthDivider />
      <InstagramContinueButton label="Sign up with Instagram" />

      <AuthSwitchLink prompt="Already have an account?" actionLabel="Log in" href="/login" />
    </MinimalAuthShell>
  );
}
