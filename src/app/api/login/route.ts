import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const secret = process.env.DASHBOARD_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }

    if (password !== secret) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("factory_session", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
