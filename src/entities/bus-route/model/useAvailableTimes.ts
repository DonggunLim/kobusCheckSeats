'use client';

import { useState, useEffect } from 'react';

interface UseAvailableTimesParams {
  departure: string;
  arrival: string;
  enabled?: boolean;
}

export function useAvailableTimes({ departure, arrival, enabled = true }: UseAvailableTimesParams) {
  const [times, setTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !departure || !arrival) {
      setTimes([]);
      return;
    }

    async function fetchTimes() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/schedules/times?departure=${departure}&arrival=${arrival}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch available times');
        }

        const data = await response.json();
        setTimes(data.times || []);
      } catch (err) {
        console.error('Error fetching available times:', err);
        setError(err instanceof Error ? err.message : '시간대 조회 실패');
        setTimes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTimes();
  }, [departure, arrival, enabled]);

  return { times, loading, error };
}
