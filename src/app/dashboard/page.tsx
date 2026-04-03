"use client";

import { useState, useEffect, useCallback } from "react";

interface ClientSubmission {
  id: string;
  createdAt: string;
  status: "nuevo" | "en_proceso" | "completado";
  businessName: string;
  industry: string;
  businessDescription: string;
  yearsInBusiness: string;
  employeeCount: string;
  mainPain: string;
  specificProblems: string;
  whatTheyTried: string;
  urgencyLevel: number;
  monthlyLoss: string;
  idealClient: string;
  currentClients: string;
  mainServices: string;
  differentiator: string;
  competitors: string;
  appType: string;
  mustHaveFeatures: string;
  budget: string;
  timeline: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  preferredContact: string;
  generatedApp?: string;
}

interface Stats {
  total: number;
  nuevo: number;
  en_proceso: number;
  completado: number;
}

// ─── Login Screen ──────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError("Contraseña incorrecta");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, color: "#F5C518", fontWeight: 700, letterSpacing: 3, marginBottom: 10, textTransform: "uppercase" }}>App Factory 360</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff" }}>Panel de Orlando</h1>
        </div>
        <form onSubmit={handleSubmit} style={{ background: "#1A1A1A", border: "1px solid rgba(245,197,24,0.15)", borderRadius: 16, padding: 30 }}>
          <label style={{ display: "block", fontSize: 13, color: "#A0A0A0", marginBottom: 8 }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            required
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#0A0A0A", border: "1px solid #333",
              color: "#fff", padding: "12px 14px", borderRadius: 8,
              fontSize: 15, fontFamily: "inherit", marginBottom: 6, outline: "none",
            }}
          />
          {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%", marginTop: 16,
              background: loading || !password ? "#333" : "#F5C518",
              color: loading || !password ? "#666" : "#0A0A0A",
              border: "none", padding: "13px", borderRadius: 8,
              fontWeight: 800, fontSize: 15, cursor: loading || !password ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────
export default function DashboardPage() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = loading
  const [clients, setClients] = useState<ClientSubmission[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, nuevo: 0, en_proceso: 0, completado: 0 });
  const [selected, setSelected] = useState<ClientSubmission | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [view, setView] = useState<"list" | "detail" | "preview">("list");
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.status === 401) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAuthed(true);
      setClients(data.clients || []);
      setStats(data.stats || { total: 0, nuevo: 0, en_proceso: 0, completado: 0 });
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    const interval = setInterval(fetchClients, 30000);
    return () => clearInterval(interval);
  }, [fetchClients]);

  const generateApp = async (clientId: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedHtml(data.html);
        setView("preview");
        fetchClients();
      }
    } catch (err) {
      console.error("Error generating:", err);
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchClients();
    } catch (err) {
      console.error("Error updating:", err);
    }
  };

  const downloadHtml = (html: string, name: string) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-360.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    nuevo: { bg: "rgba(245,197,24,0.15)", text: "#F5C518", label: "Nuevo" },
    en_proceso: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6", label: "En proceso" },
    completado: { bg: "rgba(34,197,94,0.15)", text: "#22C55E", label: "Completado" },
  };

  // Loading initial check
  if (authed === null || (loading && authed === null)) {
    return (
      <main style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#666", fontSize: 15 }}>Cargando...</div>
      </main>
    );
  }

  // Not authenticated
  if (authed === false) {
    return <LoginScreen onLogin={() => { setAuthed(true); setLoading(true); fetchClients(); }} />;
  }

  // Preview view
  if (view === "preview" && generatedHtml) {
    return (
      <main style={{ minHeight: "100vh", background: "#0A0A0A" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 25px", background: "#111", borderBottom: "1px solid rgba(245,197,24,0.2)" }}>
          <button onClick={() => setView("detail")} style={{ background: "transparent", border: "1px solid #333", color: "#A0A0A0", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
            ← Volver al detalle
          </button>
          <span style={{ color: "#F5C518", fontWeight: 700, fontSize: 14 }}>Preview: {selected?.businessName}</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => downloadHtml(generatedHtml, selected?.businessName || "app")} className="btn-gold" style={{ padding: "8px 20px", fontSize: 14 }}>
              ⬇ Descargar HTML
            </button>
            <button onClick={() => { const w = window.open(); if (w) { w.document.write(generatedHtml); w.document.close(); } }} style={{ background: "transparent", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
              ↗ Pantalla completa
            </button>
          </div>
        </div>
        <iframe srcDoc={generatedHtml} style={{ width: "100%", height: "calc(100vh - 60px)", border: "none" }} />
      </main>
    );
  }

  // Detail view
  if (view === "detail" && selected) {
    const s = selected;
    const sc = statusColors[s.status] || statusColors.nuevo;

    return (
      <main style={{ minHeight: "100vh", background: "#0A0A0A", padding: "30px 25px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <button onClick={() => { setView("list"); setSelected(null); }} style={{ background: "transparent", border: "none", color: "#A0A0A0", cursor: "pointer", fontSize: 14, marginBottom: 25, fontFamily: "inherit" }}>
            ← Volver al listado
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 35, flexWrap: "wrap", gap: 15 }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>{s.businessName}</h1>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ background: sc.bg, color: sc.text, padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{sc.label}</span>
                <span style={{ color: "#666", fontSize: 13 }}>{s.industry} · {formatDate(s.createdAt)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <select
                value={s.status}
                onChange={(e) => { updateStatus(s.id, e.target.value); setSelected({ ...s, status: e.target.value as ClientSubmission["status"] }); }}
                style={{ background: "#1A1A1A", color: "#fff", border: "1px solid #333", padding: "8px 15px", borderRadius: 8, fontFamily: "inherit", fontSize: 13 }}
              >
                <option value="nuevo">Nuevo</option>
                <option value="en_proceso">En proceso</option>
                <option value="completado">Completado</option>
              </select>
              <button onClick={() => generateApp(s.id)} disabled={generating} className="btn-gold" style={{ padding: "8px 24px", fontSize: 14 }}>
                {generating ? "Generando..." : "⚡ Generar App"}
              </button>
            </div>
          </div>

          {[
            { title: "Datos del Negocio", items: [
              ["Descripción", s.businessDescription],
              ["Años en el mercado", s.yearsInBusiness],
              ["Empleados", s.employeeCount],
            ]},
            { title: "Dolor y Problemas", items: [
              ["Problema principal", s.mainPain],
              ["Problemas específicos", s.specificProblems],
              ["Lo que han intentado", s.whatTheyTried],
              ["Nivel de urgencia", `${s.urgencyLevel}/10`],
              ["Pérdida mensual estimada", s.monthlyLoss],
            ]},
            { title: "Mercado y Competencia", items: [
              ["Cliente ideal", s.idealClient],
              ["Cómo consigue clientes", s.currentClients],
              ["Servicios principales", s.mainServices],
              ["Diferenciador", s.differentiator],
              ["Competidores", s.competitors],
            ]},
            { title: "Solución Digital", items: [
              ["Tipo de app", s.appType],
              ["Features imprescindibles", s.mustHaveFeatures],
              ["Presupuesto", s.budget],
              ["Timeline", s.timeline],
            ]},
            { title: "Contacto", items: [
              ["Nombre", s.contactName],
              ["Email", s.contactEmail],
              ["Teléfono", s.contactPhone],
              ["Contacto preferido", s.preferredContact],
            ]},
          ].map((section) => (
            <div key={section.title} style={{ background: "#1A1A1A", border: "1px solid rgba(245,197,24,0.15)", borderRadius: 12, padding: 25, marginBottom: 20 }}>
              <h3 style={{ color: "#F5C518", fontSize: 14, fontWeight: 700, marginBottom: 18, textTransform: "uppercase", letterSpacing: 1 }}>{section.title}</h3>
              {section.items.map(([label, value]) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 15, color: "#fff", lineHeight: 1.6 }}>{value || "—"}</div>
                </div>
              ))}
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <a href={`https://wa.me/${s.contactPhone?.replace(/[^0-9+]/g, "")}`} target="_blank" style={{ background: "#25D366", color: "#fff", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              💬 WhatsApp
            </a>
            <a href={`mailto:${s.contactEmail}`} style={{ background: "#1A1A1A", color: "#fff", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14, border: "1px solid #333" }}>
              ✉️ Email
            </a>
          </div>
        </div>
      </main>
    );
  }

  // List view
  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", padding: "30px 25px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 35 }}>
          <div>
            <div style={{ fontSize: 13, color: "#F5C518", fontWeight: 600, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>App Factory 360</div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff" }}>Panel de Orlando</h1>
          </div>
          <button onClick={fetchClients} style={{ background: "#1A1A1A", border: "1px solid #333", color: "#A0A0A0", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
            🔄 Actualizar
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15, marginBottom: 35 }}>
          {[
            { label: "Total clientes", value: stats.total, color: "#F5C518" },
            { label: "Nuevos", value: stats.nuevo, color: "#F5C518" },
            { label: "En proceso", value: stats.en_proceso, color: "#3B82F6" },
            { label: "Completados", value: stats.completado, color: "#22C55E" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#1A1A1A", border: "1px solid rgba(245,197,24,0.1)", borderRadius: 12, padding: "22px 20px" }}>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>Cargando clientes...</div>
        ) : clients.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 15 }}>📋</div>
            <h3 style={{ color: "#fff", marginBottom: 8 }}>No hay clientes todavía</h3>
            <p style={{ color: "#666", fontSize: 15 }}>Cuando un cliente llene el cuestionario, aparecerá aquí automáticamente.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {clients.map((client) => {
              const sc = statusColors[client.status] || statusColors.nuevo;
              return (
                <div
                  key={client.id}
                  onClick={() => { setSelected(client); setView("detail"); }}
                  className="card-hover"
                  style={{
                    background: "#1A1A1A",
                    border: "1px solid rgba(245,197,24,0.1)",
                    borderRadius: 12,
                    padding: "20px 25px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{client.businessName}</h3>
                      <span style={{ background: sc.bg, color: sc.text, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>
                      {client.contactName} · {client.industry} · {formatDate(client.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "#F5C518", fontWeight: 600 }}>Urgencia: {client.urgencyLevel}/10</span>
                    <span style={{ color: "#333", fontSize: 18 }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
