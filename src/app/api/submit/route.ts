import { NextRequest, NextResponse } from "next/server";
import { db, ClientSubmission } from "@/lib/db";
import { diagnosticosDb } from "@/lib/diagnosticos-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields (new questionnaire)
    const required = ["contactName", "contactPhone", "contactEmail", "businessName", "industry", "businessDescription", "monthlyRevenue", "averageTicket", "yearsInBusiness", "mainPain", "dailyImpact", "urgencyLevel", "idealClient", "acquisitionChannels", "newClientsPerMonth", "mainServices", "differentiator", "goal90Days", "numericGoal"];
    for (const field of required) {
      if (!body[field] || body[field].trim() === "") {
        return NextResponse.json(
          { error: `Campo requerido: ${field}` },
          { status: 400 }
        );
      }
    }

    const clientId = `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Map to factory_clients format (backward compatible)
    const client: ClientSubmission = {
      id: clientId,
      createdAt: new Date().toISOString(),
      status: "nuevo",
      notified: false,

      businessName: body.businessName?.trim() || "",
      industry: body.industry?.trim() || "",
      businessDescription: body.businessDescription?.trim() || "",
      yearsInBusiness: body.yearsInBusiness?.trim() || "",
      employeeCount: body.employeeCount?.trim() || "",

      mainPain: body.mainPain?.trim() || "",
      specificProblems: body.dailyImpact?.trim() || "",
      whatTheyTried: body.whatTheyTried?.trim() || "",
      urgencyLevel: parseInt(body.urgencyLevel) || 5,
      monthlyLoss: body.monthlyLoss?.trim() || "",

      idealClient: body.idealClient?.trim() || "",
      currentClients: body.acquisitionChannels?.trim() || "",
      mainServices: body.mainServices?.trim() || "",
      differentiator: body.differentiator?.trim() || "",
      competitors: body.competitors?.trim() || "",

      appType: "diagnostico",
      mustHaveFeatures: body.goal90Days?.trim() || "",
      budget: body.investmentBudget?.trim() || "",
      timeline: body.numericGoal?.trim() || "",

      contactName: body.contactName?.trim() || "",
      contactEmail: body.contactEmail?.trim() || "",
      contactPhone: body.contactPhone?.trim() || "",
      preferredContact: "whatsapp",
    };

    // Save to factory_clients (existing flow)
    await db.add(client);

    // Save to diagnosticos table + trigger Claude processing in background
    const diagnosticoId = `diag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      await diagnosticosDb.create({
        id: diagnosticoId,
        nombre: body.contactName?.trim() || "",
        empresa: body.businessName?.trim() || "",
        email: body.contactEmail?.trim() || "",
        whatsapp: body.contactPhone?.trim() || "",
        respuestas: body,
        estado: "pendiente",
      });

    } catch (err) {
      // Don't block submission if diagnosticos fails
      console.error("[Submit] Diagnosticos save failed (non-blocking):", err);
    }

    return NextResponse.json({
      success: true,
      message: "Diagnóstico recibido exitosamente",
      clientId: client.id,
      diagnosticoId,
    });
  } catch (error) {
    console.error("Error processing submission:", error);
    return NextResponse.json(
      { error: "Error procesando el formulario" },
      { status: 500 }
    );
  }
}
