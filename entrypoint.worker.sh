#!/bin/sh
# 이 스크립트는 'worker' 컨테이너용입니다.
# ----------------------------------------------------

set -e # 명령어 하나라도 실패하면 즉시 중단

echo "[Worker Entrypoint] 1. Generating Prisma Client..."

# Prisma Client 생성
# (개발/프로덕션 환경 모두 필요)
npx prisma generate

echo "[Worker Entrypoint] 2. Starting Worker..."

# 환경에 따라 실행 명령 선택
if [ "$NODE_ENV" = "production" ]; then
  exec npm run worker
else
  exec npm run worker:dev
fi
