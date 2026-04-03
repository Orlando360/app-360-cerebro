import { ClientSubmission } from "./db";

// App Generator Engine — creates customized HTML apps based on client data
// Uses conditional logic to select architecture, sections, copy, and design

interface GeneratedSection {
  id: string;
  html: string;
}

const COLOR_PALETTES: Record<string, { primary: string; secondary: string; accent: string; bg: string; text: string }> = {
  "salud": { primary: "#0EA5E9", secondary: "#38BDF8", accent: "#06B6D4", bg: "#F0F9FF", text: "#0C4A6E" },
  "tecnologia": { primary: "#8B5CF6", secondary: "#A78BFA", accent: "#7C3AED", bg: "#F5F3FF", text: "#3B0764" },
  "gastronomia": { primary: "#F97316", secondary: "#FB923C", accent: "#EA580C", bg: "#FFF7ED", text: "#7C2D12" },
  "belleza": { primary: "#EC4899", secondary: "#F472B6", accent: "#DB2777", bg: "#FDF2F8", text: "#831843" },
  "educacion": { primary: "#10B981", secondary: "#34D399", accent: "#059669", bg: "#ECFDF5", text: "#064E3B" },
  "legal": { primary: "#1E3A5F", secondary: "#2563EB", accent: "#1E40AF", bg: "#EFF6FF", text: "#1E3A8A" },
  "inmobiliaria": { primary: "#D97706", secondary: "#FBBF24", accent: "#B45309", bg: "#FFFBEB", text: "#78350F" },
  "fitness": { primary: "#EF4444", secondary: "#F87171", accent: "#DC2626", bg: "#FEF2F2", text: "#7F1D1D" },
  "default": { primary: "#F5C518", secondary: "#FFD700", accent: "#D4A017", bg: "#0A0A0A", text: "#FFFFFF" },
};

function getIndustryPalette(industry: string): typeof COLOR_PALETTES["default"] {
  const lower = industry.toLowerCase();
  for (const [key, palette] of Object.entries(COLOR_PALETTES)) {
    if (lower.includes(key)) return palette;
  }
  return COLOR_PALETTES["default"];
}

function generateHeroSection(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  return `
    <section style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${palette.bg} 0%,#fff 100%);padding:60px 20px;text-align:center;">
      <div style="max-width:800px;">
        <h1 style="font-size:clamp(2.5rem,5vw,4rem);font-weight:900;color:${palette.text};line-height:1.1;margin-bottom:20px;">${client.businessName}</h1>
        <p style="font-size:clamp(1.1rem,2vw,1.4rem);color:${palette.text}99;max-width:600px;margin:0 auto 40px;line-height:1.6;">${client.businessDescription || `Transformamos ${client.industry} con soluciones que resuelven tu problema principal: ${client.mainPain}`}</p>
        <a href="#servicios" style="display:inline-block;background:${palette.primary};color:#fff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;transition:all 0.3s ease;box-shadow:0 4px 15px ${palette.primary}40;">Descubre cómo →</a>
        <a href="https://wa.link/33ogyz" target="_blank" style="display:inline-block;margin-left:15px;background:transparent;color:${palette.primary};padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;border:2px solid ${palette.primary};">Habla con nosotros</a>
      </div>
    </section>`;
}

function generatePainSection(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  const problems = client.specificProblems.split(/[,.\n]/).filter(p => p.trim()).slice(0, 4);
  const problemCards = problems.map(p => `
    <div style="background:#fff;border:1px solid ${palette.primary}20;border-radius:12px;padding:24px;text-align:center;">
      <div style="width:50px;height:50px;background:${palette.primary}15;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 15px;font-size:24px;">⚡</div>
      <p style="color:${palette.text};font-size:15px;line-height:1.5;">${p.trim()}</p>
    </div>
  `).join("");

  return `
    <section style="padding:80px 20px;background:#fff;" id="problema">
      <div style="max-width:900px;margin:0 auto;text-align:center;">
        <h2 style="font-size:2rem;font-weight:800;color:${palette.text};margin-bottom:15px;">¿Te identificas con esto?</h2>
        <p style="color:${palette.text}80;font-size:1.1rem;margin-bottom:50px;">${client.mainPain}</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;">
          ${problemCards}
        </div>
      </div>
    </section>`;
}

