'use client';

import { useState, useEffect, useCallback } from 'react';
import type { JobHistoryItem } from './types';

export function useJobHistory(limit: number = 20, autoRefresh: boolean = true) {
  const [jobs, setJobs] = useState<JobHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/history?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job history');
      }
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '히스토리 조회 실패');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // 초기 로드
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 폴링으로 주기적 업데이트 (3초마다)
  useEffect(() => {
    if (!autoRefresh) {
      console.log('[Polling] Auto-refresh is disabled');
      return;
    }

    console.log('[Polling] Starting polling every 3 seconds');

    const intervalId = setInterval(() => {
      console.log('[Polling] Fetching latest job updates...');
      fetchJobs();
    }, 3000); // 3초마다 폴링

    return () => {
      console.log('[Polling] Stopping polling');
      clearInterval(intervalId);
    };
  }, [autoRefresh, fetchJobs]);

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
  };
}
