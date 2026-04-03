-- Tabla: diagnosticos
-- Almacena respuestas del cuestionario + estrategia generada por Claude
CREATE TABLE IF NOT EXISTS diagnosticos (
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

-- Enable RLS
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;

-- Policy: service role can do everything
CREATE POLICY "Service role full access" ON diagnosticos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_diagnosticos_estado ON diagnosticos(estado);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_created ON diagnosticos(created_at DESC);