function generateServicesSection(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  const services = client.mainServices.split(/[,.\n]/).filter(s => s.trim()).slice(0, 6);
  const serviceCards = services.map((s, i) => `
    <div style="background:${palette.bg};border:1px solid ${palette.primary}15;border-radius:12px;padding:30px;transition:all 0.3s ease;">
      <div style="font-size:2rem;margin-bottom:15px;">${["🎯", "⚡", "🚀", "💡", "🔧", "📈"][i % 6]}</div>
      <h3 style="color:${palette.text};font-size:1.1rem;font-weight:700;margin-bottom:10px;">${s.trim()}</h3>
      <p style="color:${palette.text}80;font-size:14px;line-height:1.5;">Solución diseñada específicamente para ${client.industry.toLowerCase()}</p>
    </div>
  `).join("");

  return `
    <section style="padding:80px 20px;background:${palette.bg};" id="servicios">
      <div style="max-width:1000px;margin:0 auto;text-align:center;">
        <h2 style="font-size:2rem;font-weight:800;color:${palette.text};margin-bottom:50px;">Nuestros Servicios</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:25px;">
          ${serviceCards}
        </div>
      </div>
    </section>`;
}

function generateDifferentiatorSection(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  return `
    <section style="padding:80px 20px;background:${palette.text};color:#fff;">
      <div style="max-width:800px;margin:0 auto;text-align:center;">
        <h2 style="font-size:2rem;font-weight:800;margin-bottom:20px;">¿Por qué elegirnos?</h2>
        <p style="font-size:1.2rem;line-height:1.7;opacity:0.9;margin-bottom:30px;">${client.differentiator}</p>
        <div style="display:flex;justify-content:center;gap:40px;flex-wrap:wrap;margin-top:40px;">
          <div><div style="font-size:2.5rem;font-weight:900;color:${palette.secondary};">${client.yearsInBusiness}+</div><div style="opacity:0.7;font-size:14px;">Años de experiencia</div></div>
          <div><div style="font-size:2.5rem;font-weight:900;color:${palette.secondary};">${client.currentClients ? client.currentClients.split(/[,]/).length + "0" : "100"}+</div><div style="opacity:0.7;font-size:14px;">Clientes satisfechos</div></div>
          <div><div style="font-size:2.5rem;font-weight:900;color:${palette.secondary};">${client.urgencyLevel}/10</div><div style="opacity:0.7;font-size:14px;">Nivel de compromiso</div></div>
        </div>
      </div>
    </section>`;
}

function generateTestimonialSection(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  const industry = client.industry.toLowerCase();
  const testimonials = [
    { name: "María González", role: `Cliente de ${client.businessName}`, text: `Desde que trabajamos con ${client.businessName}, nuestros resultados mejoraron significativamente. Su enfoque en ${industry} marca la diferencia.` },
    { name: "Carlos Mendoza", role: "Director de Operaciones", text: `La solución que nos proporcionaron resolvió exactamente nuestro problema de ${client.mainPain.toLowerCase().slice(0, 60)}. Totalmente recomendados.` },
    { name: "Ana Rodríguez", role: "Emprendedora", text: `Profesionalismo de primer nivel. ${client.businessName} entiende las necesidades reales del mercado ${industry}.` },
  ];

  const cards = testimonials.map(t => `
    <div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:30px;text-align:left;">
      <p style="color:${palette.text};font-size:15px;line-height:1.6;margin-bottom:20px;font-style:italic;">"${t.text}"</p>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;background:${palette.primary};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">${t.name[0]}</div>
        <div><div style="font-weight:700;color:${palette.text};font-size:14px;">${t.name}</div><div style="color:${palette.text}80;font-size:13px;">${t.role}</div></div>
      </div>
    </div>
  `).join("");

  return `
    <section style="padding:80px 20px;background:#fafafa;">
      <div style="max-width:1000px;margin:0 auto;text-align:center;">
        <h2 style="font-size:2rem;font-weight:800;color:${palette.text};margin-bottom:50px;">Lo que dicen nuestros clientes</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:25px;">
          ${cards}
        </div>
      </div>
    </section>`;
}

