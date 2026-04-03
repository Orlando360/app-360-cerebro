"use client";

import { useState, useEffect, useCallback } from "react";

interface Diagnostico {
  id: string;
  created_at: string;
  nombre: string;
  empresa: string;
  email: string;
  whatsapp: string;
  respuestas: Record<string, string>;
  estrategia_generada: string | null;
  estado: string;
}

interface Stats {
  total: number;
  pendiente: number;
  procesado: number;
}

export default function CerebroPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pendiente: 0, procesado: 0 });
  const [selected, setSelected] = useState<Diagnostico | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDiagnosticos = useCallback(async () => {
    try {
      const res = await fetch("/api/cerebro/diagnosticos");
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setDiagnosticos(data.diagnosticos || []);
      setStats(data.stats || { total: 0, pendiente: 0, procesado: 0 });
    } catch (err) {
      console.error("Error fetching:", err);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchDiagnosticos();
      const interval = setInterval(fetchDiagnosticos, 15000);
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchDiagnosticos]);

  // Check if already authenticated
  useEffect(() => {
    fetch("/api/cerebro/diagnosticos").then((res) => {
      if (res.ok) setAuthenticated(true);
    });
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/cerebro/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setLoginError("Contraseña incorrecta");
      }
    } catch {
      setLoginError("Error de conexión");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleReprocesar = async (id: string) => {
    setLoading(true);
    try {
      await fetch("/api/procesar-diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosticoId: id }),
      });
      await fetchDiagnosticos();
      if (selected?.id === id) {
        const res = await fetch(`/api/cerebro/diagnosticos?id=${id}`);
        if (res.ok) setSelected(await res.json());
      }
    } catch (err) {
      console.error("Error reprocesando:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewDiagnostico = async (id: string) => {
    try {
      const res = await fetch(`/api/cerebro/diagnosticos?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
      }
    } catch (err) {
      console.error("Error loading diagnostico:", err);
    }
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case "procesado": return "#22C55E";
      case "procesando": return "#F5C518";
      case "error": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const estadoLabel = (estado: string) => {
    switch (estado) {
      case "procesado": return "✅ Procesado";
      case "procesando": return "⏳ Procesando";
      case "error": return "❌ Error";
      default: return "🕐 Pendiente";
    }
  };

  // LOGIN SCREEN
  if (!authenticated) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A" }}>
        <div style={{ maxWidth: 400, width: "100%", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>El Cerebro 360</h1>
            <p style={{ color: "#666", fontSize: 14 }}>Panel de inteligencia estratégica</p>
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "14px 18px", background: "#111", border: "1px solid #222",
                borderRadius: 8, color: "#fff", fontSize: 15, outline: "none", marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            {loginError && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{loginError}</p>}
            <button
              onClick={handleLogin}
              disabled={loginLoading}
              style={{
                width: "100%", padding: "14px", background: "#F5C518", color: "#000", border: "none",
                borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}
            >
              {loginLoading ? "Verificando..." : "Entrar al Cerebro →"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // DETAIL VIEW
  if (selected) {
    return (
      <main style={{ minHeight: "100vh", background: "#0A0A0A", padding: "30px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
            <button
              onClick={() => setSelected(null)}
              style={{ background: "transparent", border: "1px solid #333", color: "#999", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
            >
              ← Volver
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href={`https://wa.me/${selected.whatsapp?.replace(/[^0-9]/g, "")}`}
                target="_blank"
                style={{ background: "#25D366", color: "#fff", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}
              >
                WhatsApp
              </a>
              <button
                onClick={() => handleReprocesar(selected.id)}
                disabled={loading}
                style={{ background: "#F5C518", color: "#000", padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700 }}
              >
                {loading ? "Procesando..." : "🔄 Reprocesar"}
              </button>
            </div>
          </div>

          {/* Client info */}
          <div style={{ background: "#111", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid #1a1a1a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: 4 }}>{selected.empresa}</h1>
                <p style={{ color: "#999", fontSize: 14 }}>{selected.nombre} · {selected.email}</p>
              </div>
              <span style={{ color: estadoColor(selected.estado), fontSize: 13, fontWeight: 600 }}>
                {estadoLabel(selected.estado)}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div><span style={{ color: "#666", fontSize: 12 }}>Industria</span><p style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>{selected.respuestas?.industry || "—"}</p></div>
              <div><span style={{ color: "#666", fontSize: 12 }}>Urgencia</span><p style={{ color: "#F5C518", fontSize: 14, fontWeight: 700, marginTop: 4 }}>{selected.respuestas?.urgencyLevel || "—"}/10</p></div>
              <div><span style={{ color: "#666", fontSize: 12 }}>Presupuesto</span><p style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>{selected.respuestas?.budget || "—"}</p></div>
            </div>
          </div>

          {/* Estrategia */}
          <div style={{ background: "#111", borderRadius: 12, padding: 24, border: "1px solid #1a1a1a" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#F5C518", marginBottom: 16 }}>🧠 Estrategia Generada</h2>
            {selected.estrategia_generada ? (
              <div
                style={{ color: "#ccc", fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{
                  __html: selected.estrategia_generada
                    .replace(/## (.*)/g, '<h2 style="color:#F5C518;font-size:1.1rem;font-weight:700;margin:24px 0 12px">$1</h2>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>')
                    .replace(/^- (.*)/gm, '<li style="margin-left:20px;margin-bottom:6px">$1</li>')
                    .replace(/^(\d+)\. (.*)/gm, '<li style="margin-left:20px;margin-bottom:6px"><strong style="color:#F5C518">$1.</strong> $2</li>')
                }}
              />
            ) : selected.estado === "procesando" ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ color: "#999" }}>Claude está procesando la estrategia...</p>
                <p style={{ color: "#666", fontSize: 13, marginTop: 8 }}>Esto puede tomar 30-60 segundos</p>
              </div>
            ) : selected.estado === "error" ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
                <p style={{ color: "#EF4444" }}>Error al procesar. Haz clic en Reprocesar para intentar de nuevo.</p>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🕐</div>
                <p style={{ color: "#999" }}>Pendiente de procesamiento</p>
                <button
                  onClick={() => handleReprocesar(selected.id)}
                  style={{ marginTop: 16, background: "#F5C518", color: "#000", padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700 }}
                >
                  Procesar ahora →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // LIST VIEW
  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>🧠 El Cerebro 360</h1>
            <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>Diagnósticos estratégicos procesados por IA</p>
          </div>
          <a href="/" style={{ color: "#666", fontSize: 13, textDecoration: "none" }}>← Inicio</a>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 30 }}>
          {[
            { label: "Total", value: stats.total, color: "#fff" },
            { label: "Pendientes", value: stats.pendiente, color: "#F5C518" },
            { label: "Procesados", value: stats.procesado, color: "#22C55E" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#111", borderRadius: 12, padding: "20px 24px", border: "1px solid #1a1a1a" }}>
              <p style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: "1.8rem", fontWeight: 800 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {diagnosticos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ color: "#666", fontSize: 16 }}>No hay diagnósticos aún</p>
            <p style={{ color: "#444", fontSize: 13, marginTop: 8 }}>Los diagnósticos aparecerán aquí cuando alguien complete el cuestionario</p>
          </div>
        ) : (
          <div style={{ background: "#111", borderRadius: 12, border: "1px solid #1a1a1a", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: "1px solid #1a1a1a" }}>
              {["Nombre", "Empresa", "Fecha", "Estado", ""].map((h) => (
                <span key={h} style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {diagnosticos.map((d) => (
              <div
                key={d.id}
                onClick={() => viewDiagnostico(d.id)}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", padding: "16px 20px",
                  borderBottom: "1px solid #0d0d0d", cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{d.nombre}</span>
                <span style={{ color: "#999", fontSize: 14 }}>{d.empresa}</span>
                <span style={{ color: "#666", fontSize: 13 }}>
                  {new Date(d.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                </span>
                <span style={{ color: estadoColor(d.estado), fontSize: 13, fontWeight: 600 }}>
                  {estadoLabel(d.estado)}
                </span>
                <span style={{ color: "#F5C518", fontSize: 13, textAlign: "right" }}>Ver →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
