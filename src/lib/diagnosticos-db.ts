import { createClient } from "@supabase/supabase-js";

export interface Diagnostico {
  id: string;
  created_at: string;
  nombre: string;
  empresa: string;
  email: string;
  whatsapp: string;
  respuestas: Record<string, string>;
  estrategia_generada: string | null;
  estado: "pendiente" | "procesando" | "procesado" | "error";
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
  return createClient(url, key);
}

export const diagnosticosDb = {
  async getAll(): Promise<Diagnostico[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("diagnosticos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Diagnostico[];
  },

  async getById(id: string): Promise<Diagnostico | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("diagnosticos")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return data as Diagnostico;
  },

  async create(diagnostico: Omit<Diagnostico, "created_at" | "estrategia_generada">): Promise<Diagnostico> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("diagnosticos")
      .insert({
        ...diagnostico,
        estrategia_generada: null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Diagnostico;
  },

  async updateEstrategia(id: string, estrategia: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("diagnosticos")
      .update({ estrategia_generada: estrategia, estado: "procesado" })
      .eq("id", id);
    if (error) throw error;
  },

  async updateEstado(id: string, estado: Diagnostico["estado"]): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("diagnosticos")
      .update({ estado })
      .eq("id", id);
    if (error) throw error;
  },

  async count(): Promise<{ total: number; pendiente: number; procesado: number }> {
    const supabase = getSupabase();
    const { count: total } = await supabase.from("diagnosticos").select("*", { count: "exact", head: true });
    const { count: pendiente } = await supabase.from("diagnosticos").select("*", { count: "exact", head: true }).eq("estado", "pendiente");
    const { count: procesado } = await supabase.from("diagnosticos").select("*", { count: "exact", head: true }).eq("estado", "procesado");
    return { total: total || 0, pendiente: pendiente || 0, procesado: procesado || 0 };
  },
};
