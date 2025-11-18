"use client";

import { useCallback } from "react";

/**
 * 시간 선택 관련 비즈니스 로직을 처리하는 hook
 */
export function useTimeSelector() {
  /**
   * 특정 시간을 토글 (선택/해제)
   */
  const toggleTime = useCallback(
    (currentTimes: string[], time: string): string[] => {
      return currentTimes.includes(time)
        ? currentTimes.filter((t) => t !== time)
        : [...currentTimes, time];
    },
    []
  );

  return {
    toggleTime,
  };
}
