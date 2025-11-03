import { useState, useEffect, useCallback } from "react";
import type { CheckResult } from "./types";
import { getHistoryAPI } from "../api/history";
import { busCheckEvents } from "@/shared/lib/events";

export function useHistory(limit: number = 10) {
  const [history, setHistory] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoryAPI(limit);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "히스토리 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // 초기 로드
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 비즈니스 로직: 좌석 체크 완료 시 자동 새로고침
  useEffect(() => {
    return busCheckEvents.onCheckComplete(() => {
      fetchHistory();
    });
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
}
