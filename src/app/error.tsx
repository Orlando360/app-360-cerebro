"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0A0A0A", color: "#fff", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 24 }}>⚠️</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12 }}>Algo salió mal</h1>
      <p style={{ color: "#666", marginBottom: 24, maxWidth: 400 }}>Hubo un error inesperado. Por favor intenta de nuevo.</p>
      <button
        onClick={reset}
        style={{ background: "#F5C518", color: "#000", padding: "12px 32px", borderRadius: 8, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
      >
        Reintentar
      </button>
    </div>
  );
}
