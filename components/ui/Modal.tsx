"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const widths = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby={title ? "modal-title" : undefined}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={`relative z-10 flex max-h-[min(92dvh,100%)] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-apex-lg sm:max-h-[90dvh] sm:rounded-apex-lg ${widths[size]}`}
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 px-5 pb-3 pt-2 sm:px-6 sm:pt-5">
              {title ? (
                <h2
                  id="modal-title"
                  className="font-display text-lg font-semibold"
                >
                  {title}
                </h2>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted transition hover:bg-muted-bg hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 sm:px-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
