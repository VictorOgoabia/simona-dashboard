import { redirect } from "next/navigation";

import { AuthedShell } from "@/components/auth/authed-shell";
import { getSessionInfo } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionInfo();
  if (!session) redirect("/login");

  return (
    <AuthedShell
      role={session.role}
      displayName={session.displayName}
      email={session.email}
    >
      {children}
    </AuthedShell>
  );
}
