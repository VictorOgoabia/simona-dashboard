"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

import { Modal } from "@/components/ui-kit/modal";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

const ConfirmContext = createContext<
  ((opts: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setState(opts);
      }),
    []
  );

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state ? (
        <Modal
          title={state.title}
          onClose={() => close(false)}
          maxWidth={420}
          footer={
            <>
              <button className="btn bg" onClick={() => close(false)}>
                {state.cancelText || "Cancel"}
              </button>
              <button
                className={"btn " + (state.destructive ? "bd" : "bp")}
                onClick={() => close(true)}
              >
                {state.confirmText || "Confirm"}
              </button>
            </>
          }
        >
          <p style={{ fontSize: 13, color: "var(--nt)", lineHeight: 1.6 }}>
            {state.message}
          </p>
        </Modal>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
