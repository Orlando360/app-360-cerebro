-- Pipeline multi-agente: agrega columna agent_outputs para guardar outputs de cada agente
ALTER TABLE public.diagnosticos
  ADD COLUMN IF NOT EXISTS agent_outputs JSONB DEFAULT '{}';

-- También ampliar el CHECK de estado para soportar estados del pipeline
ALTER TABLE public.diagnosticos
  DROP CONSTRAINT IF EXISTS diagnosticos_estado_check;

ALTER TABLE public.diagnosticos
  ADD CONSTRAINT diagnosticos_estado_check
  CHECK (estado IN ('pendiente', 'procesando', 'procesado', 'error'));
