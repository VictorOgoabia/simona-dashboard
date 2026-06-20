"use client";

import { createContext, useContext } from "react";

// Lets pages navigate between routes without importing the router everywhere.
// Provided by AuthedShell.
export interface ShellApi {
  goTo: (page: string) => void;
}

const ShellContext = createContext<ShellApi | null>(null);

export function ShellProvider({
  value,
  children,
}: {
  value: ShellApi;
  children: React.ReactNode;
}) {
  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}
