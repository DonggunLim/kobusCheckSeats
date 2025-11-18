"use client";

import { RouteSelector, TimeSelector } from "@/entities/bus-route";
import { CheckButton } from "@/features/check-bus-seats";
import { getTodayDate } from "@/shared/lib/date";
import { useSearchPanel } from "../model/useSearchPanel";

export function SearchPanel() {
  const { formData, handleRouteChange, handleTimesChange, handleDateChange } =
    useSearchPanel();

  return (
    <div className="rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-5 text-text-primary">
        좌석 검색 조건
      </h2>
      <div className="space-y-5">
        {/* 노선 선택 */}
        <RouteSelector onRouteChange={handleRouteChange} />

        {/* 날짜 */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            출발 날짜
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleDateChange(e.target.value)}
            min={getTodayDate()}
            className="w-full rounded-lg border border-beige-light  px-3 py-2.5 text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-green-primary"
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
