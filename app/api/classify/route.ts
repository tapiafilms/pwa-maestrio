import { NextRequest, NextResponse } from "next/server";
import { classifyProblem } from "@/services/classificationService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body?.message ?? "").trim();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const classification = await classifyProblem(message);
    return NextResponse.json(classification);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Classification failed" },
      { status: 500 }
    );
  }
}
