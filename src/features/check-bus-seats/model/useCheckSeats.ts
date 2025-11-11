import { useState, useCallback, useEffect } from "react";
import type { RouteQuery } from "@/entities/bus-route";
import { busCheckEvents } from "@/shared/lib/events";
import { CheckResult } from "@/entities/check-result";
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
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  // 활성 세션 폴링
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.get("/api/session");
        setActiveSession(data.active ? data.session : null);
      } catch (err) {
        console.error("Failed to check session:", err);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 10000); // 10초마다 체크

    return () => clearInterval(interval);
  }, []);

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
      setResult(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "세션 종료 실패";
      setError(errorMessage);
      console.error("세션 종료 실패:", err);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isChecking,
    result,
    error,
    activeSession,
    startSession,
    stopSession,
    reset,
  };
}
