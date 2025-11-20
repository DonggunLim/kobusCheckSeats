"use client";

import { useEffect, useState } from "react";
import { fetchAvailableTimes } from "../api";

export function useAvailableTimes(
  departureTerminalCd: string,
  arrivalTerminalCd: string,
  selectedDate: string
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

        setAvailableTimes(filterFutureTimes(times, selectedDate));
      } catch (err) {
        console.error("Failed to load available times:", err);
        setError(err instanceof Error ? err.message : "시간대 조회 실패");
        setAvailableTimes([]);
      } finally {
        setLoading(false);
      }
    }
    loadAvailableTimes();
  }, [departureTerminalCd, arrivalTerminalCd, selectedDate]);

  return {
    availableTimes,
    loading,
    error,
  };
}

function filterFutureTimes(times: string[], selectedDate: string): string[] {
  // 선택한 날짜가 오늘인지 확인
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식

  // 선택한 날짜가 오늘이 아니면 모든 시간 반환
  if (selectedDate !== todayString) {
    return times;
  }

  // 오늘이면 현재 시간 이후의 시간들만 필터링
  const currentTime = new Date();
  return times.filter((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
    return timeDate > currentTime;
  });
}
