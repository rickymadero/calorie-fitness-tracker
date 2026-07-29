"use client";

import Link from "next/link";
import { Activity, FileText, NotebookPen } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

type CreateActionSheetProps = {
  open: boolean;
  onClose: () => void;
};

const ACTIONS = [
  {
    href: "/track",
    icon: Activity,
    titleKey: "create.trackWorkout",
    descKey: "create.trackWorkoutDesc",
    primary: true,
  },
  {
    href: "/posts/new",
    icon: NotebookPen,
    titleKey: "create.logWorkout",
    descKey: "create.logWorkoutDesc",
  },
  {
    href: "/posts/new",
    icon: FileText,
    titleKey: "create.createPost",
    descKey: "create.createPostDesc",
  },
] as const;

export function CreateActionSheet({ open, onClose }: CreateActionSheetProps) {
  const { t } = useAppTranslation("common");

  return (
    <Modal open={open} onClose={onClose} title={t("create.title")} size="sm">
      <ul className="flex flex-col gap-2 pb-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.titleKey}>
              <Link
                href={action.href}
                onClick={onClose}
                className={`flex min-h-14 items-center gap-3 rounded-2xl px-3 py-3 transition ${
                  "primary" in action && action.primary
                    ? "bg-accent text-accent-fg shadow-apex hover:brightness-110"
                    : "bg-muted-bg text-foreground hover:bg-border/80"
                }`}
              >
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    "primary" in action && action.primary
                      ? "bg-accent-fg/15"
                      : "bg-card"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-semibold leading-tight">
                    {t(action.titleKey)}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs leading-snug ${
                      "primary" in action && action.primary
                        ? "text-accent-fg/80"
                        : "text-muted"
                    }`}
                  >
                    {t(action.descKey)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
