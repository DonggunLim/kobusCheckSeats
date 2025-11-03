import { useState, useEffect, useCallback } from "react";
import type { Stats } from "./types";
import { getCheckResultStats } from "../api/stats";
import { busCheckEvents } from "@/shared/lib/events";

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCheckResultStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "통계 조회 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 비즈니스 로직: 좌석 체크 완료 시 자동 새로고침
  useEffect(() => {
    return busCheckEvents.onCheckComplete(() => {
      fetchStats();
    });
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
