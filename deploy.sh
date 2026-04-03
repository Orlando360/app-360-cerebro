#!/bin/bash
# APP FACTORY 360 — Deploy automático a Vercel
# Ejecutar: chmod +x deploy.sh && ./deploy.sh

echo "⚡ APP FACTORY 360 — Desplegando a Vercel..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
  echo "❌ Error: Ejecuta este script desde la carpeta app-factory-360"
  exit 1
fi

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "📦 Instalando Vercel CLI..."
  npm install -g vercel
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm install
fi

# Build
echo "🔨 Construyendo proyecto..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Error en el build. Revisa los errores arriba."
  exit 1
fi

echo ""
echo "🚀 Desplegando a Vercel..."
echo ""

# Deploy a producción
vercel deploy --prod

echo ""
echo "✅ ¡Deploy completado!"
echo ""
echo "📌 URLs importantes:"
echo "   /cuestionario  → Link que mandas a los clientes"
echo "   /dashboard     → Tu panel privado"
echo ""
