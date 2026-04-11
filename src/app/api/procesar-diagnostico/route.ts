import { NextRequest, NextResponse } from "next/server";
import { diagnosticosDb } from "@/lib/diagnosticos-db";
import { inngest } from "@/inngest/client";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { diagnosticoId } = await request.json();

    if (!diagnosticoId) {
      return NextResponse.json({ error: "diagnosticoId requerido" }, { status: 400 });
    }

    const diagnostico = await diagnosticosDb.getById(diagnosticoId);
    if (!diagnostico) {
      return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });
    }

    const brief = {
      nombre: diagnostico.nombre,
      empresa: diagnostico.empresa,
      email: diagnostico.email,
      whatsapp: diagnostico.whatsapp,
      ...diagnostico.respuestas,
    };

    await inngest.send({
      name: "cerebro/pipeline.start",
      data: { diagnosticoId, brief },
    });

    return NextResponse.json({ started: true, diagnosticoId });
  } catch (error) {
    console.error("[procesar-diagnostico] Error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Error iniciando pipeline" }, { status: 500 });
  }
}
