"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  MoreVertical,
  UserPen,
  SlidersHorizontal,
  Archive,
  Bookmark,
  Bell,
  Shield,
  HelpCircle,
  Info,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSocial } from "@/components/social/SocialProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAppTranslation } from "@/components/providers/LanguageProvider";
import { easeOut } from "@/lib/motion";

export function ProfileOverflowMenu() {
  const { logout } = useAuth();
  const { myProfile, ensureMyProfile } = useSocial();
  const { toast } = useToast();
  const { t } = useAppTranslation(["common", "profile"]);
  const router = useRouter();
  const reduce = useReducedMotion();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const profile = myProfile ?? ensureMyProfile();
  const privacyLabel =
    profile?.visibility === "private"
      ? t("labels.private")
      : t("labels.public");

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent | TouchEvent) {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  function handleLogout() {
    setOpen(false);
    logout();
    toast(t("success.signedOut"), "info");
    router.push("/");
  }

  const items: {
    href: string;
    label: string;
    icon: typeof UserPen;
    hint?: string;
  }[] = [
    { href: "/settings", label: t("menu.editProfile"), icon: UserPen },
    {
      href: "/settings/preferences",
      label: t("menu.preferences"),
      icon: SlidersHorizontal,
    },
    { href: "/stories/archive", label: t("menu.archive"), icon: Archive },
    { href: "/profile/saved", label: t("menu.saved"), icon: Bookmark },
    {
      href: "/settings/notifications",
      label: t("menu.notifications"),
      icon: Bell,
    },
    {
      href: "/settings/privacy",
      label: t("menu.privacy"),
      icon: Shield,
      hint: privacyLabel,
    },
    { href: "/settings/help", label: t("menu.help"), icon: HelpCircle },
    { href: "/settings/about", label: t("menu.about"), icon: Info },
  ];

  const menu = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={t("a11y.profileMenu")}
          initial={
            reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -6 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.2, ease: easeOut }}
          style={{ top: coords.top, right: coords.right }}
          className="fixed z-[80] w-[min(17.5rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-[#0e1116] shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
        >
          <ul className="py-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    className="flex min-h-11 items-center gap-3 px-3.5 text-sm text-white/85 transition-colors hover:bg-accent-soft hover:text-accent focus-visible:bg-accent-soft focus-visible:text-accent focus-visible:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={17} className="shrink-0 opacity-80" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {item.label}
                    </span>
                    {item.hint ? (
                      <span className="shrink-0 text-[11px] text-white/40">
                        {item.hint}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-white/10 py-1.5">
            <button
              type="button"
              role="menuitem"
              className="flex min-h-11 w-full items-center gap-3 px-3.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:bg-danger/10 focus-visible:outline-none"
              onClick={handleLogout}
            >
              <LogOut size={17} className="shrink-0" />
              {t("menu.logout")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("a11y.moreOptions")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted transition hover:bg-muted-bg hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={22} />
      </button>
      {mounted ? createPortal(menu, document.body) : null}
    </div>
  );
}
