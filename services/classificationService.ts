import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import type { ClassificationResult } from "@/types";

const ClassificationSchema = z.object({
  category: z.string().min(1),
  urgency: z.enum(["low", "medium", "high"])
});

export async function classifyProblem(message: string): Promise<ClassificationResult> {
  const prompt = `
Classify this home-service problem in JSON only.

Rules:
- category must be one short label (plumber, electrician, locksmith, painter, appliance_repair, cleaning, other)
- urgency must be low, medium, or high

Problem:
${message}
`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }]
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const parsed = ClassificationSchema.safeParse(JSON.parse(text));

  if (!parsed.success) {
    return { category: "other", urgency: "medium" };
  }

  return parsed.data;
}
