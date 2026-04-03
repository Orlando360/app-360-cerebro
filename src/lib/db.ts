import { createClient } from "@supabase/supabase-js";

export interface ClientSubmission {
  id: string;
  createdAt: string;
  status: "nuevo" | "en_proceso" | "completado";
  notified: boolean;

  // Datos del negocio
  businessName: string;
  industry: string;
  businessDescription: string;
  yearsInBusiness: string;
  employeeCount: string;

  // Dolor y problemas
  mainPain: string;
  specificProblems: string;
  whatTheyTried: string;
  urgencyLevel: number;
  monthlyLoss: string;

  // Cliente ideal y mercado
  idealClient: string;
  currentClients: string;
  mainServices: string;
  differentiator: string;
  competitors: string;

  // Solución digital deseada
  appType: string;
  mustHaveFeatures: string;
  budget: string;
  timeline: string;

  // Contacto
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  preferredContact: string;

  // App generada
  generatedApp?: string;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
  return createClient(url, key);
}

// Maps DB snake_case rows to camelCase ClientSubmission
function rowToClient(row: Record<string, unknown>): ClientSubmission {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    status: row.status as ClientSubmission["status"],
    notified: row.notified as boolean,
    businessName: row.business_name as string,
    industry: row.industry as string,
    businessDescription: row.business_description as string,
    yearsInBusiness: row.years_in_business as string,
    employeeCount: row.employee_count as string,
    mainPain: row.main_pain as string,
    specificProblems: row.specific_problems as string,
    whatTheyTried: row.what_they_tried as string,
    urgencyLevel: row.urgency_level as number,
    monthlyLoss: row.monthly_loss as string,
    idealClient: row.ideal_client as string,
    currentClients: row.current_clients as string,
    mainServices: row.main_services as string,
    differentiator: row.differentiator as string,
    competitors: row.competitors as string,
    appType: row.app_type as string,
    mustHaveFeatures: row.must_have_features as string,
    budget: row.budget as string,
    timeline: row.timeline as string,
    contactName: row.contact_name as string,
    contactEmail: row.contact_email as string,
    contactPhone: row.contact_phone as string,
    preferredContact: row.preferred_contact as string,
    generatedApp: row.generated_app as string | undefined,
  };
}

function clientToRow(client: ClientSubmission) {
  return {
    id: client.id,
    created_at: client.createdAt,
    status: client.status,
    notified: client.notified,
    business_name: client.businessName,
    industry: client.industry,
    business_description: client.businessDescription,
    years_in_business: client.yearsInBusiness,
    employee_count: client.employeeCount,
    main_pain: client.mainPain,
    specific_problems: client.specificProblems,
    what_they_tried: client.whatTheyTried,
    urgency_level: client.urgencyLevel,
    monthly_loss: client.monthlyLoss,
    ideal_client: client.idealClient,
    current_clients: client.currentClients,
    main_services: client.mainServices,
    differentiator: client.differentiator,
    competitors: client.competitors,
    app_type: client.appType,
    must_have_features: client.mustHaveFeatures,
    budget: client.budget,
    timeline: client.timeline,
    contact_name: client.contactName,
    contact_email: client.contactEmail,
    contact_phone: client.contactPhone,
    preferred_contact: client.preferredContact,
    generated_app: client.generatedApp,
  };
}

export const db = {
  async getAll(): Promise<ClientSubmission[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("factory_clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToClient);
  },

  async getById(id: string): Promise<ClientSubmission | undefined> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("factory_clients")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return rowToClient(data);
  },

  async add(client: ClientSubmission): Promise<ClientSubmission> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("factory_clients")
      .insert(clientToRow(client))
      .select()
      .single();
    if (error) throw error;
    return rowToClient(data);
  },

  async update(id: string, data: Partial<ClientSubmission>): Promise<ClientSubmission | undefined> {
    const supabase = getSupabase();
    const partial = clientToRow({ ...data, id } as ClientSubmission);
    delete (partial as Record<string, unknown>).id;
    const { data: updated, error } = await supabase
      .from("factory_clients")
      .update(partial)
      .eq("id", id)
      .select()
      .single();
    if (error || !updated) return undefined;
    return rowToClient(updated);
  },

  async delete(id: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from("factory_clients").delete().eq("id", id);
    return !error;
  },

  async count(): Promise<number> {
    const supabase = getSupabase();
    const { count } = await supabase
      .from("factory_clients")
      .select("*", { count: "exact", head: true });
    return count || 0;
  },

  async countByStatus(status: ClientSubmission["status"]): Promise<number> {
    const supabase = getSupabase();
    const { count } = await supabase
      .from("factory_clients")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    return count || 0;
  },
};
