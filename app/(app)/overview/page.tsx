import { OverviewView } from "@/components/overview/overview-view";
import { requirePage } from "@/lib/guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  await requirePage("overview"); // admin only

  const supabase = await createClient();
  const [clientsRes, ordersRes, tasksRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, first_name, last_name, location, tag, created_at")
      .order("created_at", { ascending: true }),
    // Read financials through orders_safe (admin sees real amount/payment_status).
    supabase.from("orders_safe").select("id, status, amount, payment_status"),
    supabase
      .from("tasks")
      .select("id, task, due_date, pillar, done")
      .order("due_date", { ascending: true }),
  ]);

  return (
    <OverviewView
      clients={clientsRes.data ?? []}
      orders={ordersRes.data ?? []}
      tasks={tasksRes.data ?? []}
    />
  );
}
