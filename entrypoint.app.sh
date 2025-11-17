#!/bin/sh
# 이 스크립트는 'app' 컨테이너용입니다.
# ----------------------------------------------------

set -e # 명령어 하나라도 실패하면 즉시 중단

# Prisma 마이그레이션 적용
echo "[App Entrypoint] 1. Running Prisma Migrate Deploy ($NODE_ENV)..."
npx prisma migrate deploy

echo "[App Entrypoint] 2. Generating Prisma Client..."
npx prisma generate

echo "[App Entrypoint] 3. Starting application..."

# 환경에 따라 실행 명령 선택
if [ "$NODE_ENV" = "production" ]; then
  exec npm start
else
  exec npm run dev
fi