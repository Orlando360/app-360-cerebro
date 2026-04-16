/**
 * ab-test-opus-47.ts
 * Compara claude-sonnet-4-6 vs claude-opus-4-7 en 5 clientes mock del Método 360.
 * Guarda outputs en ./outputs/ab-test-[timestamp]/ y muestra tabla comparativa.
 *
 * Uso: npx tsx scripts/ab-test-opus-47.ts
 */

import fs from "fs";
import path from "path";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
if (!ANTHROPIC_API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY no configurada en el entorno");
  process.exit(1);
}

// ── Modelos a comparar ──────────────────────────────────────────────────────

const MODELS = ["claude-sonnet-4-6", "claude-opus-4-7"] as const;

// ── Clientes mock ───────────────────────────────────────────────────────────

const CLIENTES = [
  {
    nombre: "Di Lusso",
    sector: "Moda de lujo / Fashion",
    brief: `Marca de ropa de lujo colombiana, 3 años en el mercado, ticket promedio $450.000 COP.
Facturación mensual actual: $18M COP. Meta: $35M en 90 días.
Dolor principal: no logran conectar con influencers de lujo que realmente vendan, no solo posteen.
Han intentado: contratación directa sin contrato, gifting sin seguimiento, 2 agencias que fallaron.
Urgencia: 8/10. Pérdida mensual estimada por malas alianzas: $4M COP.
Presupuesto disponible: $2.5M COP.`,
  },
  {
    nombre: "Leviäh",
    sector: "Streetwear / Moda urbana",
    brief: `Marca de streetwear local, 1 año, ticket promedio $120.000 COP.
Facturación mensual actual: $6M COP. Meta: $15M en 90 días.
Dolor: alcance muy local (Medellín), quieren expansión nacional via micro-influencers.
Han intentado: Instagram orgánico, TikTok sin estrategia, canje sin ROI.
Urgencia: 9/10. Sin escalar en 3 meses podrían cerrar.
Presupuesto: $800.000 COP.`,
  },
  {
    nombre: "The Buy Squad",
    sector: "Cosméticos / Beauty",
    brief: `Línea de cosméticos naturales, 2 años, ticket promedio $85.000 COP.
Facturación mensual actual: $12M COP. Meta: $25M en 90 días.
Dolor: conversión baja desde contenido de influencers (muchas vistas, pocas ventas).
Han intentado: gifting masivo, afiliados sin seguimiento, lives de Instagram.
Urgencia: 7/10. Tienen inventario acumulado que necesita rotación.
Presupuesto: $1.5M COP.`,
  },
  {
    nombre: "Fraterna Catering",
    sector: "Catering / Eventos corporativos",
    brief: `Empresa de catering para eventos corporativos, 5 años, ticket promedio $8M COP.
Facturación mensual actual: $22M COP. Meta: $40M en 90 días.
Dolor: ciclo de venta muy largo, dependen de referidos, no tienen presencia digital estructurada.
Han intentado: pauta en LinkedIn, presencia básica en Instagram, sin influencers.
Urgencia: 6/10. Temporada alta se acerca en 2 meses.
Presupuesto: $3M COP.`,
  },
  {
    nombre: "Pequeños Gigantes",
    sector: "E-commerce infantil",
    brief: `Tienda online de productos para bebés y niños 0-6 años, 18 meses, ticket promedio $65.000 COP.
Facturación mensual actual: $9M COP. Meta: $20M en 90 días.
Dolor: saturación de nicho, no diferencian su marca, muchos competidores con precios más bajos.
Han intentado: Facebook Ads (ROAS 1.2), influencers mamás sin contrato formal, SEO básico.
Urgencia: 8/10. Tienen producto superior pero sin posicionamiento claro.
Presupuesto: $1.2M COP.`,
  },
];

const SYSTEM_PROMPT = `Eres el Método 360 de Orlando Iguarán, el sistema de consultoría de alianzas marca-influencer más efectivo de Colombia.

Cuando recibes el brief de un cliente, generas un DIAGNÓSTICO EJECUTIVO con:
1. Score global 0-100 en 5 pilares: Propuesta de Valor, Adquisición, Alianzas, Contenido, Monetización
2. Las 2 brechas críticas más urgentes
3. Un plan de acción de 30 días con 3 acciones concretas
4. Propuesta de servicio recomendada (básico $1M / estándar $2.5M / premium $5M COP) con justificación de ROI

Sé directo, concreto y accionable. Nada genérico. Tuteo colombiano.`;

// ── Función de llamada a API ────────────────────────────────────────────────

