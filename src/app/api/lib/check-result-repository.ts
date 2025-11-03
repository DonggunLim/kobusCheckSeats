import { promises as fs } from "fs";
import path from "path";
import type { CheckResult } from "@/entities/check-result";

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

/**
 * 데이터 디렉토리가 존재하는지 확인하고 없으면 생성합니다.
 */
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * 히스토리 파일을 읽어옵니다.
 */
export async function readHistory(): Promise<CheckResult[]> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // 파일이 없으면 빈 배열 반환
    return [];
  }
}

/**
 * 새로운 체크 결과를 히스토리에 추가합니다.
 */
export async function saveCheckResult(result: CheckResult): Promise<void> {
  await ensureDataDir();

  const history = await readHistory();
  history.unshift(result); // 최신 결과를 맨 앞에 추가

  // 최대 1000개까지만 보관 (오래된 것 삭제)
  if (history.length > 1000) {
    history.splice(1000);
  }

  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
}

/**
 * 최근 N개의 히스토리를 가져옵니다.
 */
export async function getRecentHistory(
  limit: number = 50
): Promise<CheckResult[]> {
  const history = await readHistory();
  return history.slice(0, limit);
}

/**
 * 좌석이 있었던 결과만 필터링합니다.
 */
export async function getFoundSeatsHistory(): Promise<CheckResult[]> {
  const history = await readHistory();
  return history.filter((item) => item.foundSeats);
}

/**
 * 특정 날짜 범위의 히스토리를 가져옵니다.
 */
export async function getHistoryByDateRange(
  startDate: string,
  endDate: string
): Promise<CheckResult[]> {
  const history = await readHistory();
  return history.filter((item) => {
    const itemDate = new Date(item.timestamp);
    return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
  });
}

/**
 * 통계 데이터를 생성합니다.
 */
export async function getStatistics() {
  const history = await readHistory();
  console.log(history);
  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalChecks: 0,
      avgChecksPerSession: 0,
      foundSeatsCount: 0,
      foundSeatsRate: 0,
      avgDurationSeconds: 0,
    };
  }

  // 총 세션 수
  const totalSessions = history.length;

  // 모든 세션의 총 체크 횟수 합
  const totalChecks = history.reduce(
    (sum, item) => sum + item.totalCheckCount,
    0
  );

  // 세션당 평균 체크 횟수
  const avgChecksPerSession = totalChecks / totalSessions;

  // 좌석을 발견한 세션 수
  const foundSeatsCount = history.filter((item) => item.foundSeats).length;

  // 모든 세션의 총 소요 시간 합 (밀리초)
  const totalDurationMs = history.reduce(
    (sum, item) => sum + item.durationMs,
    0
  );

  // 평균 소요 시간 (초)
  const avgDurationSeconds = totalDurationMs / totalSessions / 1000;

  return {
    totalSessions,
    totalChecks,
    avgChecksPerSession,
    foundSeatsCount,
    foundSeatsRate: (foundSeatsCount / totalSessions) * 100,
    avgDurationSeconds,
  };
}
