import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0A0A",
        color: "#fff",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 700 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#F5C518",
            letterSpacing: 3,
            marginBottom: 20,
            textTransform: "uppercase",
          }}
        >
          Orlando Iguarán 360
        </div>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          App Factory{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #F5C518, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            360
          </span>
        </h1>
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "#A0A0A0",
            lineHeight: 1.7,
            marginBottom: 50,
            maxWidth: 550,
            margin: "0 auto 50px",
          }}
        >
          Diagnóstico empresarial inteligente y generación automatizada de apps
          personalizadas para tu negocio. Sin complicaciones. Sin esperas.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/cuestionario"
            style={{
              background: "#F5C518",
              color: "#0A0A0A",
              padding: "16px 40px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 16,
              transition: "all 0.3s ease",
            }}
          >
            Iniciar diagnóstico →
          </Link>
          <Link
            href="/dashboard"
            style={{
              background: "transparent",
              color: "#F5C518",
              padding: "16px 40px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 16,
              border: "2px solid rgba(245, 197, 24, 0.3)",
            }}
          >
            Panel de Orlando
          </Link>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 30,
          fontSize: 13,
          color: "#444",
        }}
      >
        © {new Date().getFullYear()} Orlando Iguarán 360 — Todos los derechos reservados
      </div>
    </main>
  );
}
