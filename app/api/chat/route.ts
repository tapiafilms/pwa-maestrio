import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, stage, problem, comuna, phone } = body;
    const anthropic = getAnthropicClient();

    if (stage === "search" && problem && phone) {
      const baseUrl = req.headers.get("origin") || "";
      fetch(`${baseUrl}/api/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${problem}. Comuna: ${comuna || "no especificada"}`, phone })
      }).catch(() => {});

      return NextResponse.json({
        text: `Perfecto, ya estoy buscando un técnico cerca de ${comuna || "tu ubicación"}. En unos segundos recibirás un WhatsApp. ¡No te muevas! 🔧`,
        stage: "done"
      });
    }

    const sys = `Eres el asistente de voz de Maestrio, marketplace de servicios del hogar en Chile. Amable, cercano y MUY breve.
SERVICIOS: gasfíter, electricista, cerrajero, pintor, técnico en electrodomésticos, limpieza.
Responde ÚNICAMENTE con JSON válido sin markdown: {"reply": "...", "stage": "..."}
ETAPAS:
- stage "problem": No tienes problema aún. Saluda brevemente y pide que describan el problema.
- stage "comuna": Tienes el problema. Pregunta solo en qué comuna está.
- stage "phone": Tienes problema y comuna. Pide número de WhatsApp.
- stage "search": Tienes todo. Anuncia que buscas técnico ahora.
REGLAS: máximo 2 oraciones, español chileno, tutéalo. Si el usuario da info antes, avanza de etapa.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: sys,
      messages: messages?.length > 0 ? messages : [{ role: "user", content: "inicio" }]
    });

    const raw = response.content[0]?.type === "text" ? response.content[0].text.trim() : "{}";
    const clean = raw.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json({ text: parsed.reply, stage: parsed.stage });
    } catch {
      return NextResponse.json({ text: raw, stage: "problem" });
    }
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}
