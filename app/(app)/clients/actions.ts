"use server";

import { revalidatePath } from "next/cache";

import { createClient as createSupabase } from "@/lib/supabase/server";

// Writable shape of a client row. The old generic *_in columns are intentionally
// NOT included — they stay in the DB untouched (preserved), and the form edits
// the new gender-specific measurement columns instead.
export interface ClientInput {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  location: string;
  tag: string;
  gender: string;
  notes: string;
  fit_notes: string;
  uk_size: string;
  height_cm: string;
  // gender-specific measurements (union of Man + Woman sets)
  shoulder: string;
  sleeve_length: string;
  sleeve_width: string;
  chest: string;
  tummy: string;
  waist: string;
  hip: string;
  thigh: string;
  pants_length: string;
  calf: string;
  shirt_length: string;
  bust: string;
  short_dress_length: string;
  long_dress_length: string;
  skirt_length: string;
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
