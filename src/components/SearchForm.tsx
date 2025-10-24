"use client";

import { useState, useEffect } from "react";
import { TERMINALS, TIME_OPTIONS } from "@/lib/constants";
import type { BusCheckConfig } from "@/lib/types";

interface SearchFormProps {
  onSearch: (config: BusCheckConfig) => void;
  isSearching: boolean;
}

export default function SearchForm({ onSearch, isSearching }: SearchFormProps) {
  // 현재 날짜 기준으로 초기값 설정 (내일)
  const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [departure, setDeparture] = useState("서울경부");
  const [arrival, setArrival] = useState("상주");
  const [date, setDate] = useState(getDefaultDate());
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["18:00", "19:00"]);

  // LocalStorage에서 설정 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("busSearchConfig");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setDeparture(config.departure || "서울경부");
        setArrival(config.arrival || "상주");
        setDate(config.date || getDefaultDate());
        setSelectedTimes(config.targetTimes || ["18:00", "19:00"]);
      } catch (error) {
        console.error("Failed to load saved config:", error);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTimes.length === 0) {
      alert("최소 1개 이상의 시간대를 선택해주세요.");
      return;
    }

    const selectedDate = new Date(date);
    const config: BusCheckConfig = {
      departure,
      arrival,
      targetMonth: String(selectedDate.getMonth() + 1),
      targetDate: String(selectedDate.getDate()),
      targetTimes: selectedTimes.sort(),
    };

    // LocalStorage에 저장
    localStorage.setItem(
      "busSearchConfig",
      JSON.stringify({
        departure,
        arrival,
        date,
        targetTimes: selectedTimes,
      })
    );

    onSearch(config);
  };

  const toggleTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        좌석 검색 조건
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 출발지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출발지
            </label>
            <select
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {TERMINALS.map((terminal) => (
                <option key={terminal.value} value={terminal.value}>
                  {terminal.label} ({terminal.region})
                </option>
              ))}
            </select>
          </div>

          {/* 도착지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도착지
            </label>
            <select
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {TERMINALS.map((terminal) => (
                <option key={terminal.value} value={terminal.value}>
                  {terminal.label} ({terminal.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            출발 날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 시간 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            확인할 시간대 ({selectedTimes.length}개 선택됨)
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
            {TIME_OPTIONS.map((time) => {
              const isSelected = selectedTimes.includes(time);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleTime(time)}
                  className={`px-2 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          {selectedTimes.length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              최소 1개 이상의 시간대를 선택해주세요.
            </p>
          )}
        </div>

        {/* 검색 버튼 */}
        <button
          type="submit"
          disabled={isSearching || selectedTimes.length === 0}
          className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isSearching || selectedTimes.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSearching ? "좌석 확인 중..." : "좌석 확인하기"}
        </button>
      </form>
    </div>
  );
}
