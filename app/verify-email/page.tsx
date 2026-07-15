"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/components/auth/AuthProvider";
import { getPostAuthPath } from "@/lib/auth/routes";

/** Email verification is disabled for local use — always continue into the app. */
export default function VerifyEmailPage() {
  const { user, isReady, verifyEmail } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/");
      return;
    }
    verifyEmail();
    router.replace(getPostAuthPath(user));
  }, [user, isReady, router, verifyEmail]);

  return <PageLoader />;
}
