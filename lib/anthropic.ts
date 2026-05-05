import Anthropic from "@anthropic-ai/sdk";
import { getRequiredEnv } from "@/lib/env";

let client: Anthropic | null = null;

export function getAnthropicClient() {
  if (client) return client;
  client = new Anthropic({ apiKey: getRequiredEnv("ANTHROPIC_API_KEY") });
  return client;
}
