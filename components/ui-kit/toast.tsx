"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastVariant = "default" | "success" | "error";
interface ToastItem {
  id: number;
  title: string;
  variant: ToastVariant;
}

const ToastContext = createContext<
  ((t: { title: string; variant?: ToastVariant }) => void) | null
>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback(
    (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );

  const toast = useCallback(
    ({ title, variant = "default" }: { title: string; variant?: ToastVariant }) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, title, variant }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="toastwrap"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div key={t.id} className={"toast t-" + t.variant} role="status">
            <i
              className={
                "ti " +
                (t.variant === "error"
                  ? "ti-alert-circle"
                  : t.variant === "success"
                    ? "ti-circle-check"
                    : "ti-info-circle")
              }
            />
            <span style={{ flex: 1 }}>{t.title}</span>
            <button
              className="toastx"
              aria-label="Dismiss"
              onClick={() => remove(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
