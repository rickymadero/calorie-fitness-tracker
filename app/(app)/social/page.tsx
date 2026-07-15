"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/Spinner";

/** Legacy hub — social product now lives on /feed */
export default function SocialRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/feed");
  }, [router]);
  return <PageLoader />;
}
