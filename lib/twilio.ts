import twilio from "twilio";
import { getRequiredEnv } from "@/lib/env";

let client: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (client) return client;
  client = twilio(getRequiredEnv("TWILIO_SID"), getRequiredEnv("TWILIO_AUTH_TOKEN"));
  return client;
}
