import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateApp } from "@/lib/generator";
import { cookies } from "next/headers";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.DASHBOARD_SECRET;
  if (secret && authHeader === `Bearer ${secret}`) return true;
  const cookieStore = await cookies();
  const token = cookieStore.get("factory_session")?.value;
  return token === secret;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientId } = await request.json();
    if (!clientId) {
      return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
    }

    const client = await db.getById(clientId);
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const appHtml = generateApp(client);
    await db.update(clientId, { generatedApp: appHtml, status: "completado" });

    return NextResponse.json({ success: true, html: appHtml });
  } catch (error) {
    console.error("Error generating app:", error);
    return NextResponse.json({ error: "Error generando la app" }, { status: 500 });
  }
}
