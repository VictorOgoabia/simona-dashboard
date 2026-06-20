import { redirect } from "next/navigation";

import { landingFor } from "@/lib/access";
import { getSessionInfo } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSessionInfo();
  if (!session) redirect("/login");
  // admin -> /overview, user -> /clients
  redirect("/" + landingFor(session.role));
}
