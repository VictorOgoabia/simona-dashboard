import { redirect } from "next/navigation";

import { SetPinScreen } from "@/components/auth/set-pin-screen";
import { getSessionInfo } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function SetPinPage() {
  const session = await getSessionInfo();
  if (!session) redirect("/login");

  return <SetPinScreen role={session.role} mustChange={session.mustChangePin} />;
}
