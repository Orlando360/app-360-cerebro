import { NextRequest, NextResponse } from "next/server";
import { db, ClientSubmission } from "@/lib/db";
import { diagnosticosDb } from "@/lib/diagnosticos-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["businessName", "industry", "mainPain", "contactName", "contactEmail", "contactPhone"];
    for (const field of required) {
      if (!body[field] || body[field].trim() === "") {
        return NextResponse.json(
          { error: `Campo requerido: ${field}` },
          { status: 400 }
        );
      }
    }

    const clientId = `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const client: ClientSubmission = {
      id: clientId,
      createdAt: new Date().toISOString(),
      status: "nuevo",
      notified: false,

      businessName: body.businessName?.trim() || "",
      industry: body.industry?.trim() || "",
      businessDescription: body.businessDescription?.trim() || "",
      yearsInBusiness: body.yearsInBusiness?.trim() || "1",
      employeeCount: body.employeeCount?.trim() || "1-5",

      mainPain: body.mainPain?.trim() || "",
      specificProblems: body.specificProblems?.trim() || "",
      whatTheyTried: body.whatTheyTried?.trim() || "",
      urgencyLevel: parseInt(body.urgencyLevel) || 5,
      monthlyLoss: body.monthlyLoss?.trim() || "",

      idealClient: body.idealClient?.trim() || "",
      currentClients: body.currentClients?.trim() || "",
      mainServices: body.mainServices?.trim() || "",
      differentiator: body.differentiator?.trim() || "",
      competitors: body.competitors?.trim() || "",

      appType: body.appType?.trim() || "landing",
      mustHaveFeatures: body.mustHaveFeatures?.trim() || "",
      budget: body.budget?.trim() || "",
      timeline: body.timeline?.trim() || "",

      contactName: body.contactName?.trim() || "",
      contactEmail: body.contactEmail?.trim() || "",
      contactPhone: body.contactPhone?.trim() || "",
      preferredContact: body.preferredContact?.trim() || "whatsapp",
    };

    // Save to factory_clients (existing flow)
    await db.add(client);

    // Save to diagnosticos table + trigger Claude processing in background
    const diagnosticoId = `diag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      await diagnosticosDb.create({
        id: diagnosticoId,
        nombre: client.contactName,
        empresa: client.businessName,
        email: client.contactEmail,
        whatsapp: client.contactPhone,
        respuestas: body,
        estado: "pendiente",
      });

      // Fire-and-forget: trigger Claude processing in background
      const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || "http://localhost:3000";

      fetch(`${baseUrl}/api/procesar-diagnostico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosticoId }),
      }).catch((err) => {
        console.error("[Submit] Background processing trigger failed:", err);
      });
    } catch (err) {
      // Don't block submission if diagnosticos fails
      console.error("[Submit] Diagnosticos save failed (non-blocking):", err);
    }

    return NextResponse.json({
      success: true,
      message: "Diagnóstico recibido exitosamente",
      clientId: client.id,
    });
  } catch (error) {
    console.error("Error processing submission:", error);
    return NextResponse.json(
      { error: "Error procesando el formulario" },
      { status: 500 }
    );
  }
}
