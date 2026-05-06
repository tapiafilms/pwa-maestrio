import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: `Eres el asistente de Maestrio, un marketplace de servicios del hogar en Chile. Amable, directo y MUY breve — como si hablaras en voz alta.

SERVICIOS DISPONIBLES: gasfíter, electricista, cerrajero, pintor, técnico en electrodomésticos, limpieza.

REGLAS ESTRICTAS:
- MÁXIMO 2 oraciones cortas. Nunca más. Sin listas ni puntos.
- Tu único trabajo es entender el problema del usuario y confirmarlo antes de buscar técnico.
- Si el usuario describe un problema del hogar, confirma que lo entendiste y dile que buscarás un técnico.
- Si es urgente (inundación, cortocircuito, incendio), dile que actúe rápido y que buscarás técnico de inmediato.
- Habla en español chileno, tutéalo.`,
      messages: [{ role: "user", content: message }]
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    return NextResponse.json({ text });

  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}
