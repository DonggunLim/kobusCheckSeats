import { useState, useEffect, useCallback } from "react";
import type { Stats } from "./types";
import { getCheckResultStats } from "../api/stats";
import { busCheckEvents } from "@/shared/lib/events";

const DEFAULT_STATS: Stats = {
  totalSessions: 0,
  totalChecks: 0,
  avgChecksPerSession: 0,
  foundSeatsCount: 0,
  foundSeatsRate: 0,
  avgDurationSeconds: 0,
};

export function useStats() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCheckResultStats();
      // 데이터 유효성 검증
      if (data && typeof data === 'object' && 'totalSessions' in data) {
        setStats(data);
      } else {
        setError("잘못된 응답 형식");
        setStats(DEFAULT_STATS);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "통계 조회 실패");
      setStats(DEFAULT_STATS);
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
