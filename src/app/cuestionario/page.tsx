"use client";

import { useState } from "react";

interface Question {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "range" | "email" | "tel";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  section: string;
}

const QUESTIONS: Question[] = [
  // Sección 1: Tu Negocio
  { id: "businessName", label: "¿Cuál es el nombre de tu negocio?", type: "text", placeholder: "Ej: Clínica Dental Premium", required: true, section: "Tu Negocio" },
  { id: "industry", label: "¿En qué industria o sector estás?", type: "select", options: ["Salud y Bienestar", "Tecnología", "Gastronomía y Restaurantes", "Belleza y Estética", "Educación", "Legal y Jurídico", "Inmobiliaria", "Fitness y Deporte", "Retail / Comercio", "Consultoría", "Marketing y Publicidad", "Construcción", "Transporte y Logística", "Otro"], required: true, section: "Tu Negocio" },
  { id: "businessDescription", label: "Describe tu negocio en 2-3 frases", type: "textarea", placeholder: "¿Qué haces? ¿A quién ayudas? ¿Qué te hace diferente?", required: true, section: "Tu Negocio" },
  { id: "yearsInBusiness", label: "¿Cuántos años llevas en el mercado?", type: "select", options: ["Menos de 1 año", "1-3 años", "3-5 años", "5-10 años", "Más de 10 años"], required: true, section: "Tu Negocio" },
  { id: "employeeCount", label: "¿Cuántas personas trabajan contigo?", type: "select", options: ["Solo yo", "2-5 personas", "6-15 personas", "16-50 personas", "Más de 50"], section: "Tu Negocio" },

  // Sección 2: Tu Dolor
  { id: "mainPain", label: "¿Cuál es el problema #1 que está frenando tu negocio?", type: "textarea", placeholder: "Sé específico. No me digas 'quiero más clientes'. Dime exactamente qué está fallando.", required: true, section: "Tu Dolor" },
  { id: "specificProblems", label: "¿Qué problemas específicos enfrentas día a día?", type: "textarea", placeholder: "Lista todo lo que te frustra: no llegan clientes, los que llegan no pagan, el equipo no rinde, no tienes presencia digital...", required: true, section: "Tu Dolor" },
  { id: "whatTheyTried", label: "¿Qué has intentado para solucionarlo?", type: "textarea", placeholder: "¿Contrataste agencia? ¿Hiciste ads? ¿Cambiaste de estrategia? Cuéntame qué no funcionó.", section: "Tu Dolor" },
  { id: "urgencyLevel", label: "Del 1 al 10, ¿qué tan urgente es resolver esto?", type: "range", section: "Tu Dolor" },
  { id: "monthlyLoss", label: "¿Cuánto estimas que pierdes al mes por no resolver este problema?", type: "select", options: ["Menos de $500 USD", "$500 - $2,000 USD", "$2,000 - $5,000 USD", "$5,000 - $10,000 USD", "Más de $10,000 USD", "No estoy seguro"], section: "Tu Dolor" },

  // Sección 3: Tu Mercado
  { id: "idealClient", label: "Describe a tu cliente ideal con detalle", type: "textarea", placeholder: "Edad, ubicación, nivel económico, qué problema tiene, cómo te encuentra...", required: true, section: "Tu Mercado" },
  { id: "currentClients", label: "¿Cómo consigues clientes actualmente?", type: "textarea", placeholder: "Referidos, redes sociales, Google, boca a boca...", section: "Tu Mercado" },
  { id: "mainServices", label: "¿Cuáles son tus servicios o productos principales?", type: "textarea", placeholder: "Lista tus 3-5 servicios o productos más importantes", required: true, section: "Tu Mercado" },
  { id: "differentiator", label: "¿Qué te hace diferente de tu competencia?", type: "textarea", placeholder: "¿Por qué un cliente debería elegirte a ti y no al de al lado?", required: true, section: "Tu Mercado" },
  { id: "competitors", label: "¿Quiénes son tus 2-3 competidores principales?", type: "textarea", placeholder: "Nombres o URLs de tu competencia directa", section: "Tu Mercado" },

  // Sección 4: Tu Solución Digital
  { id: "appType", label: "¿Qué tipo de solución digital necesitas?", type: "select", options: ["Landing Page (presencia web profesional)", "Funnel de Ventas (captar y convertir clientes)", "Dashboard (panel de gestión del negocio)", "No estoy seguro — recomiéndame"], required: true, section: "Tu Solución Digital" },
  { id: "mustHaveFeatures", label: "¿Qué funcionalidades son imprescindibles?", type: "textarea", placeholder: "Formulario de contacto, WhatsApp, catálogo de productos, agenda de citas, pasarela de pagos...", section: "Tu Solución Digital" },
  { id: "budget", label: "¿Cuál es tu presupuesto para esta solución?", type: "select", options: ["Menos de $500 USD", "$500 - $1,500 USD", "$1,500 - $3,000 USD", "$3,000 - $5,000 USD", "Más de $5,000 USD", "Lo que haga falta si funciona"], section: "Tu Solución Digital" },
  { id: "timeline", label: "¿Para cuándo necesitas esto funcionando?", type: "select", options: ["Ya — es urgente", "Esta semana", "Este mes", "No tengo prisa, pero quiero hacerlo bien"], section: "Tu Solución Digital" },

  // Sección 5: Contacto
  { id: "contactName", label: "Tu nombre completo", type: "text", placeholder: "Nombre y apellido", required: true, section: "Tus Datos" },
  { id: "contactEmail", label: "Tu email de trabajo", type: "email", placeholder: "email@tunegocio.com", required: true, section: "Tus Datos" },
  { id: "contactPhone", label: "Tu WhatsApp (con código de país)", type: "tel", placeholder: "+57 300 123 4567", required: true, section: "Tus Datos" },
  { id: "preferredContact", label: "¿Cómo prefieres que te contactemos?", type: "select", options: ["WhatsApp", "Email", "Llamada telefónica"], section: "Tus Datos" },
];

