#!/usr/bin/env bash
# Sube los PDF piloto del catálogo a Firebase Storage.
# Requiere: gcloud CLI autenticado con acceso al proyecto.
#
#   gcloud auth login
#   gcloud config set project carlogger-app
#   pnpm run upload:manuals
#
# Alternativa: Firebase Console → Storage → Subir a catalog/manuals/...

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUCKET="${FIREBASE_STORAGE_BUCKET:-carlogger-app.firebasestorage.app}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "❌ gcloud no está instalado."
  echo "   Subí los archivos manualmente desde Firebase Console:"
  echo "   catalog/manuals/volkswagen/gol.pdf"
  echo "   catalog/manuals/toyota/corolla.pdf"
  echo "   catalog/manuals/chevrolet/onix.pdf"
  exit 1
fi

echo "→ Bucket: gs://${BUCKET}"
echo "→ Desplegando reglas de Storage (lectura catálogo)..."
cd "$ROOT"
pnpm exec firebase deploy --only storage

for rel in volkswagen/gol.pdf toyota/corolla.pdf chevrolet/onix.pdf; do
  local_file="${ROOT}/catalog/manuals/${rel}"
  remote_path="catalog/manuals/${rel}"
  if [[ ! -f "$local_file" ]]; then
    echo "⚠️  Falta ${local_file}, omitiendo."
    continue
  fi
  echo "→ Subiendo ${remote_path}..."
  gcloud storage cp "$local_file" "gs://${BUCKET}/${remote_path}" \
    --content-type=application/pdf
done

echo "✅ Manuales subidos. Probá en la app con un Gol, Corolla u Onix."
