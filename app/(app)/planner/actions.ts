"use server";

import { revalidatePath } from "next/cache";

import { createClient as createSupabase } from "@/lib/supabase/server";

// All writes target the tasks table with return=minimal (no .select()).

export interface NewTaskInput {
  task: string;
  due_date: string | null;
  pillar: string;
  assigned_to: string;
  priority: string;
}

export async function createTask(input: NewTaskInput) {
  const supabase = await createSupabase();
  const { error } = await supabase.from("tasks").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/planner");
}

export async function setTaskDone(id: string, done: boolean) {
  const supabase = await createSupabase();
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/planner");
}

export async function deleteTask(id: string) {
  const supabase = await createSupabase();
  // .select() is fine here (tasks table, not the financial orders table) — it
  // lets us confirm a row was actually removed and surface silent RLS failures.
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("Task was not deleted (not found or not permitted).");
  }
  revalidatePath("/planner");
}
