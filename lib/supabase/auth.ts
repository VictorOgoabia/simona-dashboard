import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "user";

export interface SessionInfo {
  userId: string;
  email: string | null;
  role: AppRole;
  displayName: string | null;
}

/**
 * Server-side helper: returns the authenticated user plus their role from
 * `profiles`, or null if there is no session. Use this in server components /
 * route handlers to gate by role (e.g. financials = admin only).
 */
export async function getSessionInfo(): Promise<SessionInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    email: user.email ?? null,
    role: profile?.role === "admin" ? "admin" : "user",
    displayName: profile?.display_name ?? null,
  };
}
