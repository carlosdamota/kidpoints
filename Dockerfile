# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# .env.production is created by Cloud Build before docker build runs.
# Vite reads it automatically during `npm run build` (production mode).
COPY . .
RUN npm run build

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY server.ts tsconfig.json ./
COPY src/emails ./src/emails
COPY --from=builder /app/dist ./dist

# Runtime env vars are injected by Cloud Run (RESEND_API_KEY via Secret Manager)
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
