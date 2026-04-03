import { NextRequest, NextResponse } from "next/server";
import { diagnosticosDb } from "@/lib/diagnosticos-db";

function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get("cerebro_session");
  return cookie?.value === process.env.CEREBRO_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const id = request.nextUrl.searchParams.get("id");

    if (id) {
      const diagnostico = await diagnosticosDb.getById(id);
      if (!diagnostico) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      }
      return NextResponse.json(diagnostico);
    }

    const [diagnosticos, stats] = await Promise.all([
      diagnosticosDb.getAll(),
      diagnosticosDb.count(),
    ]);

    return NextResponse.json({ diagnosticos, stats });
  } catch (error) {
    console.error("[cerebro/diagnosticos] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
