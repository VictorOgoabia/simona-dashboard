"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AuthProvider } from "@/components/auth/auth-context";
import { ShellProvider } from "@/components/simona/shell-context";
import { ConfirmProvider } from "@/components/ui-kit/confirm";
import { ToastProvider } from "@/components/ui-kit/toast";
import { navForRole, PAGE_LABELS } from "@/lib/access";
import type { AppRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";

// Brand pill: sand for Admin, blue for Staff.
const PILL: Record<AppRole, { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "rp ra" },
  user: { label: "Staff", cls: "rp ro" },
};

/**
 * The authenticated app frame: brand top bar + role-aware nav + sign-out.
 * On wide screens the nav is an inline tab row; on small screens it collapses
 * into a hamburger dropdown.
 */
export function AuthedShell({
  role,
  displayName,
  email,
  children,
}: {
  role: AppRole;
  displayName: string | null;
  email: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close the mobile menu on navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const tabs = navForRole(role);
  const pill = PILL[role];

  const shellApi = { goTo: (page: string) => router.push("/" + page) };

  return (
    <AuthProvider value={{ role, displayName, email, signOut }}>
      <ShellProvider value={shellApi}>
        <ToastProvider>
        <ConfirmProvider>
        <div id="dash">
          <div className="topbar">
            <span className="brand">SIMONA</span>

            <nav
              id="app-nav"
              className={"navtabs" + (menuOpen ? " open" : "")}
              role="tablist"
            >
              {tabs.map((p) => (
                <Link
                  key={p}
                  href={"/" + p}
                  className={"ntab" + (pathname === "/" + p ? " active" : "")}
                  onClick={() => setMenuOpen(false)}
                >
                  {PAGE_LABELS[p]}
                </Link>
              ))}
            </nav>

            <div className="tbr">
              <span className={pill.cls}>{pill.label}</span>
              <Link
                href="/set-pin"
                className="lgbtn"
                title="Change PIN"
                aria-label="Change PIN"
              >
                <i className="ti ti-key" style={{ fontSize: 13 }} />
                <span className="lgtxt">PIN</span>
              </Link>
              <button className="lgbtn" onClick={signOut}>
                <i className="ti ti-logout" style={{ fontSize: 13 }} />
                <span className="lgtxt">Logout</span>
              </button>
              <button
                className="navtoggle"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="app-nav"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <i className={"ti " + (menuOpen ? "ti-x" : "ti-menu-2")} />
              </button>
            </div>

            {/* Tap-away backdrop for the mobile menu. */}
            <div
              className={"navbackdrop" + (menuOpen ? " show" : "")}
              onClick={() => setMenuOpen(false)}
            />
          </div>

          {/* Render the page client-side only (pages use the current date). */}
          <div className="main">{mounted ? children : null}</div>
        </div>
        </ConfirmProvider>
        </ToastProvider>
      </ShellProvider>
    </AuthProvider>
  );
}
