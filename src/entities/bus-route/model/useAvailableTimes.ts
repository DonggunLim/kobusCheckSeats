"use client";

import { useEffect, useState } from "react";
import { fetchAvailableTimes } from "../api";

export function useAvailableTimes(
  departureTerminalCd: string,
  arrivalTerminalCd: string
) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departureTerminalCd || !arrivalTerminalCd) {
      setAvailableTimes([]);
      return;
    }

    async function loadAvailableTimes() {
      setLoading(true);
      setError(null);
      try {
        const times = await fetchAvailableTimes(
          departureTerminalCd,
          arrivalTerminalCd
        );

        // 현재 시간 이후의 시간들만 필터링
        setAvailableTimes(filterFutureTimes(times));
      } catch (err) {
        console.error("Failed to load available times:", err);
        setError(err instanceof Error ? err.message : "시간대 조회 실패");
        setAvailableTimes([]);
      } finally {
        setLoading(false);
      }
    }
    loadAvailableTimes();
  }, [departureTerminalCd, arrivalTerminalCd]);

  return {
    availableTimes,
    loading,
    error,
  };
}

function filterFutureTimes(times: string[]): string[] {
  const currentTime = new Date();
  return times.filter((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
    return timeDate > currentTime;
  });
}
