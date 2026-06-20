"use client";

import { createContext, useContext } from "react";

import type { AppRole } from "@/lib/supabase/auth";

export interface AuthValue {
  role: AppRole;
  displayName: string | null;
  email: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthValue;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the signed-in user's role + sign-out. Used to gate financials later. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
