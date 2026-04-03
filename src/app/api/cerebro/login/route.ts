import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const secret = process.env.CEREBRO_PASSWORD;

    if (!secret) {
      return NextResponse.json({ error: "CEREBRO_PASSWORD no configurada" }, { status: 500 });
    }

    if (password !== secret) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("cerebro_session", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error en login" }, { status: 500 });
  }
}
