import { z } from "zod";
import { getAnthropicClient } from "@/lib/anthropic";
import type { ClassificationResult } from "@/types";

const ClassificationSchema = z.object({
  category: z.string().min(1),
  urgency: z.enum(["low", "medium", "high"])
});

export async function classifyProblem(message: string): Promise<ClassificationResult> {
  const prompt = `Classify this home-service problem. Respond ONLY with a JSON object, no extra text.

Rules:
- category must be one short label: plumber, electrician, locksmith, painter, appliance_repair, cleaning, other
- urgency must be: low, medium, or high

Problem:
${message}

Respond with exactly this format:
{"category": "...", "urgency": "..."}`;

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text.trim() : "{}";

  // Strip markdown code fences if present
  const clean = text.replace(/```json|```/g, "").trim();

  const parsed = ClassificationSchema.safeParse(JSON.parse(clean));

  if (!parsed.success) {
    return { category: "other", urgency: "medium" };
  }

  return parsed.data;
}
