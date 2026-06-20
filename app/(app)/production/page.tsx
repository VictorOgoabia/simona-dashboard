import { ProductionView } from "@/components/production/production-view";
import { requirePage } from "@/lib/guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  await requirePage("production"); // admin only (Staff is bounced)

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders_safe")
    .select("id, order_code, client_name, item, collection, due_date, status, qc_note")
    .in("status", ["In Production", "QC"])
    .order("due_date", { ascending: true });

  return <ProductionView orders={data ?? []} />;
}
