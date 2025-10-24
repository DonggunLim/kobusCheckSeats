import { promises as fs } from "fs";
import path from "path";
import type { CheckResult } from "./types";

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
export async function getRecentHistory(limit: number = 50): Promise<CheckResult[]> {
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

  if (history.length === 0) {
    return {
      totalChecks: 0,
      successfulChecks: 0,
      foundSeatsCount: 0,
      failedChecks: 0,
      successRate: 0,
      foundSeatsRate: 0,
    };
  }

  const successfulChecks = history.filter((item) => item.success).length;
  const foundSeatsCount = history.filter((item) => item.foundSeats).length;
  const failedChecks = history.filter((item) => !item.success).length;

  return {
    totalChecks: history.length,
    successfulChecks,
    foundSeatsCount,
    failedChecks,
    successRate: (successfulChecks / history.length) * 100,
    foundSeatsRate: (foundSeatsCount / history.length) * 100,
  };
}
