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

  // SSE로 실시간 업데이트 수신
  useEffect(() => {
    if (!autoRefresh) return;

    const eventSource = new EventSource('/api/jobs/stream');

    eventSource.onmessage = (event) => {
      try {
        const updatedJob = JSON.parse(event.data) as JobHistoryItem;

        // 기존 잡 목록에서 업데이트된 잡 찾아서 교체
        setJobs((prevJobs) => {
          const existingIndex = prevJobs.findIndex(
            (job) => job.jobId === updatedJob.jobId
          );

          if (existingIndex >= 0) {
            // 기존 잡 업데이트
            const newJobs = [...prevJobs];
            newJobs[existingIndex] = updatedJob;
            return newJobs;
          } else {
            // 새로운 잡 추가 (최상단에)
            return [updatedJob, ...prevJobs].slice(0, limit);
          }
        });
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
      // 연결 끊김 시 폴백: 한 번 다시 fetch
      fetchJobs();
    };

    return () => {
      eventSource.close();
    };
  }, [autoRefresh, limit, fetchJobs]);

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
  };
}
