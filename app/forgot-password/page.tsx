"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
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
    toast("Reset link sent (demo).", "success");
  }

  return (
    <AuthShell showQuote={false}>
      <div>
        <h2 className="font-display text-2xl font-bold">Reset password</h2>
        <p className="mt-2 text-sm text-muted">
          Enter your email and we&apos;ll send a reset link.
        </p>

        {sent ? (
          <div className="mt-8 space-y-4">
            <p className="rounded-2xl border border-accent/30 bg-accent-soft p-4 text-sm">
              If an account exists for <strong>{email}</strong>, a reset link has
              been sent. Check your inbox.
            </p>
            <Button fullWidth onClick={() => router.push("/login")}>
              Back to log in
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Send reset link
            </Button>
            <p className="text-center text-sm text-muted">
              <Link href="/login" className="text-accent-dim dark:text-accent">
                Back to log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
