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
import { getPostAuthPath } from "@/lib/auth/routes";
import { storage } from "@/lib/storage";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || "Login failed.");
      return;
    }
    toast("Welcome back!", "success");
    const user = storage.getUser();
    router.push(getPostAuthPath(user));
  }

  return (
    <MinimalAuthShell>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Sign in
        </Button>
      </form>

      <AuthDivider />
      <InstagramContinueButton />

      <AuthSwitchLink
        prompt="New to Evolve?"
        actionLabel="Create account"
        href="/register"
      />
    </MinimalAuthShell>
  );
}
