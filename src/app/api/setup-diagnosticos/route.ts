import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  const supabase = createClient(url, key);

  // Check if table exists by trying to query it
  const { error: checkError } = await supabase.from("diagnosticos").select("id").limit(1);

  if (checkError?.message?.includes("schema cache") || checkError?.message?.includes("does not exist")) {
    // Table doesn't exist — need to create it via Supabase Dashboard SQL Editor
    // Return the SQL to execute
    return NextResponse.json({
      exists: false,
      message: "La tabla 'diagnosticos' no existe. Ejecuta este SQL en el Supabase Dashboard → SQL Editor:",
      sql: `CREATE TABLE diagnosticos (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  empresa TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  respuestas JSONB NOT NULL DEFAULT '{}',
  estrategia_generada TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'procesado', 'error'))
);

ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON diagnosticos FOR ALL USING (true) WITH CHECK (true);`,
    });
  }

  return NextResponse.json({ exists: true, message: "Tabla diagnosticos OK" });
}
