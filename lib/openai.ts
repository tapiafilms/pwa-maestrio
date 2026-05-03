import OpenAI from "openai";
import { getRequiredEnv } from "@/lib/env";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (client) return client;
  client = new OpenAI({ apiKey: getRequiredEnv("OPENAI_API_KEY") });
  return client;
}
