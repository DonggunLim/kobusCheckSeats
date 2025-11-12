# Playwright 공식 이미지
FROM mcr.microsoft.com/playwright:v1.56.1-jammy AS base

# --- Install dependencies only when needed ---
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# --- Production dependencies ---
FROM base AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Build stage (Next.js 빌드) ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 빌드
RUN npm run build

# --- Development image (app과 worker 모두 사용) ---
FROM base AS dev
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

CMD ["npm", "run", "dev"]

# --- Production image for Next.js App ---
FROM base AS prod-app
WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json ./
COPY --from=builder /app/prisma ./prisma

CMD ["npm", "start"]

# --- Production image for Worker ---
FROM base AS prod-worker
WORKDIR /app

ENV NODE_ENV=production

# 프로덕션 의존성 복사
COPY --from=prod-deps /app/node_modules ./node_modules
# Worker 소스 코드 복사
COPY src/workers ./src/workers
COPY src/shared ./src/shared
COPY package.json ./
COPY --from=builder /app/prisma ./prisma

CMD ["npm", "run", "worker"]