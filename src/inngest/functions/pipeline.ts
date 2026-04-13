import { inngest } from "../client";
import { callAnthropicWithRetry } from "@/lib/anthropic-retry";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
  return createClient(url, key);
}

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no configurada");
  const response = await callAnthropicWithRetry(
    { model: "claude-sonnet-4-6", max_tokens: 2000, messages: [{ role: "user", content: prompt }] },
    apiKey,
  );
  return response.content.find(b => b.type === "text")?.text ?? "";
}

// Stores progress as JSON in estrategia_generada; final step replaces with markdown report
async function saveProgress(
  id: string,
  pipelineStatus: string,
  outputs: Record<string, string>
) {
  const supabase = getSupabase();
  await supabase
    .from("diagnosticos")
    .update({
      estado: "procesando",
      estrategia_generada: JSON.stringify({ __pipeline: true, pipeline_status: pipelineStatus, ...outputs }),
    })
    .eq("id", id);
}

export const cerebroPipeline = inngest.createFunction(
  {
    id: "cerebro-pipeline",
    triggers: [{ event: "cerebro/pipeline.start" }],
  },
  async ({ event, step }) => {
    const { diagnosticoId, brief } = event.data as {
      diagnosticoId: string;
      brief: Record<string, string>;
    };

    const briefText = `
DATOS DEL CLIENTE:
Nombre: ${brief.nombre || "N/A"}
Empresa: ${brief.empresa || brief.businessName || "N/A"}

NEGOCIO:
- Nombre: ${brief.businessName || "N/A"}
- Industria: ${brief.industry || "N/A"}
- Descripción: ${brief.businessDescription || "N/A"}
- Facturación mensual: ${brief.monthlyRevenue || "N/A"}
- Ticket promedio: ${brief.averageTicket || "N/A"}
- Años en el mercado: ${brief.yearsInBusiness || "N/A"}
- Equipo: ${brief.employeeCount || "N/A"}

DOLOR:
- Problema #1: ${brief.mainPain || "N/A"}
- Impacto diario: ${brief.dailyImpact || "N/A"}
- Lo que han intentado: ${brief.whatTheyTried || "N/A"}
- Urgencia (1-10): ${brief.urgencyLevel || "N/A"}
- Pérdida mensual: ${brief.monthlyLoss || "N/A"}

MERCADO:
- Cliente ideal: ${brief.idealClient || "N/A"}
- Canales de adquisición: ${brief.acquisitionChannels || "N/A"}
- Clientes nuevos/mes: ${brief.newClientsPerMonth || "N/A"}
- Servicios principales: ${brief.mainServices || "N/A"}
- Diferenciador: ${brief.differentiator || "N/A"}
- Competidores: ${brief.competitors || "N/A"}

OBJETIVO:
- Meta 90 días: ${brief.goal90Days || "N/A"}
- Meta numérica: ${brief.numericGoal || "N/A"}
- Presupuesto: ${brief.investmentBudget || "N/A"}
    `.trim();

    // ── AGENTE 1: Diagnóstico Ejecutivo ────────────────────────────────────
    const diagnostico = await step.run("diagnostico-ejecutivo", async () => {
      await saveProgress(diagnosticoId, "procesando_diagnostico", {});

      const result = await callClaude(`Eres el Método 360 de Orlando Iguarán. Analiza este negocio y genera un DIAGNÓSTICO EJECUTIVO con scoring 0-100 en estos 9 pilares: Propuesta de Valor, Modelo de Ingresos, Adquisición de Clientes, Retención, Operaciones, Equipo, Finanzas, Marketing Digital, Tecnología. Para cada pilar: score, fortaleza clave, brecha crítica. Al final: score global y clasificación (ÉLITE 85+, SÓLIDO 70-84, EN DESARROLLO 50-69, ZONA CRÍTICA <50).

${briefText}`);

      await saveProgress(diagnosticoId, "procesando_brechas", { diagnostico: result });
      return result;
    });

    // ── AGENTE 2: Brechas Críticas ─────────────────────────────────────────
    const brechas = await step.run("brechas-criticas", async () => {
      const result = await callClaude(`Basándote en este diagnóstico:

${diagnostico}

Identifica las 3 BRECHAS CRÍTICAS que más impacto tienen en la facturación. Para cada brecha: nombre, descripción, impacto mensual estimado en COP, causa raíz, señal de alerta que ya está visible.

Contexto del negocio:
${briefText}`);

      await saveProgress(diagnosticoId, "procesando_plan", { diagnostico, brechas: result });
      return result;
    });

    // ── AGENTE 3: Plan 90 Días ─────────────────────────────────────────────
    const plan = await step.run("plan-90-dias", async () => {
      const result = await callClaude(`Con este diagnóstico:

${diagnostico}

Y estas brechas críticas:
${brechas}

Diseña un PLAN DE ACCIÓN 90 DÍAS en 3 fases de 30 días. Cada fase: objetivo, 3 acciones concretas con responsable y métrica de éxito, inversión estimada, resultado esperado al finalizar la fase.

Meta del cliente: ${brief.goal90Days || "N/A"} — Meta numérica: ${brief.numericGoal || "N/A"}`);

      await saveProgress(diagnosticoId, "procesando_propuesta", { diagnostico, brechas, plan: result });
      return result;
    });

    // ── AGENTE 4: Propuesta Comercial ──────────────────────────────────────
    const propuesta = await step.run("propuesta-comercial", async () => {
      const result = await callClaude(`Eres Orlando Iguarán, el mejor consultor de alianzas marca-influencer de Colombia. Con este diagnóstico completo:

DIAGNÓSTICO:
${diagnostico}

BRECHAS:
${brechas}

PLAN:
${plan}

Diseña una PROPUESTA COMERCIAL para este cliente: servicio recomendado (Método 360 básico $1M COP / estándar $2.5M COP / premium $5M COP), justificación del precio basada en el ROI proyectado, qué incluye, garantía de resultado, llamado a la acción urgente.

Disposición de inversión del cliente: ${brief.investmentBudget || "N/A"}`);

      await saveProgress(diagnosticoId, "procesando_reporte", { diagnostico, brechas, plan, propuesta: result });
      return result;
    });

    // ── AGENTE 5: Reporte Final ────────────────────────────────────────────
    const reporteFinal = await step.run("reporte-final", async () => {
      const result = await callClaude(`Consolida todo en un REPORTE EJECUTIVO FINAL estructurado en markdown con: resumen ejecutivo (3 oraciones), los 5 bloques anteriores integrados, tabla resumen de KPIs con targets a 30-60-90 días, y cierre con la propuesta de Orlando. Tono: consultor senior de McKinsey hablando con un fundador colombiano.

DIAGNÓSTICO EJECUTIVO:
${diagnostico}

BRECHAS CRÍTICAS:
${brechas}

PLAN 90 DÍAS:
${plan}

PROPUESTA COMERCIAL:
${propuesta}

Cliente: ${brief.nombre || brief.businessName} — Empresa: ${brief.businessName}`);

      const supabase = getSupabase();
      await supabase
        .from("diagnosticos")
        .update({
          estado: "procesado",
          estrategia_generada: JSON.stringify({
            __pipeline: true,
            pipeline_status: "completado",
            diagnostico,
            brechas,
            plan,
            propuesta,
            reporte_final: result,
          }),
        })
        .eq("id", diagnosticoId);

      return result;
    });

    return { diagnosticoId, status: "completado", agentes: 5 };
  }
);
