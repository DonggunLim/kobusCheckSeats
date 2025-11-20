"use client";

import { useAvailableTimes } from "../model/useAvailableTimes";
import { useTimeSelector } from "../model/useTimeSelector";

interface TimeSelectorProps {
  departureTerminalCd: string;
  arrivalTerminalCd: string;
  selectedDate: string;
  selectedTimes: string[];
  onTimesChange: (times: string[]) => void;
}

export function TimeSelector({
  departureTerminalCd,
  arrivalTerminalCd,
  selectedDate,
  selectedTimes,
  onTimesChange,
}: TimeSelectorProps) {
  const { toggleTime } = useTimeSelector();
  const { availableTimes, loading, error } = useAvailableTimes(
    departureTerminalCd,
    arrivalTerminalCd,
    selectedDate
  );

  const hasRoute = !!(departureTerminalCd && arrivalTerminalCd);

  // 이벤트 핸들러
  const handleToggle = (time: string) => {
    onTimesChange(toggleTime(selectedTimes, time));
  };
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        확인할 시간대 ({selectedTimes.length}개 선택됨)
      </label>

      {/* 노선 선택 전 안내 메시지 */}
      {!hasRoute ? (
        <p className="text-sm text-text-secondary py-8 text-center">
          출발지와 도착지를 먼저 선택해주세요
        </p>
      ) : loading ? (
        <p className="text-sm text-text-secondary py-8 text-center">
          운행 시간 조회 중...
        </p>
      ) : error ? (
        <p className="text-sm text-red-accent py-8 text-center">{error}</p>
      ) : availableTimes.length === 0 ? (
        <p className="text-sm text-red-accent py-8 text-center">
          해당 노선의 운행 정보가 없습니다
        </p>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
            {availableTimes.map((time: string) => {
              const isSelected = selectedTimes.includes(time);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleToggle(time)}
                  className={`shrink-0 rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-green-dark bg-green-primary text-white hover:bg-green-dark"
                      : "border-beige-light bg-cream-bg text-text-primary hover:bg-beige-light"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          {hasRoute && selectedTimes.length === 0 && (
            <p className="mt-2 text-sm text-red-accent">
              최소 1개 이상의 시간대를 선택해주세요.
            </p>
          )}
        </>
      )}
    </div>
  );
}
