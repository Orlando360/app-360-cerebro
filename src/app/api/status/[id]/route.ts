import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("diagnosticos")
    .select("id, estado, estrategia_generada")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Diagnóstico no encontrado" }, { status: 404 });
  }

  // estrategia_generada stores JSON while pipeline runs, then the final markdown
  let pipelineStatus = data.estado === "procesado" ? "completado" : data.estado;
  let agentOutputs: Record<string, string> = {};

  if (data.estrategia_generada) {
    try {
      const parsed = JSON.parse(data.estrategia_generada);
      if (parsed.__pipeline) {
        pipelineStatus = parsed.pipeline_status || pipelineStatus;
        agentOutputs = parsed;
      }
    } catch {
      // Plain string — final report (legacy single-prompt format)
      pipelineStatus = "completado";
      agentOutputs = { reporte_final: data.estrategia_generada };
    }
  }

  return NextResponse.json({
    id: data.id,
    estado: data.estado,
    pipeline_status: pipelineStatus,
    agent_outputs: agentOutputs,
  });
}
