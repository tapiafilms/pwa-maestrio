import { getSupabaseClient } from "@/lib/supabase";
import { sendWhatsAppMessage } from "@/services/whatsappService";
import type { Lead, Technician } from "@/types";

function normalizeIncomingPhone(phone: string): string {
  return phone.replace("whatsapp:", "").trim();
}

export async function assignLeadToFirstResponder(input: {
  fromPhone: string;
  body: string;
}): Promise<"assigned" | "already_assigned" | "ignored"> {
  if (input.body.trim().toUpperCase() !== "YES") return "ignored";
  const supabase = getSupabaseClient();

  const sender = normalizeIncomingPhone(input.fromPhone);
  const techResult = await supabase.from("technicians").select("*").eq("phone", sender).maybeSingle();
  if (techResult.error || !techResult.data) return "ignored";
  const technician = techResult.data as Technician;

  // We target the latest pending offer for this technician to avoid ambiguous YES replies.
  const offerResult = await supabase
    .from("lead_offers")
    .select("id, lead_id")
    .eq("technician_id", technician.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const offerData = offerResult.data as { lead_id: string } | null;
  if (offerResult.error || !offerData) return "ignored";
  const leadResult = await supabase.from("leads").select("*").eq("id", offerData.lead_id).maybeSingle();
  if (leadResult.error || !leadResult.data) return "ignored";
  const lead = leadResult.data as Lead;
  if (!lead || lead.status !== "searching" || lead.technician_id) return "already_assigned";

  // Atomic condition prevents race conditions: only one YES can switch searching -> assigned.
  const updateLeadResult = await supabase
    .from("leads")
    .update({ status: "assigned", technician_id: technician.id })
    .eq("id", lead.id)
    .eq("status", "searching")
    .is("technician_id", null)
    .select("*")
    .maybeSingle();

  if (updateLeadResult.error) {
    throw new Error(`Failed to assign lead: ${updateLeadResult.error.message}`);
  }

  if (!updateLeadResult.data) return "already_assigned";

  const leadId = lead.id;
  await supabase.from("lead_offers").update({ status: "accepted" }).eq("lead_id", leadId).eq("technician_id", technician.id);
  await supabase.from("lead_offers").update({ status: "expired" }).eq("lead_id", leadId).neq("technician_id", technician.id);

  await sendWhatsAppMessage(
    technician.phone,
    `Lead assigned! Client phone: ${lead.client_phone}`
  );
  await sendWhatsAppMessage(
    lead.client_phone,
    `A technician accepted your request. Technician phone: ${technician.phone}`
  );

  return "assigned";
}
