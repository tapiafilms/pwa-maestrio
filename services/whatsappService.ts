import { getRequiredEnv } from "@/lib/env";
import { getTwilioClient } from "@/lib/twilio";
import type { Technician } from "@/types";

function toWhatsAppAddress(phone: string): string {
  return phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const twilioClient = getTwilioClient();
  await twilioClient.messages.create({
    from: toWhatsAppAddress(getRequiredEnv("TWILIO_WHATSAPP_NUMBER")),
    to: toWhatsAppAddress(to),
    body
  });
}

export async function notifyTechniciansForLead(problem: string, technicians: Technician[]): Promise<void> {
  await Promise.all(
    technicians.map((tech) =>
      sendWhatsAppMessage(
        tech.phone,
        `New client: ${problem}\nReply YES to accept.`
      )
    )
  );
}
