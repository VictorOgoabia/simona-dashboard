import { PlannerView } from "@/components/planner/planner-view";
import { requirePage } from "@/lib/guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  await requirePage("planner"); // admin + user

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("id, task, due_date, pillar, assigned_to, priority, done")
    .order("due_date", { ascending: true });

  return <PlannerView tasks={data ?? []} />;
}
