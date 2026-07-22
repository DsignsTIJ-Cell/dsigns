#!/bin/bash
# ============================================================
#  Dsigns - App de Cotizaciones PWA
#  Script de instalación y arranque
# ============================================================

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║          Dsigns - Instalador                  ║"
echo "║          App de Cotizaciones PWA              ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
    echo "❌ ERROR: Node.js no está instalado"
    echo "   Descárgalo de: https://nodejs.org (versión 18+)"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ ERROR: Node.js versión $NODE_VERSION encontrada, se necesita 18+"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"
echo ""

# Install dependencies
echo "📦 Instalando dependencias..."
npm install
echo ""

# Generate Prisma client
echo "🗄️ Configurando base de datos..."
npx prisma generate
npx prisma db push
echo ""

# Build
echo "🔨 Construyendo la aplicación..."
npm run build
echo ""

echo "╔═══════════════════════════════════════════════╗"
echo "║          ✅ ¡Instalación completada!          ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "Para iniciar la app ejecuta:"
echo "  npm start"
echo ""
echo "Luego abre en tu navegador:"
echo "  🌐 http://localhost:3000"
echo ""
echo "📱 Para instalar en tu celular Android:"
echo "  1. Abre Chrome en tu teléfono"
echo "  2. Ve a http://<IP_DE_TU_PC>:3000"
echo "  3. Menú ⋮ → 'Agregar a pantalla de inicio'"
echo ""
