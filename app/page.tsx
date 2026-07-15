"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthDivider,
  InstagramContinueButton,
  MinimalAuthShell,
} from "@/components/auth/MinimalAuthShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageLoader } from "@/components/ui/Spinner";
import { getPostAuthPath } from "@/lib/auth/routes";

export default function LandingPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || !user) return;
    router.replace(getPostAuthPath(user));
  }, [user, isReady, router]);

  if (!isReady || user) return <PageLoader />;

  return (
    <MinimalAuthShell>
      <p className="text-center text-sm text-white/45">
        Social fitness. Post workouts, follow athletes, grow together.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link href="/register">
          <Button fullWidth size="lg">
            Create account
          </Button>
        </Link>
        <Link href="/login">
          <Button
            fullWidth
            size="lg"
            variant="outline"
            className="!border-white/15 !text-white hover:!border-white/30 hover:!bg-white/[0.06]"
          >
            Log in
          </Button>
        </Link>
      </div>

      <AuthDivider />
      <InstagramContinueButton />
    </MinimalAuthShell>
  );
}