function generateContactSection(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  return `
    <section style="padding:80px 20px;background:${palette.bg};" id="contacto">
      <div style="max-width:600px;margin:0 auto;text-align:center;">
        <h2 style="font-size:2rem;font-weight:800;color:${palette.text};margin-bottom:15px;">Hablemos de tu proyecto</h2>
        <p style="color:${palette.text}80;font-size:1.1rem;margin-bottom:40px;">Agenda una consulta gratuita y descubre cómo podemos ayudarte</p>
        <form onsubmit="event.preventDefault();alert('¡Mensaje enviado! Te contactaremos pronto.');" style="display:flex;flex-direction:column;gap:15px;text-align:left;">
          <input type="text" placeholder="Tu nombre" required style="padding:14px 18px;border:1px solid ${palette.primary}30;border-radius:8px;font-size:15px;outline:none;font-family:inherit;">
          <input type="email" placeholder="Tu email" required style="padding:14px 18px;border:1px solid ${palette.primary}30;border-radius:8px;font-size:15px;outline:none;font-family:inherit;">
          <input type="tel" placeholder="Tu teléfono" style="padding:14px 18px;border:1px solid ${palette.primary}30;border-radius:8px;font-size:15px;outline:none;font-family:inherit;">
          <textarea placeholder="¿Cómo podemos ayudarte?" rows="4" style="padding:14px 18px;border:1px solid ${palette.primary}30;border-radius:8px;font-size:15px;outline:none;font-family:inherit;resize:vertical;"></textarea>
          <button type="submit" style="background:${palette.primary};color:#fff;padding:16px;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;">Enviar mensaje →</button>
        </form>
      </div>
    </section>`;
}

function generateFooter(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  return `
    <footer style="padding:40px 20px;background:${palette.text};color:#fff;text-align:center;">
      <p style="font-weight:700;font-size:1.2rem;margin-bottom:8px;">${client.businessName}</p>
      <p style="opacity:0.6;font-size:14px;margin-bottom:20px;">${client.contactEmail} · ${client.contactPhone}</p>
      <p style="opacity:0.4;font-size:12px;">© ${new Date().getFullYear()} ${client.businessName}. Todos los derechos reservados.</p>
      <p style="opacity:0.3;font-size:11px;margin-top:10px;">Creado con App Factory 360 — Orlando Iguarán</p>
    </footer>`;
}

// Pricing section for funnels
function generatePricingSection(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  const services = client.mainServices.split(/[,.\n]/).filter(s => s.trim()).slice(0, 3);
  const plans = [
    { name: "Básico", price: "Desde $99", features: services.slice(0, 1), highlight: false },
    { name: "Profesional", price: "Desde $299", features: services.slice(0, 2), highlight: true },
    { name: "Premium", price: "Desde $599", features: services, highlight: false },
  ];

  const cards = plans.map(p => `
    <div style="background:${p.highlight ? palette.primary : '#fff'};color:${p.highlight ? '#fff' : palette.text};border:${p.highlight ? 'none' : `1px solid ${palette.primary}20`};border-radius:16px;padding:40px 30px;text-align:center;${p.highlight ? `transform:scale(1.05);box-shadow:0 20px 40px ${palette.primary}30;` : ''}">
      <h3 style="font-size:1.3rem;font-weight:800;margin-bottom:10px;">${p.name}</h3>
      <div style="font-size:2rem;font-weight:900;margin-bottom:25px;">${p.price}</div>
      <ul style="list-style:none;padding:0;margin-bottom:30px;">
        ${p.features.map(f => `<li style="padding:8px 0;border-bottom:1px solid ${p.highlight ? 'rgba(255,255,255,0.2)' : '#eee'};font-size:14px;">✓ ${f.trim()}</li>`).join("")}
        <li style="padding:8px 0;font-size:14px;">✓ Soporte dedicado</li>
        ${p.highlight ? '<li style="padding:8px 0;font-size:14px;">✓ Consultoría personalizada</li>' : ''}
      </ul>
      <a href="#contacto" style="display:inline-block;background:${p.highlight ? '#fff' : palette.primary};color:${p.highlight ? palette.primary : '#fff'};padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Empezar ahora</a>
    </div>
  `).join("");

  return `
    <section style="padding:80px 20px;background:#fff;" id="pricing">
      <div style="max-width:1000px;margin:0 auto;text-align:center;">
        <h2 style="font-size:2rem;font-weight:800;color:${palette.text};margin-bottom:50px;">Planes y Precios</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:25px;align-items:center;">
          ${cards}
        </div>
      </div>
    </section>`;
}

