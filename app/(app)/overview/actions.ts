"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Persist a task's done-state to the tasks table. Writes with return=minimal
 * (no .select() chained) and revalidates the overview so counts stay in sync.
 */
export async function toggleTaskDone(id: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/overview");
}
