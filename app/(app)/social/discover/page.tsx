"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/Spinner";

export default function DiscoverRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/explore");
  }, [router]);
  return <PageLoader />;
}
