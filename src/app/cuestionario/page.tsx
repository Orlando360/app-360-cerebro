"use client";

import { useState, useEffect, useRef } from "react";

interface Question {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "range" | "email" | "tel" | "multiselect";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  section: string;
}

const QUESTIONS: Question[] = [
  // Sección 1: Tus Datos
  { id: "contactName", label: "Nombre completo", type: "text", placeholder: "Nombre y apellido", required: true, section: "Tus Datos" },
  { id: "contactPhone", label: "WhatsApp con código de país", type: "tel", placeholder: "+57 300 123 4567", required: true, section: "Tus Datos" },
  { id: "contactEmail", label: "Email de trabajo", type: "email", placeholder: "email@tunegocio.com", required: true, section: "Tus Datos" },

  // Sección 2: Tu Negocio
  { id: "businessName", label: "Nombre del negocio", type: "text", placeholder: "Ej: Clínica Dental Premium", required: true, section: "Tu Negocio" },
  { id: "industry", label: "Industria", type: "select", options: ["Salud", "Tecnología", "Gastronomía", "Belleza", "Educación", "Legal", "Inmobiliaria", "Fitness", "Retail", "Consultoría", "Marketing", "Construcción", "Transporte", "Otro"], required: true, section: "Tu Negocio" },
  { id: "businessDescription", label: "¿Qué hace tu negocio exactamente y a quién le sirve?", type: "textarea", placeholder: "Describe qué vendes o qué servicio ofreces, y quién es tu cliente típico", required: true, section: "Tu Negocio" },
  { id: "monthlyRevenue", label: "Facturación mensual aproximada", type: "select", options: ["Menos de $5M COP", "$5M–$15M COP", "$15M–$50M COP", "$50M–$150M COP", "Más de $150M COP", "Prefiero no decirlo"], required: true, section: "Tu Negocio" },
  { id: "averageTicket", label: "Ticket promedio por cliente o venta", type: "select", options: ["Menos de $100K COP", "$100K–$500K COP", "$500K–$2M COP", "$2M–$10M COP", "Más de $10M COP"], required: true, section: "Tu Negocio" },
  { id: "yearsInBusiness", label: "Años en el mercado", type: "select", options: ["Menos de 1", "1–3", "3–5", "5–10", "Más de 10"], required: true, section: "Tu Negocio" },
  { id: "employeeCount", label: "Personas en el equipo", type: "select", options: ["Solo yo", "2–5", "6–15", "16–50", "Más de 50"], section: "Tu Negocio" },

  // Sección 3: Tu Dolor
  { id: "mainPain", label: "¿Cuál es el problema número 1 que frena tu negocio ahora mismo?", type: "textarea", placeholder: "Sé específico. No me digas 'quiero más clientes'. Dime exactamente qué está fallando.", required: true, section: "Tu Dolor" },
  { id: "dailyImpact", label: "¿Cómo te afecta ese problema en el día a día?", type: "textarea", placeholder: "¿Pierdes tiempo? ¿Pierdes plata? ¿Te frustra? ¿Afecta a tu equipo? Cuéntame todo.", required: true, section: "Tu Dolor" },
  { id: "whatTheyTried", label: "¿Qué has intentado para resolverlo y por qué no funcionó?", type: "textarea", placeholder: "¿Contrataste agencia? ¿Hiciste ads? ¿Cambiaste de estrategia? Cuéntame qué no funcionó.", section: "Tu Dolor" },
  { id: "urgencyLevel", label: "Urgencia del 1 al 10", type: "range", required: true, section: "Tu Dolor" },
  { id: "monthlyLoss", label: "Pérdida mensual estimada", type: "select", options: ["Menos de $500 USD", "$500–$2K USD", "$2K–$5K USD", "$5K–$10K USD", "Más de $10K USD", "No estoy seguro"], section: "Tu Dolor" },

  // Sección 4: Tu Mercado
  { id: "idealClient", label: "Describe tu cliente ideal — quién es, qué le duele, qué quiere lograr", type: "textarea", placeholder: "Edad, ubicación, nivel económico, qué problema tiene, cómo te encuentra...", required: true, section: "Tu Mercado" },
  { id: "acquisitionChannels", label: "¿Cómo consigues clientes actualmente?", type: "multiselect", options: ["Referidos", "Instagram o TikTok orgánico", "Pauta digital", "Google", "Ventas directas", "WhatsApp", "Otro"], required: true, section: "Tu Mercado" },
  { id: "newClientsPerMonth", label: "Clientes nuevos por mes", type: "select", options: ["0–2", "3–10", "11–30", "31–100", "Más de 100"], required: true, section: "Tu Mercado" },
  { id: "mainServices", label: "¿Cuáles son tus servicios o productos principales?", type: "textarea", placeholder: "Lista tus 3–5 servicios o productos más importantes", required: true, section: "Tu Mercado" },
  { id: "differentiator", label: "¿Qué te diferencia de tu competencia — por qué te compran a ti?", type: "textarea", placeholder: "¿Por qué un cliente debería elegirte a ti y no al de al lado?", required: true, section: "Tu Mercado" },
  { id: "competitors", label: "Competidores directos", type: "textarea", placeholder: "Nombres, URLs o perfiles de redes de tu competencia directa", section: "Tu Mercado" },

  // Sección 5: Tu Objetivo
  { id: "goal90Days", label: "¿Qué quieres lograr en los próximos 90 días? Descríbelo con el mayor detalle posible", type: "textarea", placeholder: "Duplicar ventas, lanzar producto nuevo, conseguir 50 clientes nuevos, sistematizar operaciones...", required: true, section: "Tu Objetivo" },
  { id: "numericGoal", label: "¿Tienes una meta numérica concreta — facturación, clientes, conversión?", type: "textarea", placeholder: "Ej: Llegar a $50M/mes, conseguir 30 clientes nuevos, pasar de 2% a 5% conversión...", required: true, section: "Tu Objetivo" },
  { id: "investmentBudget", label: "Disposición de inversión", type: "select", options: ["$500–$1.5K USD", "$1.5K–$3K USD", "$3K–$5K USD", "Más de $5K USD", "Lo que sea necesario"], section: "Tu Objetivo" },
];

