#!/usr/bin/env bash
# Publica Rotation Lab (página + modo con IA opcional) en Google Cloud Run.
# Ejecutar en Cloud Shell, dentro de esta carpeta:   bash deploy.sh
# La clave de Gemini se escribe oculta y se guarda en Secret Manager: no queda en la página ni en el código.
set -euo pipefail

PROJECT="${PROJECT:-$(gcloud config get-value project 2>/dev/null || true)}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-rotation-lab}"
if [ -z "$PROJECT" ]; then
  echo "No hay proyecto elegido. Ejecutá:  gcloud config set project TU_PROYECTO   y volvé a correr este script."
  exit 1
fi
gcloud config set project "$PROJECT" >/dev/null
echo "Proyecto: $PROJECT · Región: $REGION · Servicio: $SERVICE"

read -r -p "¿Activar el modo con IA de Gemini? (s/n): " IA
echo "Habilitando servicios de Google Cloud (puede tardar un minuto)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

ENV_VARS="RATE_PER_MIN=20"
EXTRA=()
if [[ "$IA" =~ ^[sS] ]]; then
  read -r -p "Nombre exacto del modelo de Gemini (el de la documentación vigente de Google): " MODEL
  if [ -z "$MODEL" ]; then echo "Falta el nombre del modelo."; exit 1; fi
  gcloud services enable secretmanager.googleapis.com aiplatform.googleapis.com generativelanguage.googleapis.com || true
  if ! gcloud secrets describe gemini-api-key >/dev/null 2>&1; then
    read -r -s -p "Pegá la clave de Gemini (no se muestra en pantalla) y Enter: " KEY; echo
    if [ -z "$KEY" ]; then echo "No se ingresó ninguna clave."; exit 1; fi
    printf '%s' "$KEY" | gcloud secrets create gemini-api-key --data-file=- --replication-policy=automatic
    unset KEY
  else
    echo "Ya existe el secreto gemini-api-key: se usa ese."
  fi
  PN="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
  gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${PN}-compute@developer.gserviceaccount.com" \
    --role=roles/secretmanager.secretAccessor >/dev/null
  ENV_VARS="${ENV_VARS},GEMINI_MODEL=${MODEL}"
  EXTRA+=(--set-secrets "GEMINI_API_KEY=gemini-api-key:latest")
fi

echo "Publicando (la primera vez tarda unos minutos; si pregunta por un repositorio de Artifact Registry, respondé Y)..."
gcloud run deploy "$SERVICE" --source . --region "$REGION" --allow-unauthenticated \
  --set-env-vars "$ENV_VARS" "${EXTRA[@]}"

URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"
echo
echo "=============================================="
echo " Listo. Dirección pública:  $URL"
echo "=============================================="
echo "Comprobá: abrí la dirección, probá el asistente y el botón 'Instalar app'."
