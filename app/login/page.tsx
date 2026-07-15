"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthDivider,
  AuthFooterLinks,
  AuthShell,
  SocialAuthButtons,
} from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
    <AuthShell>
      <div>
        <h2 className="font-display text-2xl font-bold">Log in</h2>
        <p className="mt-2 text-sm text-muted">
          Jump back into your feed. New here?{" "}
          <Link
            href="/register"
            className="font-medium text-accent-dim dark:text-accent"
          >
            Create an account
          </Link>
        </p>

        <div className="mt-8">
          <SocialAuthButtons layout="instagram-first" />
        </div>

        <AuthDivider label="or log in with email" />

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Log in
          </Button>
        </form>

        <AuthFooterLinks />
      </div>
    </AuthShell>
  );
}
