"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Home,
  Dumbbell,
  Plus,
  Users,
  User,
  MessageCircle,
  Utensils,
  Activity,
  TrendingUp,
  ClipboardList,
  BookOpen,
  ChefHat,
} from "lucide-react";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useMessages } from "@/components/messages/MessagesProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";

/** Desktop side rail — secondary. Mobile bottom tabs are primary. */
const DESKTOP_PRIMARY = [
  { href: "/feed", labelKey: "nav.feed", icon: Home },
  { href: "/explore", labelKey: "nav.evofit", icon: Dumbbell },
  { href: "/messages", labelKey: "nav.messages", icon: MessageCircle },
  { href: "/network", labelKey: "nav.network", icon: Users },
  { href: "/profile", labelKey: "nav.profile", icon: User },
] as const;

const DESKTOP_TOOLS = [
  { href: "/food", labelKey: "nav.food", icon: Utensils },
  { href: "/workouts", labelKey: "nav.train", icon: Activity },
  { href: "/progress", labelKey: "nav.progress", icon: TrendingUp },
  { href: "/plans", labelKey: "nav.plans", icon: ClipboardList },
  { href: "/exercises", labelKey: "nav.moves", icon: BookOpen },
  { href: "/recipes", labelKey: "nav.meals", icon: ChefHat },
] as const;

/**
 * Mobile bottom bar — Instagram/Strava pattern.
 * Center Post is the primary create action.
 */
const MOBILE_TABS = [
  { href: "/feed", icon: Home, kind: "tab" as const },
  { href: "/explore", icon: Dumbbell, kind: "tab" as const },
  { href: "/posts/new", icon: Plus, kind: "create" as const },
  { href: "/network", icon: Users, kind: "tab" as const },
  { href: "/profile", icon: User, kind: "tab" as const },
];

export function SideNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { tick, unreadTotal } = useMessages();
  const { t } = useAppTranslation("common");
  const isPro = user?.plan === "pro";
  void tick;
  const unread = unreadTotal();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-nav text-nav-fg lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <EvolveLogo href="/feed" light size="sm" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {DESKTOP_PRIMARY.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "text-accent-fg"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="desktop-nav-pill"
                  className="absolute inset-0 rounded-xl bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon size={18} className="relative z-10" />
              <span className="relative z-10">{t(item.labelKey)}</span>
              {item.href === "/messages" && unread > 0 && (
                <span className="relative z-10 ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-fg/20 px-1.5 text-[10px] font-bold text-accent-fg">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          );
        })}

        <Link
          href="/posts/new"
          className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-accent-fg transition hover:brightness-110 active:scale-[0.98]"
        >
          <Plus size={18} />
          {t("buttons.shareWorkout")}
        </Link>

        <div className="my-3 border-t border-white/10 pt-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            {t("nav.fitnessTools")}
          </p>
          {DESKTOP_TOOLS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <Icon size={16} />
                {t(item.labelKey)}
                {!isPro && item.href !== "/food" && item.href !== "/workouts" && (
                  <span className="ml-auto text-[10px] text-white/30">
                    {t("labels.pro")}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <p className="px-5 py-4 text-xs text-white/30">{t("brandFooter")}</p>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { t } = useAppTranslation("common");

  const labels: Record<string, string> = {
    "/feed": t("nav.feed"),
    "/explore": t("nav.evofit"),
    "/network": t("nav.network"),
    "/profile": t("nav.you"),
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 shadow-[0_-8px_24px_rgba(17,20,24,0.06)] backdrop-blur-xl dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid w-full max-w-full grid-cols-5 px-1 pt-1.5">
        {MOBILE_TABS.map((item) => {
          const active =
            item.kind === "create"
              ? pathname.startsWith("/posts")
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          if (item.kind === "create") {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 py-1.5"
                aria-label={t("nav.post")}
              >
                <motion.span
                  whileHover={reduce ? undefined : { scale: 1.06 }}
                  whileTap={reduce ? undefined : { scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 480, damping: 22 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full shadow-apex ${
                    active
                      ? "bg-accent-dim text-accent-fg"
                      : "bg-accent text-accent-fg"
                  }`}
                >
                  <Plus size={26} strokeWidth={2.5} />
                </motion.span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`evolve-press relative flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden py-1.5 text-[10px] font-medium leading-tight transition-colors duration-200 sm:text-[11px] ${
                active ? "text-accent-dim dark:text-accent" : "text-muted"
              }`}
            >
              {active && !reduce && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
              <motion.span
                animate={
                  active && !reduce
                    ? { y: -1, scale: 1.1 }
                    : { y: 0, scale: 1 }
                }
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                <Icon size={23} strokeWidth={active ? 2.5 : 2} />
              </motion.span>
              <span className="max-w-full truncate px-0.5 text-center">
                {labels[item.href]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
