"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/Spinner";

/** Legacy dashboard — home is now the social Feed */
export default function DashboardRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/feed");
  }, [router]);
  return <PageLoader />;
}
