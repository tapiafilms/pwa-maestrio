import { NextRequest, NextResponse } from "next/server";
import { classifyProblem } from "@/services/classificationService";
import { createLead, createLeadOffers } from "@/services/leadService";
import { findTechniciansByCategory } from "@/services/matchingService";
import { notifyTechniciansForLead } from "@/services/whatsappService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body?.message ?? "").trim();
    const phone = String(body?.phone ?? "").trim();

    if (!message || !phone) {
      return NextResponse.json({ error: "message and phone are required" }, { status: 400 });
    }

    const classification = await classifyProblem(message);
    const lead = await createLead({
      message,
      clientPhone: phone,
      classification
    });

    const technicians = await findTechniciansByCategory(classification.category, 3);
    await createLeadOffers(
      lead.id,
      technicians.map((tech) => tech.id)
    );
    await notifyTechniciansForLead(message, technicians);

    return NextResponse.json({
      leadId: lead.id,
      category: classification.category,
      urgency: classification.urgency,
      techniciansContacted: technicians.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lead creation failed" },
      { status: 500 }
    );
  }
}
