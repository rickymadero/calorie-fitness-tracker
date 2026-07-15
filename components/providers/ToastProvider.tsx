"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-[max(1.5rem,calc(5.75rem+env(safe-area-inset-bottom,0px)))] left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-8">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-apex-lg backdrop-blur-md ${
                item.variant === "success"
                  ? "border-accent/40 bg-card text-foreground"
                  : item.variant === "error"
                    ? "border-danger/40 bg-card text-foreground"
                    : "border-border bg-card text-foreground"
              }`}
            >
              <p className="flex-1 text-sm">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="text-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
