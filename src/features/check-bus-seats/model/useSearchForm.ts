import { useState, useEffect } from "react";
import { getDefaultDate, parseDateToMonthDay } from "@/shared/lib/date";
import { saveToStorage, loadFromStorage } from "@/shared/lib/storage";
import type { RouteQuery } from "@/entities/bus-route";

interface FormData {
  departure: string;
  arrival: string;
  date: string;
  selectedTimes: string[];
}

interface UseSearchFormParams {
  onSearch: (config: RouteQuery) => void;
}

const DEFAULT_FORM_DATA: FormData = {
  departure: "서울경부",
  arrival: "상주",
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
        departure: saved.departure || DEFAULT_FORM_DATA.departure,
        arrival: saved.arrival || DEFAULT_FORM_DATA.arrival,
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

    if (formData.selectedTimes.length === 0) {
      alert("최소 1개 이상의 시간대를 선택해주세요.");
      return;
    }

    const { month, date: day } = parseDateToMonthDay(formData.date);
    const config: RouteQuery = {
      departure: formData.departure,
      arrival: formData.arrival,
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
    toggleTime,
    handleSubmit,
  };
}
