"use server";

import { revalidatePath } from "next/cache";

import { createClient as createSupabase } from "@/lib/supabase/server";

// Writes target the BASE orders table with return=minimal (no .select()).

export async function saveQcNote(id: string, qc_note: string) {
  const supabase = await createSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ qc_note })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/production");
}

// Advance the order along production (In Production -> QC -> Ready), saving the
// current QC note at the same time.
export async function advanceProduction(
  id: string,
  status: string,
  qc_note: string
) {
  const supabase = await createSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status, qc_note })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/production");
}
