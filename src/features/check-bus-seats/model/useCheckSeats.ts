import { useState, useCallback } from "react";
import type { RouteQuery } from "@/entities/bus-route";
import { removeFromStorage } from "@/shared/lib/storage";
import axios from "axios";

interface Session {
  sessionId: string;
  startTime: string;
  attemptCount: number;
  config: RouteQuery;
  isActive: boolean;
}

export function useCheckSeats() {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const startSession = useCallback(async (config: RouteQuery) => {
    setIsChecking(true);
    setError(null);
    try {
      // BullMQ 큐에 Job 추가
      const { data } = await axios.post("/api/queue/job", config);

      console.log("Job added to queue:", data);
      alert(
        `Job이 큐에 추가되었습니다!\nJob ID: ${data.jobId}\n\nWorker가 처리 중입니다. 로그를 확인하세요.`
      );

      // 조회 완료 후 로컬스토리지 데이터 삭제
      removeFromStorage("busSearchConfig");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Job 추가 실패";
      setError(errorMessage);
      console.error("Job 추가 실패:", err);
      alert(`Job 추가 실패: ${errorMessage}`);
      throw err;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const stopSession = useCallback(async () => {
    try {
      await axios.delete("/api/session");
      setActiveSession(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "세션 종료 실패";
      setError(errorMessage);
      console.error("세션 종료 실패:", err);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    isChecking,
    error,
    activeSession,
    startSession,
    stopSession,
    reset,
  };
}
