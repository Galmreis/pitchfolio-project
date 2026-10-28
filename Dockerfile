# ==========================================
# Stage 1: Dependencies Cache
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* bun.lock* ./
RUN npm install --legacy-peer-deps --no-audit

# ==========================================
# Stage 2: Production Builder
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

# ==========================================
# Stage 3: Minimal Production Runtime
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs appuser

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

USER appuser

EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/healthz || exit 1

CMD ["node", ".output/server/index.mjs"]
