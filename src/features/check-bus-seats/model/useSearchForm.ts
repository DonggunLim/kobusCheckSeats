import { useState, useEffect } from "react";
import { getDefaultDate, parseDateToMonthDay } from "@/shared/lib/date";
import { saveToStorage, loadFromStorage } from "@/shared/lib/storage";
import type { RouteQuery } from "@/entities/bus-route";

interface FormData {
  departureAreaCd: string;
  departureTerminalCd: string;
  departureTerminalNm: string;
  arrivalTerminalCd: string;
  arrivalTerminalNm: string;
  date: string;
  selectedTimes: string[];
}

interface UseSearchFormParams {
  onSearch: (config: RouteQuery) => void;
}

const DEFAULT_FORM_DATA: FormData = {
  departureAreaCd: "",
  departureTerminalCd: "",
  departureTerminalNm: "",
  arrivalTerminalCd: "",
  arrivalTerminalNm: "",
  date: getDefaultDate(),
  selectedTimes: [],
};

export function useSearchForm({ onSearch }: UseSearchFormParams) {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);

  // LocalStorage에서 설정 불러오기 (비즈니스 로직)
  useEffect(() => {
    const saved = loadFromStorage<FormData>("busSearchConfig");
    if (saved) {
      setFormData({
        departureAreaCd: saved.departureAreaCd || DEFAULT_FORM_DATA.departureAreaCd,
        departureTerminalCd: saved.departureTerminalCd || DEFAULT_FORM_DATA.departureTerminalCd,
        departureTerminalNm: saved.departureTerminalNm || DEFAULT_FORM_DATA.departureTerminalNm,
        arrivalTerminalCd: saved.arrivalTerminalCd || DEFAULT_FORM_DATA.arrivalTerminalCd,
        arrivalTerminalNm: saved.arrivalTerminalNm || DEFAULT_FORM_DATA.arrivalTerminalNm,
        date: saved.date || DEFAULT_FORM_DATA.date,
        selectedTimes: saved.selectedTimes || DEFAULT_FORM_DATA.selectedTimes,
      });
    }
  }, []);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateRoute = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const toggleTime = (time: string) => {
    setFormData((prev) => {
      const selectedTimes = prev.selectedTimes;
      if (selectedTimes.includes(time)) {
        return {
          ...prev,
          selectedTimes: selectedTimes.filter((t) => t !== time),
        };
      } else {
        return {
          ...prev,
          selectedTimes: [...selectedTimes, time],
        };
      }
    });
  };

  // 폼 제출 핸들러 (비즈니스 로직)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.departureTerminalNm || !formData.arrivalTerminalNm) {
      alert("출발지와 도착지를 선택해주세요.");
      return;
    }

    if (formData.selectedTimes.length === 0) {
      alert("최소 1개 이상의 시간대를 선택해주세요.");
      return;
    }

    const { month, date: day } = parseDateToMonthDay(formData.date);
    const config: RouteQuery = {
      departure: formData.departureTerminalNm,
      arrival: formData.arrivalTerminalNm,
      targetMonth: month,
      targetDate: day,
      targetTimes: formData.selectedTimes.sort(),
    };
    console.log(config);
    // LocalStorage에 저장 (비즈니스 로직)
    saveToStorage<FormData>("busSearchConfig", formData);

    onSearch(config);
  };

  return {
    formData,
    updateField,
    updateRoute,
    toggleTime,
    handleSubmit,
  };
}
