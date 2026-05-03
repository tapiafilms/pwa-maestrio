import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/env";

let client: ReturnType<typeof createClient<any>> | null = null;

export function getSupabaseClient() {
  if (client) return client;

  client = createClient<any>(getRequiredEnv("SUPABASE_URL"), getRequiredEnv("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false }
  });

  return client;
}
