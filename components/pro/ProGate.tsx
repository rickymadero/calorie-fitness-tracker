"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

export function ProGate({
  children,
  feature = "This Pro tool",
}: {
  children: React.ReactNode;
  feature?: string;
}) {
  const { user, setPlan } = useAuth();
  const isPro = user?.plan === "pro";

  if (isPro) return <>{children}</>;

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-dim dark:text-accent">
          <Crown size={28} />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Unlock with Pro
        </h1>
        <p className="mt-2 text-sm text-muted">
          {feature} is part of Evolve Pro — personalized nutrition, training
          plans, food scanning, and advanced analytics. The social feed stays
          free.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              setPlan("pro");
            }}
          >
            <Crown size={16} />
            Upgrade to Pro (demo)
          </Button>
          <Link href="/feed">
            <Button variant="outline">Back to Feed</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost">View plans</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
