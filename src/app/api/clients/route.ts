import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

function isAuthorized(req: NextRequest): boolean {
  // Check bearer token header
  const authHeader = req.headers.get("authorization");
  const secret = process.env.DASHBOARD_SECRET;
  if (secret && authHeader === `Bearer ${secret}`) return true;
  return false;
}

async function isSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("factory_session")?.value;
  return token === process.env.DASHBOARD_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req) && !(await isSessionValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clients = await db.getAll();
    const [total, nuevo, en_proceso, completado] = await Promise.all([
      db.count(),
      db.countByStatus("nuevo"),
      db.countByStatus("en_proceso"),
      db.countByStatus("completado"),
    ]);
    return NextResponse.json({ clients, stats: { total, nuevo, en_proceso, completado } });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Error obteniendo clientes" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req) && !(await isSessionValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const updated = await db.update(id, data);
    if (!updated) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Error actualizando cliente" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req) && !(await isSessionValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const deleted = await db.delete(id);
    if (!deleted) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Error eliminando cliente" }, { status: 500 });
  }
}
