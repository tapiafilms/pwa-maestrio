import { getSupabaseClient } from "@/lib/supabase";
import type { Technician } from "@/types";

export async function findTechniciansByCategory(category: string, limit = 3): Promise<Technician[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("technicians")
    .select("*")
    .eq("active", true)
    .eq("category", category)
    .limit(limit);

  if (error) {
    throw new Error(`Failed to query technicians: ${error.message}`);
  }

  if ((data ?? []).length > 0) return data as Technician[];

  const fallback = await supabase
    .from("technicians")
    .select("*")
    .eq("active", true)
    .limit(2);

  if (fallback.error) {
    throw new Error(`Failed fallback query for technicians: ${fallback.error.message}`);
  }

  return (fallback.data ?? []) as Technician[];
}
