import { OrdersView } from "@/components/orders/orders-view";
import { requirePage } from "@/lib/guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requirePage("orders"); // admin + user

  const supabase = await createClient();
  const [ordersRes, clientsRes] = await Promise.all([
    // Always read orders through orders_safe (admin sees amount/payment, Staff NULL).
    supabase
      .from("orders_safe")
      .select(
        "id, order_code, client_id, client_name, order_type, item, collection, amount, payment_status, order_date, due_date, status, assigned_to, notes, qc_note, ops_note, gender, shoulder, sleeve_length, sleeve_width, chest, tummy, waist, hip, thigh, pants_length, calf, shirt_length, bust, short_dress_length, long_dress_length, skirt_length"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select(
        "id, first_name, last_name, gender, uk_size, height_cm, shoulder, sleeve_length, sleeve_width, chest, tummy, waist, hip, thigh, pants_length, calf, shirt_length, bust, short_dress_length, long_dress_length, skirt_length, fit_notes"
      ),
  ]);

  return (
    <OrdersView
      orders={ordersRes.data ?? []}
      clients={clientsRes.data ?? []}
      role={session.role}
    />
  );
}
