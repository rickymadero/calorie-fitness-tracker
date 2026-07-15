"use client";

import { use } from "react";
import { AdminPlanEditor } from "@/components/training/AdminPlanEditor";

export default function EditAdminPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <AdminPlanEditor planId={id} />;
}
