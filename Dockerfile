# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Declare build args — passed via --build-arg in cloudbuild.yaml
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_FIREBASE_FIRESTORE_DATABASE_ID

# Strip any trailing newlines/CRs (Cloud Build trigger values can have them)
# Inline assignment scopes trimmed vars only to this RUN command
RUN VITE_FIREBASE_API_KEY="$(printf '%s' "$VITE_FIREBASE_API_KEY" | tr -d '\n\r')" \
    VITE_FIREBASE_AUTH_DOMAIN="$(printf '%s' "$VITE_FIREBASE_AUTH_DOMAIN" | tr -d '\n\r')" \
    VITE_FIREBASE_PROJECT_ID="$(printf '%s' "$VITE_FIREBASE_PROJECT_ID" | tr -d '\n\r')" \
    VITE_FIREBASE_STORAGE_BUCKET="$(printf '%s' "$VITE_FIREBASE_STORAGE_BUCKET" | tr -d '\n\r')" \
    VITE_FIREBASE_MESSAGING_SENDER_ID="$(printf '%s' "$VITE_FIREBASE_MESSAGING_SENDER_ID" | tr -d '\n\r')" \
    VITE_FIREBASE_APP_ID="$(printf '%s' "$VITE_FIREBASE_APP_ID" | tr -d '\n\r')" \
    VITE_FIREBASE_MEASUREMENT_ID="$(printf '%s' "$VITE_FIREBASE_MEASUREMENT_ID" | tr -d '\n\r')" \
    VITE_FIREBASE_FIRESTORE_DATABASE_ID="$(printf '%s' "$VITE_FIREBASE_FIRESTORE_DATABASE_ID" | tr -d '\n\r')" \
    npm run build

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY server.ts tsconfig.json ./
COPY src/emails ./src/emails
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