async function callClaude(model: string, brief: string): Promise<{ text: string; ms: number }> {
  const start = Date.now();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: brief }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${model} → HTTP ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content: Array<{ type: string; text: string }>; usage?: { input_tokens: number; output_tokens: number } };
  const text = data.content.find((b) => b.type === "text")?.text ?? "";
  const ms = Date.now() - start;
  return { text, ms };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function scoreText(text: string): number {
  // Heurística: longitud ponderada + presencia de elementos clave
  let score = 0;
  score += Math.min(text.length / 50, 30); // hasta 30 pts por longitud
  if (/score|pilares|diagnóstico/i.test(text)) score += 10;
  if (/brecha|crítica|urgente/i.test(text)) score += 10;
  if (/plan|acción|30 días/i.test(text)) score += 10;
  if (/propuesta|\$[0-9]/i.test(text)) score += 10;
  if (/ROI|retorno|COP/i.test(text)) score += 10;
  if (/\d{1,3}(,\d{3})*|\d+%/i.test(text)) score += 10; // datos numéricos
  return Math.round(Math.min(score, 100));
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = path.join(process.cwd(), "outputs", `ab-test-${timestamp}`);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n🧪  A/B Test: claude-sonnet-4-6 vs claude-opus-4-7`);
  console.log(`📁  Outputs → ${outDir}\n`);

  const results: Array<{
    cliente: string;
    sector: string;
    sonnetMs: number;
    opusMs: number;
    sonnetScore: number;
    opusScore: number;
    sonnetLen: number;
    opusLen: number;
  }> = [];

  for (const cliente of CLIENTES) {
    console.log(`▶  Procesando: ${cliente.nombre} (${cliente.sector})`);

    const [sonnet, opus] = await Promise.all([
      callClaude("claude-sonnet-4-6", `CLIENTE: ${cliente.nombre}\nSECTOR: ${cliente.sector}\n\n${cliente.brief}`),
      callClaude("claude-opus-4-7", `CLIENTE: ${cliente.nombre}\nSECTOR: ${cliente.sector}\n\n${cliente.brief}`),
    ]);

    // Guardar outputs
    const slug = cliente.nombre.toLowerCase().replace(/\s+/g, "-");
    fs.writeFileSync(
      path.join(outDir, `cliente-${slug}-sonnet-4-6.md`),
      `# ${cliente.nombre} — claude-sonnet-4-6\n_${cliente.sector}_ | ${sonnet.ms}ms | ${sonnet.text.length} chars\n\n---\n\n${sonnet.text}`,
    );
    fs.writeFileSync(
      path.join(outDir, `cliente-${slug}-opus-4-7.md`),
      `# ${cliente.nombre} — claude-opus-4-7\n_${cliente.sector}_ | ${opus.ms}ms | ${opus.text.length} chars\n\n---\n\n${opus.text}`,
    );

    results.push({
      cliente: cliente.nombre,
      sector: cliente.sector,
      sonnetMs: sonnet.ms,
      opusMs: opus.ms,
      sonnetScore: scoreText(sonnet.text),
      opusScore: scoreText(opus.text),
      sonnetLen: sonnet.text.length,
      opusLen: opus.text.length,
    });

    console.log(
      `   ✅  Sonnet: ${sonnet.ms}ms | score ${scoreText(sonnet.text)} | ${sonnet.text.length} chars`,
    );
    console.log(
      `   ✅  Opus:   ${opus.ms}ms | score ${scoreText(opus.text)} | ${opus.text.length} chars`,
    );
  }

  // ── Tabla comparativa ─────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(90)}`);
  console.log(
    `${"Cliente".padEnd(22)} ${"Sonnet ms".padStart(10)} ${"Opus ms".padStart(10)} ${"Sonnet score".padStart(13)} ${"Opus score".padStart(11)} ${"Ganador".padStart(10)}`,
  );
  console.log("─".repeat(90));

  let sonnetWins = 0;
  let opusWins = 0;

  for (const r of results) {
    const winner = r.opusScore > r.sonnetScore ? "Opus 4.7" : r.sonnetScore > r.opusScore ? "Sonnet 4.6" : "Empate";
    if (winner === "Opus 4.7") opusWins++;
    else if (winner === "Sonnet 4.6") sonnetWins++;

    console.log(
      `${r.cliente.padEnd(22)} ${String(r.sonnetMs).padStart(9)}ms ${String(r.opusMs).padStart(9)}ms ${String(r.sonnetScore).padStart(12)}pt ${String(r.opusScore).padStart(10)}pt ${winner.padStart(10)}`,
    );
  }

  console.log("─".repeat(90));

  const avgSonnetMs = Math.round(results.reduce((a, r) => a + r.sonnetMs, 0) / results.length);
  const avgOpusMs = Math.round(results.reduce((a, r) => a + r.opusMs, 0) / results.length);
  const avgSonnetScore = Math.round(results.reduce((a, r) => a + r.sonnetScore, 0) / results.length);
  const avgOpusScore = Math.round(results.reduce((a, r) => a + r.opusScore, 0) / results.length);

  console.log(
    `${"PROMEDIO".padEnd(22)} ${String(avgSonnetMs).padStart(9)}ms ${String(avgOpusMs).padStart(9)}ms ${String(avgSonnetScore).padStart(12)}pt ${String(avgOpusScore).padStart(10)}pt`,
  );
  console.log(`\n🏆  Resultados: Opus 4.7 ganó ${opusWins}/5 | Sonnet 4.6 ganó ${sonnetWins}/5`);
  console.log(`📁  Outputs guardados en: ${outDir}\n`);

  // Guardar resumen JSON
  fs.writeFileSync(
    path.join(outDir, "resumen.json"),
    JSON.stringify({ timestamp, avgSonnetMs, avgOpusMs, avgSonnetScore, avgOpusScore, opusWins, sonnetWins, results }, null, 2),
  );
}

main().catch((err) => {
  console.error("❌  Error fatal:", err);
  process.exit(1);
});
