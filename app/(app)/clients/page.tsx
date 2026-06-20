import { ClientsView } from "@/components/clients/clients-view";
import { requirePage } from "@/lib/guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const session = await requirePage("clients"); // admin + user

  const supabase = await createClient();
  const [clientsRes, ordersRes] = await Promise.all([
    supabase
      .from("clients")
      .select(
        "id, first_name, last_name, phone, email, location, tag, notes, fit_notes, uk_size, height_cm, bust_in, waist_in, hip_in, high_hip_in, shoulder_in, sleeve_in, back_in, torso_in, created_at"
      )
      .order("created_at", { ascending: false }),
    // Order history amount comes through orders_safe (admin sees it, Staff NULL).
    supabase
      .from("orders_safe")
      .select("id, order_code, client_name, item, status, amount"),
  ]);

  return (
    <ClientsView
      clients={clientsRes.data ?? []}
      orders={ordersRes.data ?? []}
      role={session.role}
    />
  );
}
