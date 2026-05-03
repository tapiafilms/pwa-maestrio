import { getSupabaseClient } from "@/lib/supabase";
import type { ClassificationResult, Lead } from "@/types";

export async function createLead(input: {
  message: string;
  clientPhone: string;
  classification: ClassificationResult;
}): Promise<Lead> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      message: input.message,
      client_phone: input.clientPhone,
      category: input.classification.category,
      urgency: input.classification.urgency,
      status: "searching"
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create lead: ${error?.message ?? "unknown error"}`);
  }

  return data as Lead;
}

export async function createLeadOffers(leadId: string, technicianIds: string[]): Promise<void> {
  if (technicianIds.length === 0) return;
  const supabase = getSupabaseClient();

  const payload = technicianIds.map((technicianId) => ({
    lead_id: leadId,
    technician_id: technicianId,
    status: "pending"
  }));

  const { error } = await supabase.from("lead_offers").insert(payload);
  if (error) {
    throw new Error(`Failed to create lead offers: ${error.message}`);
  }
}