// Dashboard sections
function generateDashboardApp(client: ClientSubmission, palette: ReturnType<typeof getIndustryPalette>): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${client.businessName} — Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;background:#f5f5f5;color:#1a1a1a}
  .sidebar{position:fixed;left:0;top:0;width:250px;height:100vh;background:${palette.text};color:#fff;padding:30px 20px;overflow-y:auto}
  .sidebar h2{font-size:1.1rem;margin-bottom:30px;color:${palette.secondary}}
  .sidebar a{display:block;padding:12px 15px;color:#fff;text-decoration:none;border-radius:8px;margin-bottom:5px;font-size:14px;transition:all 0.2s}
  .sidebar a:hover,.sidebar a.active{background:${palette.primary};font-weight:600}
  .main{margin-left:250px;padding:30px}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:30px}
  .stat-card{background:#fff;border-radius:12px;padding:25px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
  .stat-card .label{font-size:13px;color:#888;margin-bottom:8px}
  .stat-card .value{font-size:2rem;font-weight:800;color:${palette.text}}
  .stat-card .change{font-size:13px;color:#22c55e;margin-top:5px}
  .chart-card{background:#fff;border-radius:12px;padding:25px;box-shadow:0 1px 3px rgba(0,0,0,0.1);margin-bottom:20px}
  table{width:100%;border-collapse:collapse}
  th,td{text-align:left;padding:12px 15px;border-bottom:1px solid #eee;font-size:14px}
  th{font-weight:600;color:#888;font-size:13px}
  @media(max-width:768px){.sidebar{display:none}.main{margin-left:0}}
</style>
</head>
<body>
<div class="sidebar">
  <h2>${client.businessName}</h2>
  <a href="#" class="active">📊 Dashboard</a>
  <a href="#">👥 Clientes</a>
  <a href="#">📋 Servicios</a>
  <a href="#">💰 Finanzas</a>
  <a href="#">📈 Reportes</a>
  <a href="#">⚙️ Configuración</a>
</div>
<div class="main">
  <h1 style="font-size:1.8rem;font-weight:800;margin-bottom:25px;">Dashboard — ${client.businessName}</h1>
  <div class="stats">
    <div class="stat-card"><div class="label">Clientes Activos</div><div class="value">127</div><div class="change">↑ 12% este mes</div></div>
    <div class="stat-card"><div class="label">Ingresos Mensuales</div><div class="value">$24.5K</div><div class="change">↑ 8% vs mes anterior</div></div>
    <div class="stat-card"><div class="label">Servicios Entregados</div><div class="value">89</div><div class="change">↑ 15% este mes</div></div>
    <div class="stat-card"><div class="label">Satisfacción</div><div class="value">4.8/5</div><div class="change">↑ 0.2 puntos</div></div>
  </div>
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
    <div class="chart-card"><h3 style="margin-bottom:15px;font-size:1rem;">Ingresos últimos 6 meses</h3><canvas id="revenueChart"></canvas></div>
    <div class="chart-card"><h3 style="margin-bottom:15px;font-size:1rem;">Servicios por tipo</h3><canvas id="servicesChart"></canvas></div>
  </div>
  <div class="chart-card">
    <h3 style="margin-bottom:15px;font-size:1rem;">Últimas transacciones</h3>
    <table>
      <thead><tr><th>Cliente</th><th>Servicio</th><th>Monto</th><th>Estado</th></tr></thead>
      <tbody>
        <tr><td>Juan Pérez</td><td>${client.mainServices.split(/[,.]/)[0]?.trim() || 'Consultoría'}</td><td>$450</td><td style="color:#22c55e;">Pagado</td></tr>
        <tr><td>María López</td><td>${client.mainServices.split(/[,.]/)[1]?.trim() || 'Servicio Premium'}</td><td>$890</td><td style="color:#22c55e;">Pagado</td></tr>
        <tr><td>Carlos Ruiz</td><td>${client.mainServices.split(/[,.]/)[0]?.trim() || 'Consultoría'}</td><td>$320</td><td style="color:#f59e0b;">Pendiente</td></tr>
        <tr><td>Ana Martínez</td><td>${client.mainServices.split(/[,.]/)[2]?.trim() || 'Plan Básico'}</td><td>$1,200</td><td style="color:#22c55e;">Pagado</td></tr>
      </tbody>
    </table>
  </div>
</div>
<script>
new Chart(document.getElementById('revenueChart'),{type:'line',data:{labels:['Oct','Nov','Dic','Ene','Feb','Mar'],datasets:[{label:'Ingresos ($)',data:[18500,21000,19800,22500,24100,24500],borderColor:'${palette.primary}',backgroundColor:'${palette.primary}20',fill:true,tension:0.4}]},options:{responsive:true,plugins:{legend:{display:false}}}});
new Chart(document.getElementById('servicesChart'),{type:'doughnut',data:{labels:['${client.mainServices.split(/[,.]/)[0]?.trim()||"Servicio A"}','${client.mainServices.split(/[,.]/)[1]?.trim()||"Servicio B"}','Otros'],datasets:[{data:[45,35,20],backgroundColor:['${palette.primary}','${palette.secondary}','${palette.accent}']}]},options:{responsive:true}});
</script>
</body>
</html>`;
}

export function generateApp(client: ClientSubmission): string {
  const palette = getIndustryPalette(client.industry);
  const appType = (client.appType || "landing").toLowerCase();

  if (appType.includes("dashboard")) {
    return generateDashboardApp(client, palette);
  }

  // Landing or Funnel
  const isFunnel = appType.includes("funnel") || appType.includes("embudo") || appType.includes("venta");

  let sections = [
    generateHeroSection(client, palette),
    generatePainSection(client, palette),
    generateServicesSection(client, palette),
    generateDifferentiatorSection(client, palette),
  ];

  if (isFunnel) {
    sections.push(generatePricingSection(client, palette));
  }

  sections.push(
    generateTestimonialSection(client, palette),
    generateContactSection(client, palette),
    generateFooter(client, palette)
  );

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${client.businessName} — ${isFunnel ? 'Transforma tu negocio' : 'Bienvenido'}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
  img{max-width:100%}
  html{scroll-behavior:smooth}
</style>
</head>
<body>
<nav style="position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);padding:15px 30px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;">
  <div style="font-weight:800;font-size:1.2rem;color:${palette.text};">${client.businessName}</div>
  <div style="display:flex;gap:25px;align-items:center;">
    <a href="#servicios" style="color:${palette.text};text-decoration:none;font-size:14px;font-weight:500;">Servicios</a>
    <a href="#contacto" style="color:${palette.text};text-decoration:none;font-size:14px;font-weight:500;">Contacto</a>
    <a href="https://wa.link/33ogyz" target="_blank" style="background:${palette.primary};color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">WhatsApp</a>
  </div>
</nav>
${sections.join("\n")}
<!-- WhatsApp floating button -->
<a href="https://wa.link/33ogyz" target="_blank" style="position:fixed;bottom:25px;right:25px;width:60px;height:60px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(37,211,102,0.4);z-index:1000;text-decoration:none;font-size:28px;">💬</a>
</body>
</html>`;
}
