"use client";

import { RouteSelector, TimeSelector } from "@/entities/bus-route";
import { CheckButton } from "@/features/check-bus-seats";
import { getTodayDate } from "@/shared/lib/date";
import { useSearchPanel } from "../model/useSearchPanel";

export function SearchPanel() {
  const { formData, handleRouteChange, handleTimesChange, handleDateChange } =
    useSearchPanel();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        좌석 검색 조건
      </h2>
      <div className="space-y-4">
        {/* 노선 선택 */}
        <RouteSelector onRouteChange={handleRouteChange} />

        {/* 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            출발 날짜
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleDateChange(e.target.value)}
            min={getTodayDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 시간 선택 */}
        <TimeSelector
          departureTerminalCd={formData.departureTerminalCd}
          arrivalTerminalCd={formData.arrivalTerminalCd}
          selectedTimes={formData.selectedTimes}
          onTimesChange={handleTimesChange}
        />

        {/* 조회 시작 버튼 */}
        <CheckButton formData={formData} />
      </div>
    </div>
  );
}
