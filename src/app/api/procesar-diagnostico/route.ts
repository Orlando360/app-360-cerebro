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

    const r = diagnostico.respuestas;

    const prompt = `Eres El Cerebro 360 — el sistema de inteligencia estratégica de Orlando Iguarán, el mejor creador de alianzas marca-influencer en Colombia.

Acabas de recibir un diagnóstico empresarial completo. Tu trabajo es analizar TODA la información y generar una estrategia calibrada al nivel real del negocio.

== DATOS DEL CLIENTE ==
Nombre: ${diagnostico.nombre}
Empresa: ${diagnostico.empresa}
Email: ${diagnostico.email}
WhatsApp: ${diagnostico.whatsapp}

== NEGOCIO ==
- Nombre: ${r.businessName || "N/A"}
- Industria: ${r.industry || "N/A"}
- Qué hace y a quién sirve: ${r.businessDescription || "N/A"}
- Facturación mensual: ${r.monthlyRevenue || "N/A"}
- Ticket promedio por cliente: ${r.averageTicket || "N/A"}
- Años en el mercado: ${r.yearsInBusiness || "N/A"}
- Tamaño del equipo: ${r.employeeCount || "N/A"}

== DOLOR ==
- Problema #1: ${r.mainPain || "N/A"}
- Impacto en el día a día: ${r.dailyImpact || "N/A"}
- Lo que han intentado: ${r.whatTheyTried || "N/A"}
- Urgencia (1-10): ${r.urgencyLevel || "N/A"}
- Pérdida mensual estimada: ${r.monthlyLoss || "N/A"}

== MERCADO ==
- Cliente ideal: ${r.idealClient || "N/A"}
- Canales de adquisición actuales: ${r.acquisitionChannels || "N/A"}
- Clientes nuevos por mes: ${r.newClientsPerMonth || "N/A"}
- Servicios/productos principales: ${r.mainServices || "N/A"}
- Diferenciador: ${r.differentiator || "N/A"}
- Competidores: ${r.competitors || "N/A"}

== OBJETIVO ==
- Meta a 90 días: ${r.goal90Days || "N/A"}
- Meta numérica concreta: ${r.numericGoal || "N/A"}
- Disposición de inversión: ${r.investmentBudget || "N/A"}

== INSTRUCCIONES PARA CALIBRAR LA ESTRATEGIA ==
IMPORTANTE: Usa la facturación (${r.monthlyRevenue || "N/A"}), el ticket promedio (${r.averageTicket || "N/A"}), los clientes nuevos/mes (${r.newClientsPerMonth || "N/A"}) y los canales de adquisición (${r.acquisitionChannels || "N/A"}) para calibrar el nivel de la estrategia:
- Si factura <$5M COP → estrategia de supervivencia y primeros ingresos
- Si factura $5M-$50M COP → estrategia de estabilización y crecimiento
- Si factura >$50M COP → estrategia de escalamiento y optimización
- Los KPIs y targets deben ser REALISTAS para su nivel actual
- Las recomendaciones de inversión deben ser proporcionales a su facturación

== TU MISIÓN ==
Genera una estrategia completa con estos 6 bloques. Sé directo, específico y accionable. No uses lenguaje genérico — todo debe ser personalizado para ESTE negocio en su nivel actual.

BLOQUE 1: DIAGNÓSTICO EJECUTIVO
Un párrafo que resuma la situación real del negocio. Incluye contexto de facturación y ticket promedio para calibrar la dimensión del problema. Identifica el dolor raíz (no el síntoma).

BLOQUE 2: PRINCIPALES BRECHAS DETECTADAS
3-5 brechas críticas. Para cada una, indica el impacto estimado en $ basado en su facturación y ticket promedio actual. Sé brutal y honesto.

BLOQUE 3: OPORTUNIDADES INMEDIATAS
3-5 oportunidades concretas para las próximas 2 semanas. Prioriza según los canales de adquisición que YA usan (${r.acquisitionChannels || "N/A"}). Incluye estimado de impacto en clientes nuevos basado en su volumen actual (${r.newClientsPerMonth || "N/A"}/mes).

BLOQUE 4: ESTRATEGIA RECOMENDADA 90 DÍAS
Plan de acción en 3 fases de 30 días. Cada fase con:
- Objetivo claro vinculado a su meta numérica (${r.numericGoal || "N/A"})
- 3-5 acciones específicas
- Inversión estimada por fase (calibrada a su disposición: ${r.investmentBudget || "N/A"})
- Revenue esperado por fase

BLOQUE 5: KPIs A MONITOREAR
5-7 métricas con targets ESPECÍFICOS calibrados a su nivel:
- Usar su facturación actual como baseline
- Usar su ticket promedio para calcular targets de conversión
- Usar su volumen de clientes/mes para targets de crecimiento

BLOQUE 6: PRÓXIMO PASO CONCRETO
UN solo paso para mañana. Específico, medible y alcanzable para un negocio de su tamaño.

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