const SECTIONS = [...new Set(QUESTIONS.map(q => q.section))];

const PIPELINE_STEPS = [
  { key: "procesando_diagnostico", label: "Diagnóstico Ejecutivo", desc: "Analizando 9 pilares del negocio..." },
  { key: "procesando_brechas", label: "Brechas Críticas", desc: "Identificando las 3 brechas de mayor impacto..." },
  { key: "procesando_plan", label: "Plan 90 Días", desc: "Diseñando el plan de acción en 3 fases..." },
  { key: "procesando_propuesta", label: "Propuesta Comercial", desc: "Calculando ROI y estructurando propuesta..." },
  { key: "procesando_reporte", label: "Reporte Final", desc: "Consolidando el reporte ejecutivo completo..." },
];

function getStepIndex(pipelineStatus: string): number {
  const map: Record<string, number> = {
    procesando_diagnostico: 0,
    procesando_brechas: 1,
    procesando_plan: 2,
    procesando_propuesta: 3,
    procesando_reporte: 4,
    completado: 5,
  };
  return map[pipelineStatus] ?? 0;
}

export default function CuestionarioPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pipeline progress
  const [diagnosticoId, setDiagnosticoId] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState("procesando_diagnostico");
  const [reporteFinal, setReporteFinal] = useState<string | null>(null);

  const sectionQuestions = QUESTIONS.filter(q => q.section === SECTIONS[currentSection]);
  const progress = ((currentSection + 1) / SECTIONS.length) * 100;

  const updateAnswer = (id: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setError("");
  };

  const toggleMultiselect = (id: string, option: string) => {
    const current = (answers[id] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    updateAnswer(id, updated);
  };

  const validateSection = (): boolean => {
    const required = sectionQuestions.filter(q => q.required);
    for (const q of required) {
      const val = answers[q.id];
      if (q.type === "multiselect") {
        if (!val || (val as string[]).length === 0) {
          setError(`Por favor completa: "${q.label}"`);
          return false;
        }
      } else {
        if (!val || (val as string).trim() === "") {
          setError(`Por favor completa: "${q.label}"`);
          return false;
        }
      }
    }
    return true;
  };

  const nextSection = () => {
    if (!validateSection()) return;
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!diagnosticoId || !procesando) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${diagnosticoId}`);
        const data = await res.json();
        if (data.pipeline_status) setPipelineStatus(data.pipeline_status);
        if (data.pipeline_status === "completado") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setProcesando(false);
          setReporteFinal(data.agent_outputs?.reporte_final || "");
        }
        if (data.estado === "error") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setProcesando(false);
          setError("Error generando el diagnóstico. Por favor intenta de nuevo.");
        }
      } catch {
        // silent — keep polling
      }
    }, 3000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [diagnosticoId, procesando]);

  const handleSubmit = async () => {
    if (!validateSection()) return;
    setLoading(true);
    setError("");

    try {
      const payload: Record<string, string> = {};
      for (const [key, val] of Object.entries(answers)) {
        payload[key] = Array.isArray(val) ? val.join(", ") : val;
      }

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Error al enviar. Intenta de nuevo.");
        return;
      }

      setSubmitted(true);
      const diagId = data.diagnosticoId;
      if (diagId) {
        setDiagnosticoId(diagId);
        setProcesando(true);
        setPipelineStatus("procesando_diagnostico");
        // Fire pipeline
        fetch("/api/procesar-diagnostico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ diagnosticoId: diagId }),
        }).catch(console.error);
      }
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ── Reporte listo ──────────────────────────────────────────────────────────
  if (reporteFinal !== null) {
    return (
      <main style={{ minHeight: "100vh", background: "#0A0A0A", padding: "40px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F5C518", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Método 360 — Orlando Iguarán</div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>Tu Reporte Ejecutivo está listo</h1>
            <p style={{ color: "#666", fontSize: 14 }}>5 agentes de IA analizaron tu negocio en profundidad</p>
          </div>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: "36px 40px", color: "#E0E0E0", fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'DM Mono', monospace" }}>
            {reporteFinal}
          </div>
          <div style={{ textAlign: "center", marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.link/33ogyz" target="_blank" style={{ display: "inline-block", background: "#25D366", color: "#fff", padding: "14px 30px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
              Hablar con Orlando por WhatsApp →
            </a>
            <button onClick={() => window.print()} style={{ background: "transparent", border: "1px solid #333", color: "#999", padding: "14px 24px", borderRadius: 8, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              Imprimir / Guardar PDF
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Procesando pipeline ────────────────────────────────────────────────────
  if (submitted && procesando) {
    const stepIdx = getStepIndex(pipelineStatus);
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", padding: "40px 20px" }}>
        <div style={{ maxWidth: 560, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F5C518", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Cerebro 360 procesando</div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>Analizando tu negocio</h1>
            <p style={{ color: "#666", fontSize: 14 }}>5 agentes de IA trabajan en paralelo — tarda ~2 minutos</p>
          </div>

          {/* Progress bar */}
          <div style={{ background: "#1A1A1A", borderRadius: 4, height: 4, marginBottom: 32, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg, #C9A015, #F5C518)", borderRadius: 4, width: `${Math.min((stepIdx / 5) * 100, 95)}%`, transition: "width 0.8s ease" }} />
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PIPELINE_STEPS.map((s, i) => {
              const done = i < stepIdx;
              const active = i === stepIdx;
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: active ? "rgba(245,197,24,0.06)" : "#111", border: `1px solid ${active ? "#F5C518" : done ? "#2A2A2A" : "#1A1A1A"}`, borderRadius: 10, transition: "all 0.4s" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? "#2A2A1A" : active ? "rgba(245,197,24,0.15)" : "#1A1A1A", border: `2px solid ${done ? "#F5C518" : active ? "#F5C518" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                    {done ? "✓" : active ? <span style={{ width: 8, height: 8, background: "#F5C518", borderRadius: "50%", display: "block", animation: "pulse 1.5s ease infinite" }} /> : <span style={{ color: "#444", fontSize: 12 }}>{i + 1}</span>}
                  </div>
                  <div>
                    <div style={{ color: done || active ? "#fff" : "#444", fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                    {active && <div style={{ color: "#F5C518", fontSize: 12, marginTop: 2 }}>{s.desc}</div>}
                    {done && <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>Completado</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ textAlign: "center", color: "#333", fontSize: 12, marginTop: 28 }}>
            No cierres esta ventana — el análisis se completará en breve
          </p>
        </div>
      </main>
    );
  }

  // ── Enviado sin pipeline (fallback) ───────────────────────────────────────
  if (submitted && !procesando) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", padding: "40px 20px" }}>
        <div style={{ maxWidth: 500, textAlign: "center" }} className="animate-fade-in">
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 15, color: "#fff" }}>¡Diagnóstico Recibido!</h1>
          <p style={{ color: "#A0A0A0", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: 30 }}>
            Tu diagnóstico empresarial ha sido enviado exitosamente. Orlando revisará tu caso personalmente y se pondrá en contacto contigo por WhatsApp en las próximas 24 horas.
          </p>
          <a href="https://wa.link/33ogyz" target="_blank" style={{ display: "inline-block", background: "#25D366", color: "#fff", padding: "14px 30px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
            Escribir a Orlando por WhatsApp →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", padding: "30px 20px" }}>
      <div style={{ maxWidth: 650, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F5C518", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>
            Diagnóstico Empresarial 360
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
            Cuéntame sobre tu negocio
          </h1>
          <p style={{ color: "#666", fontSize: 14 }}>
            Este diagnóstico me permite entender tu situación real y diseñar la solución perfecta para ti.
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#F5C518", fontWeight: 600 }}>{SECTIONS[currentSection]}</span>
            <span style={{ fontSize: 13, color: "#666" }}>{currentSection + 1} de {SECTIONS.length}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          {/* Section steps */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 4 }}>
            {SECTIONS.map((section, i) => (
              <div
                key={section}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 11,
                  color: i === currentSection ? "#F5C518" : i < currentSection ? "#555" : "#333",
                  fontWeight: i === currentSection ? 700 : 400,
                  transition: "all 0.2s",
                }}
              >
                {section}
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="animate-fade-in" key={currentSection}>
          {sectionQuestions.map((q) => (
            <div key={q.id} style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 10 }}>
                {q.label}
                {q.required && <span style={{ color: "#F5C518", marginLeft: 4 }}>*</span>}
              </label>

              {q.type === "text" || q.type === "email" || q.type === "tel" ? (
                <input
                  type={q.type}
                  className="input-360"
                  placeholder={q.placeholder}
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                />
              ) : q.type === "textarea" ? (
                <textarea
                  className="input-360"
                  placeholder={q.placeholder}
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  rows={4}
                />
              ) : q.type === "select" ? (
                <select
                  className="input-360"
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : q.type === "multiselect" ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {q.options?.map((opt) => {
                    const selected = ((answers[q.id] as string[]) || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleMultiselect(q.id, opt)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 8,
                          border: selected ? "2px solid #F5C518" : "1px solid #333",
                          background: selected ? "rgba(245, 197, 24, 0.1)" : "#111",
                          color: selected ? "#F5C518" : "#999",
                          fontSize: 14,
                          fontWeight: selected ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          fontFamily: "inherit",
                        }}
                      >
                        {selected ? "✓ " : ""}{opt}
                      </button>
                    );
                  })}
                </div>
              ) : q.type === "range" ? (
                <div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={(answers[q.id] as string) || "5"}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    style={{ width: "100%", accentColor: "#F5C518" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#666", fontSize: 13, marginTop: 5 }}>
                    <span>1 — Puede esperar</span>
                    <span style={{ color: "#F5C518", fontWeight: 700, fontSize: 20 }}>{(answers[q.id] as string) || "5"}</span>
                    <span>10 — Urgentísimo</span>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, padding: "12px 18px", marginBottom: 20, color: "#FF4444", fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 15, marginTop: 10 }}>
          <button
            onClick={prevSection}
            disabled={currentSection === 0}
            style={{
              background: "transparent",
              color: currentSection === 0 ? "#333" : "#A0A0A0",
              border: "1px solid",
              borderColor: currentSection === 0 ? "#222" : "#333",
              padding: "14px 28px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: currentSection === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Anterior
          </button>

          {currentSection < SECTIONS.length - 1 ? (
            <button onClick={nextSection} className="btn-gold">
              Siguiente →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-gold" style={{ minWidth: 180 }}>
              {loading ? "Enviando..." : "Enviar diagnóstico →"}
            </button>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#333", fontSize: 12, marginTop: 30 }}>
          🔒 Tu información es 100% confidencial
        </p>
      </div>
    </main>
  );
}
