"use server";

import { revalidatePath } from "next/cache";

import { createClient as createSupabase } from "@/lib/supabase/server";

// Writable shape of a client row (everything except id / created_at).
export interface ClientInput {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  location: string;
  tag: string;
  notes: string;
  fit_notes: string;
  uk_size: string;
  height_cm: string;
  bust_in: string;
  waist_in: string;
  hip_in: string;
  high_hip_in: string;
  shoulder_in: string;
  sleeve_in: string;
  back_in: string;
  torso_in: string;
}

export async function createClientRecord(input: ClientInput) {
  const supabase = await createSupabase();
  const { error } = await supabase.from("clients").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

export async function updateClientRecord(id: string, input: ClientInput) {
  const supabase = await createSupabase();
  const { error } = await supabase.from("clients").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

export async function deleteClientRecord(id: string) {
  const supabase = await createSupabase();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}
