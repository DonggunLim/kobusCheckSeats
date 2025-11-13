#!/bin/sh
# 이 스크립트는 'app' 컨테이너용입니다.
# ----------------------------------------------------

set -e # 명령어 하나라도 실패하면 즉시 중단

echo "[App Entrypoint] 1. Running Prisma DB Push (Sync Schema + Generate Client)..."

# schema.prisma 기준으로 DB를 동기화합니다.
# (개발 환경에서만 사용)
npx prisma db push

echo "[App Entrypoint] 2. Updating Master Data (Terminals, Routes)..."

# Kobus 마스터 데이터 업데이트 (터미널, 노선 정보)
npm run db:update || echo "[App Entrypoint] ⚠️  Master data update failed, but continuing..."

echo "[App Entrypoint] 3. Starting 'npm run dev'..."

# '$@'는 docker-compose.yml의 command에서 전달된
# ["npm", "run", "dev"] 인자들을 의미합니다.
exec "$@"