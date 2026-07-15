"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SideNav, BottomNav } from "@/components/layout/AppNav";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageLoader } from "@/components/ui/Spinner";
import { PageTransition } from "@/components/ui/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/");
      return;
    }
    // No email verification gate — only enforce onboarding / intro / pricing once
    if (!user.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    if (!user.introSeen) {
      router.replace("/intro");
      return;
    }
    if (!user.pricingSeen) {
      router.replace("/pricing");
    }
  }, [user, isReady, router]);

  if (!isReady || !user || !user.onboardingComplete || !user.introSeen || !user.pricingSeen) {
    return <PageLoader />;
  }

  return (
    <div className="evolve-app-shell flex min-h-dvh bg-background">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-5 pb-[var(--mobile-nav-clearance)] pt-4 sm:px-5 sm:pt-6 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="mx-auto w-full max-w-[390px] lg:max-w-6xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
