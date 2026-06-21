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
        "id, first_name, last_name, phone, email, location, tag, gender, notes, fit_notes, uk_size, height_cm, shoulder, sleeve_length, sleeve_width, chest, tummy, waist, hip, thigh, pants_length, calf, shirt_length, bust, short_dress_length, long_dress_length, skirt_length, created_at"
      )
      .order("created_at", { ascending: false }),
    // Order history amount comes through orders_safe (admin sees it, Staff NULL).
    supabase
      .from("orders_safe")
      .select("id, order_code, client_id, client_name, item, status, amount"),
  ]);

  return (
    <ClientsView
      clients={clientsRes.data ?? []}
      orders={ordersRes.data ?? []}
      role={session.role}
    />
  );
}
