import { promises as fs } from "fs";
import path from "path";
import type { RouteQuery } from "@/entities/bus-route";

const DATA_DIR = path.join(process.cwd(), "data");
const SESSION_FILE = path.join(DATA_DIR, "session.json");

/**
 * 세션 정보
 */
export interface Session {
  sessionId: string;
  startTime: string; // ISO 8601 timestamp
  attemptCount: number; // 시도 횟수
  config: RouteQuery;
  isActive: boolean;
}

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
 * 현재 활성 세션을 가져옵니다.
 */
export async function getActiveSession(): Promise<Session | null> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(SESSION_FILE, "utf-8");
    const session: Session = JSON.parse(data);
    return session.isActive ? session : null;
  } catch {
    return null;
  }
}

/**
 * 새로운 세션을 시작합니다.
 */
export async function startSession(config: RouteQuery): Promise<Session> {
  await ensureDataDir();

  const session: Session = {
    sessionId: `session-${Date.now()}`,
    startTime: new Date().toISOString(),
    attemptCount: 0,
    config,
    isActive: true,
  };

  await fs.writeFile(SESSION_FILE, JSON.stringify(session, null, 2), "utf-8");
  return session;
}

/**
 * 세션의 시도 횟수를 증가시킵니다.
 */
export async function incrementAttempt(sessionId: string): Promise<void> {
  const session = await getActiveSession();

  if (!session || session.sessionId !== sessionId) {
    throw new Error("Session not found or inactive");
  }

  session.attemptCount += 1;

  await fs.writeFile(SESSION_FILE, JSON.stringify(session, null, 2), "utf-8");
}

/**
 * 세션을 종료합니다.
 */
export async function endSession(): Promise<void> {
  await ensureDataDir();

  try {
    await fs.unlink(SESSION_FILE);
  } catch {
    // 파일이 없으면 무시
  }
}

/**
 * 세션이 시작된 이후 경과 시간을 밀리초로 반환합니다.
 */
export function getSessionDuration(startTime: string): number {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  return now - start;
}
