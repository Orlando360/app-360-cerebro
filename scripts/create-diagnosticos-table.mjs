// Run this once to create the diagnosticos table
// Usage: node scripts/create-diagnosticos-table.mjs

// Since we can't execute DDL via PostgREST, this script provides
// the SQL to run in Supabase Dashboard → SQL Editor

const SQL = `
-- Run this in Supabase Dashboard → SQL Editor
CREATE TABLE IF NOT EXISTS diagnosticos (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  empresa TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  respuestas JSONB NOT NULL DEFAULT '{}',
  estrategia_generada TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente'
);

ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON diagnosticos
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_diagnosticos_estado ON diagnosticos(estado);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_created ON diagnosticos(created_at DESC);
`;

console.log("=".repeat(60));
console.log("EJECUTA ESTE SQL EN SUPABASE DASHBOARD → SQL EDITOR:");
console.log("URL: https://supabase.com/dashboard/project/loiuvsfmrejxfaotlxvn/sql");
console.log("=".repeat(60));
console.log(SQL);
`;
