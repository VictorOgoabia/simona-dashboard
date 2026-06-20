import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renamed the "middleware" file convention to "proxy" — same mechanism.
// This runs on every matched request to refresh the Supabase session and guard
// routes (no session -> /login; session on /login -> /overview).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match every path except Next internals and static assets.
     * /login is intentionally matched so logged-in users get bounced to /overview.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
