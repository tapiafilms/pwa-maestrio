import { NextRequest, NextResponse } from "next/server";
import { assignLeadToFirstResponder } from "@/services/assignmentService";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = String(formData.get("From") ?? "");
    const body = String(formData.get("Body") ?? "");

    if (!from || !body) {
      return NextResponse.json({ ok: false, error: "Invalid webhook payload" }, { status: 400 });
    }

    const result = await assignLeadToFirstResponder({ fromPhone: from, body });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Webhook error" },
      { status: 500 }
    );
  }
}
