import type { AppRole } from "@/lib/supabase/auth";

// Single source of truth for page-level access control.
// admin -> every page; user (Staff) -> only Clients, Orders, Planner.

export type PageKey =
  | "overview"
  | "clients"
  | "orders"
  | "planner"
  | "production"
  | "settings";

export const PAGE_LABELS: Record<PageKey, string> = {
  overview: "Overview",
  clients: "Clients",
  orders: "Orders",
  planner: "Planner",
  production: "Production",
  settings: "Settings",
};

// Order the tabs appear in the top nav.
export const NAV_ORDER: PageKey[] = [
  "overview",
  "clients",
  "orders",
  "planner",
  "production",
  "settings",
];

// Which roles may access each page.
export const PAGE_ACCESS: Record<PageKey, AppRole[]> = {
  overview: ["admin"],
  clients: ["admin", "user"],
  orders: ["admin", "user"],
  planner: ["admin", "user"],
  production: ["admin"],
  settings: ["admin"],
};

export function canAccess(role: AppRole, page: PageKey): boolean {
  return PAGE_ACCESS[page].includes(role);
}

/** Pages the role may see, in nav order. */
export function navForRole(role: AppRole): PageKey[] {
  return NAV_ORDER.filter((page) => canAccess(role, page));
}

/** Where a role lands after login / when bounced from a forbidden page. */
export function landingFor(role: AppRole): PageKey {
  return role === "admin" ? "overview" : "clients";
}
