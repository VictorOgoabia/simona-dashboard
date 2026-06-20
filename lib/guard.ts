import { redirect } from "next/navigation";

import { canAccess, landingFor, type PageKey } from "@/lib/access";
import { getSessionInfo, type SessionInfo } from "@/lib/supabase/auth";

/**
 * Server-side page guard. Call at the top of every protected page so the page
 * itself rejects unauthorized roles (don't rely on hidden nav alone):
 *   - no session            -> /login
 *   - role can't see `page`  -> the role's landing page (user -> /clients)
 */
export async function requirePage(page: PageKey): Promise<SessionInfo> {
  const session = await getSessionInfo();
  if (!session) redirect("/login");
  if (!canAccess(session.role, page)) {
    redirect("/" + landingFor(session.role));
  }
  return session;
}
