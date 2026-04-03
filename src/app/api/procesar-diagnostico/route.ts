import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { diagnosticosDb } from "@/lib/diagnosticos-db";

export const maxDuration = 300;

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

    // Mark as processing
    await diagnosticosDb.updateEstado(diagnosticoId, "procesando");

    const respuestas = diagnostico.respuestas;

    const prompt = `Eres El Cerebro 360 — el sistema de inteligencia estratégica de Orlando Iguarán, el mejor creador de alianzas marca-influencer en Colombia.

Acabas de recibir un diagnóstico empresarial de un cliente potencial. Tu trabajo es analizar TODA la información y generar una estrategia completa, accionable y personalizada.

== DATOS DEL CLIENTE ==
Nombre: ${diagnostico.nombre}
Empresa: ${diagnostico.empresa}
Email: ${diagnostico.email}
WhatsApp: ${diagnostico.whatsapp}

== RESPUESTAS DEL CUESTIONARIO ==
NEGOCIO:
- Nombre del negocio: ${respuestas.businessName || "N/A"}
- Industria: ${respuestas.industry || "N/A"}
- Descripción: ${respuestas.businessDescription || "N/A"}
- Años en el mercado: ${respuestas.yearsInBusiness || "N/A"}
- Tamaño del equipo: ${respuestas.employeeCount || "N/A"}

DOLOR PRINCIPAL:
- Problema #1: ${respuestas.mainPain || "N/A"}
- Problemas específicos: ${respuestas.specificProblems || "N/A"}
- Lo que han intentado: ${respuestas.whatTheyTried || "N/A"}
- Nivel de urgencia (1-10): ${respuestas.urgencyLevel || "N/A"}
- Pérdida mensual estimada: ${respuestas.monthlyLoss || "N/A"}

MERCADO:
- Cliente ideal: ${respuestas.idealClient || "N/A"}
- Cómo consigue clientes: ${respuestas.currentClients || "N/A"}
- Servicios principales: ${respuestas.mainServices || "N/A"}
- Diferenciador: ${respuestas.differentiator || "N/A"}
- Competidores: ${respuestas.competitors || "N/A"}

SOLUCIÓN DIGITAL:
- Tipo de app: ${respuestas.appType || "N/A"}
- Features imprescindibles: ${respuestas.mustHaveFeatures || "N/A"}
- Presupuesto: ${respuestas.budget || "N/A"}
- Timeline: ${respuestas.timeline || "N/A"}

== TU MISIÓN ==
Genera una estrategia completa con estos 6 bloques. Sé directo, específico y accionable. No uses lenguaje genérico — todo debe ser personalizado para ESTE negocio.

BLOQUE 1: DIAGNÓSTICO EJECUTIVO
Un párrafo que resuma la situación real del negocio. Identifica el dolor raíz (no el síntoma).

BLOQUE 2: PRINCIPALES BRECHAS DETECTADAS
Lista las 3-5 brechas más críticas entre dónde están y dónde quieren estar. Sé brutal y honesto.

BLOQUE 3: OPORTUNIDADES INMEDIATAS
3-5 oportunidades que pueden capturar en las próximas 2 semanas sin inversión significativa.

BLOQUE 4: ESTRATEGIA RECOMENDADA 90 DÍAS
Plan de acción dividido en 3 fases de 30 días cada una. Cada fase con objetivos claros y acciones específicas.

BLOQUE 5: KPIs A MONITOREAR
5-7 métricas concretas que deben rastrear para medir progreso. Con targets específicos.

BLOQUE 6: PRÓXIMO PASO CONCRETO
UN solo paso que deben dar mañana para empezar. Específico, medible y alcanzable.

Formatea con markdown. Usa headers ##, listas, negrita para énfasis. Escribe en español colombiano profesional.`;

    const estrategia = await callClaude({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    // Save strategy to database
    await diagnosticosDb.updateEstrategia(diagnosticoId, estrategia);

    return NextResponse.json({
      success: true,
      diagnosticoId,
      estrategia,
    });
  } catch (error) {
    console.error("[procesar-diagnostico] Error:", error);

    // Try to mark as error
    try {
      const body = await request.clone().json().catch(() => ({}));
      if (body.diagnosticoId) {
        await diagnosticosDb.updateEstado(body.diagnosticoId, "error");
      }
    } catch { /* ignore */ }

    return NextResponse.json(
      { error: "Error procesando diagnóstico" },
      { status: 500 }
    );
  }
}
