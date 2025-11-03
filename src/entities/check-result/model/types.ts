/**
 * Check Result entity types
 */

import type { RouteScheduleSlot, RouteQuery } from "@/entities/bus-route";

/**
 * 버스 체크 결과 엔티티
 */
export interface CheckResult {
  timestamp: string;
  config: RouteQuery;
  results: RouteScheduleSlot[];
  foundSeats: boolean;
  success: boolean;
  error?: string;
  totalCheckCount: number; // 해당 세션에서 수행한 총 조회 횟수 (반복 조회 시 누적)
  firstFoundTime: string | null; // 해당 조회에서 최초로 좌석을 발견한 시간대
  durationMs: number; // 세션 시작부터 좌석 발견까지 걸린 총 시간 (밀리초)
  sessionId?: string; // 세션 ID (반복 조회를 묶는 단위)
}

/**
 * 통계 정보
 */
export interface Stats {
  totalSessions: number; // 총 조회 세션 수
  totalChecks: number; // 모든 세션의 총 체크 횟수 합
  avgChecksPerSession: number; // 세션당 평균 체크 횟수
  foundSeatsCount: number; // 좌석을 발견한 세션 수
  foundSeatsRate: number; // 좌석 발견률
  avgDurationSeconds: number; // 평균 조회 소요 시간 (초)
}
