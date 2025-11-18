"use client";

import { useState, useEffect, useCallback } from "react";
import type { JobHistoryItem } from "./types";
import { fetchJobHistory } from "../api";

export function useJobHistory(limit: number = 20) {
  const [jobs, setJobs] = useState<JobHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobHistory(limit);
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "히스토리 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 폴링으로 주기적 업데이트 (10초로 단축)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchJobs();
    }, 10000); // 10초

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
  };
}
