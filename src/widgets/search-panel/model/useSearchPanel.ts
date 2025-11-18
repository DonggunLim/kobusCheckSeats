"use client";

import { useState } from "react";
import { getTodayDate } from "@/shared/lib/date";
import { CheckBusSeatsFormData } from "@/features/check-bus-seats/model/types";

export function useSearchPanel() {
  const [formData, setFormData] = useState<CheckBusSeatsFormData>({
    departureTerminalCd: "",
    departureTerminalNm: "",
    arrivalTerminalCd: "",
    arrivalTerminalNm: "",
    date: getTodayDate(),
    selectedTimes: [],
  });

  // 노선 변경 핸들러
  const handleRouteChange = (route: {
    departureTerminalCd: string;
    departureTerminalNm: string;
    arrivalTerminalCd: string;
    arrivalTerminalNm: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...route,
      selectedTimes: [], // 노선 변경시 선택된 시간 초기화
    }));
  };

  // 시간 변경 핸들러
  const handleTimesChange = (times: string[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedTimes: times,
    }));
  };

  // 날짜 변경 핸들러
  const handleDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
  };

  return {
    formData,
    handleRouteChange,
    handleTimesChange,
    handleDateChange,
  };
}