const SECTIONS = [...new Set(QUESTIONS.map(q => q.section))];

export default function CuestionarioPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sectionQuestions = QUESTIONS.filter(q => q.section === SECTIONS[currentSection]);
  const progress = ((currentSection + 1) / SECTIONS.length) * 100;

  const updateAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setError("");
  };

  const validateSection = (): boolean => {
    const required = sectionQuestions.filter(q => q.required);
    for (const q of required) {
      if (!answers[q.id] || answers[q.id].trim() === "") {
        setError(`Por favor completa: "${q.label}"`);
        return false;
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

  const handleSubmit = async () => {
    if (!validateSection()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Error al enviar. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", padding: "40px 20px" }}>
        <div style={{ maxWidth: 500, textAlign: "center" }} className="animate-fade-in">
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 15, color: "#fff" }}>¡Diagnóstico Recibido!</h1>
          <p style={{ color: "#A0A0A0", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: 30 }}>
            Tu diagnóstico empresarial ha sido enviado exitosamente. Orlando revisará tu caso personalmente y se pondrá en contacto contigo por {answers.preferredContact || "WhatsApp"} en las próximas 24 horas.
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
                  value={answers[q.id] || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                />
              ) : q.type === "textarea" ? (
                <textarea
                  className="input-360"
                  placeholder={q.placeholder}
                  value={answers[q.id] || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  rows={4}
                />
              ) : q.type === "select" ? (
                <select
                  className="input-360"
                  value={answers[q.id] || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  {q.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : q.type === "range" ? (
                <div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={answers[q.id] || "5"}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    style={{ width: "100%", accentColor: "#F5C518" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#666", fontSize: 13, marginTop: 5 }}>
                    <span>1 — Puede esperar</span>
                    <span style={{ color: "#F5C518", fontWeight: 700, fontSize: 20 }}>{answers[q.id] || "5"}</span>
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
