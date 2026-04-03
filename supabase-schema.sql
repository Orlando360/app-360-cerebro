-- App Factory 360 — Schema para Supabase
-- Ejecuta este SQL en: supabase.com → SQL Editor

CREATE TABLE IF NOT EXISTS public.factory_clients (
  id                  TEXT PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status              TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'en_proceso', 'completado')),
  notified            BOOLEAN DEFAULT FALSE,

  -- Negocio
  business_name       TEXT NOT NULL,
  industry            TEXT NOT NULL,
  business_description TEXT,
  years_in_business   TEXT,
  employee_count      TEXT,

  -- Dolor
  main_pain           TEXT,
  specific_problems   TEXT,
  what_they_tried     TEXT,
  urgency_level       INTEGER,
  monthly_loss        TEXT,

  -- Mercado
  ideal_client        TEXT,
  current_clients     TEXT,
  main_services       TEXT,
  differentiator      TEXT,
  competitors         TEXT,

  -- Solución
  app_type            TEXT,
  must_have_features  TEXT,
  budget              TEXT,
  timeline            TEXT,

  -- Contacto
  contact_name        TEXT NOT NULL,
  contact_email       TEXT NOT NULL,
  contact_phone       TEXT NOT NULL,
  preferred_contact   TEXT,

  -- App generada
  generated_app       TEXT
);

-- Solo el service role puede leer/escribir (no acceso anónimo)
ALTER TABLE public.factory_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.factory_clients
  USING (false);
