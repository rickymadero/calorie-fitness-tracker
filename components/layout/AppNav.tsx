"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Home,
  Compass,
  Plus,
  Users,
  User,
  Utensils,
  Dumbbell,
  TrendingUp,
  ClipboardList,
  BookOpen,
  ChefHat,
} from "lucide-react";
import { EvolveLogo } from "@/components/ui/EvolveLogo";
import { useAuth } from "@/components/auth/AuthProvider";

/** Desktop side rail — secondary. Mobile bottom tabs are primary. */
const DESKTOP_PRIMARY = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/network", label: "Network", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

const DESKTOP_TOOLS = [
  { href: "/food", label: "Food", icon: Utensils },
  { href: "/workouts", label: "Train", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/plans", label: "Plans", icon: ClipboardList },
  { href: "/exercises", label: "Moves", icon: BookOpen },
  { href: "/recipes", label: "Meals", icon: ChefHat },
];

/**
 * Mobile bottom bar — Instagram/Strava pattern.
 * Center Post is the primary create action.
 */
const MOBILE_TABS = [
  { href: "/feed", label: "Feed", icon: Home, kind: "tab" as const },
  { href: "/explore", label: "Explore", icon: Compass, kind: "tab" as const },
  { href: "/posts/new", label: "Post", icon: Plus, kind: "create" as const },
  { href: "/network", label: "Network", icon: Users, kind: "tab" as const },
  { href: "/profile", label: "You", icon: User, kind: "tab" as const },
];

export function SideNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isPro = user?.plan === "pro";

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
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/posts/new"
          className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-accent-fg transition hover:brightness-110 active:scale-[0.98]"
        >
          <Plus size={18} />
          Share workout
        </Link>

        <div className="my-3 border-t border-white/10 pt-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Fitness tools
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
                {item.label}
                {!isPro && item.href !== "/food" && item.href !== "/workouts" && (
                  <span className="ml-auto text-[10px] text-white/30">Pro</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <p className="px-5 py-4 text-xs text-white/30">Evolve Fitness</p>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 shadow-[0_-8px_24px_rgba(17,20,24,0.06)] backdrop-blur-xl dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-[390px] grid-cols-5 px-2 pt-1.5">
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
                aria-label="Create post"
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
              className={`evolve-press relative flex min-h-[54px] flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors duration-200 ${
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
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
