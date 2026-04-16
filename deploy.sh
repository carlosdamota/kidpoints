#!/usr/bin/env bash
# deploy.sh — Build & deploy to Google Cloud Run
# Usage: bash deploy.sh
# Requirements: gcloud CLI authenticated, Docker running

set -e  # Exit on any error

# ─── Config ───────────────────────────────────────────────────────────────────
PROJECT_ID="family-quest-points"           # ← Tu GCP project ID
SERVICE_NAME="kidpoints"                   # ← Nombre del Cloud Run service
REGION="europe-west2"                      # ← Región donde está el service
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"   # ← Container Registry path

# Load VITE_* vars from .env.local for the build
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep '^VITE_' | xargs)
  echo "✅ Loaded VITE_* vars from .env.local"
else
  echo "❌ .env.local not found. Copy .env.example and fill in values."
  exit 1
fi

echo ""
echo "🐳 Building Docker image: $IMAGE"
docker build \
  --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
  --build-arg VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
  --build-arg VITE_FIREBASE_MEASUREMENT_ID="$VITE_FIREBASE_MEASUREMENT_ID" \
  --build-arg VITE_FIREBASE_FIRESTORE_DATABASE_ID="$VITE_FIREBASE_FIRESTORE_DATABASE_ID" \
  -t "$IMAGE" .

echo ""
echo "📤 Pushing image to Container Registry..."
docker push "$IMAGE"

echo ""
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "RESEND_API_KEY=RESEND_API_KEY:latest" \
  --project "$PROJECT_ID"

echo ""
echo "✅ Deploy complete!"
gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format "value(status.url)"
