"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthDivider, AuthFooterLinks, AuthShell, SocialAuthButtons } from "@/components/auth/AuthShell";
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
    <AuthShell>
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Welcome to Evolve
        </h2>
        <p className="mt-2 text-sm text-muted">
          The social fitness network — share workouts, follow athletes, and grow
          together.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/register">
            <Button fullWidth size="lg">
              Create account
            </Button>
          </Link>
          <Link href="/login">
            <Button fullWidth size="lg" variant="outline">
              Log in
            </Button>
          </Link>
        </div>

        <AuthDivider label="or continue with" />
        <SocialAuthButtons layout="instagram-first" />
        <AuthFooterLinks />
      </div>
    </AuthShell>
  );
}
