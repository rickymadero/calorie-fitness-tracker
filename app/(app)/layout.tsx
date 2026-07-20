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
    <div className="evolve-app-shell flex min-h-dvh w-full max-w-[100vw] overflow-x-hidden bg-background">
      <SideNav />
      <div className="flex min-w-0 w-full flex-1 flex-col overflow-x-hidden">
        {/*
          Phone viewport (= iframe 390px) IS the canvas.
          Never nest another max-w-[390px] here — that + padding + sticky -mx caused overflow.
        */}
        <main className="min-w-0 w-full flex-1 overflow-x-hidden px-3 pb-[var(--mobile-nav-clearance)] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-6 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="mx-auto w-full min-w-0 max-w-full overflow-x-hidden lg:max-w-6xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
