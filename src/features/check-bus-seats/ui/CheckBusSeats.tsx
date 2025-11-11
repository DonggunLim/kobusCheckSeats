"use client";

import { useCheckSeats } from "../model/useCheckSeats";
import { useSearchForm } from "../model/useSearchForm";
import { TerminalSelect, TIME_OPTIONS } from "@/entities/bus-route";
import { getTodayDate } from "@/shared/lib/date";

export function CheckBusSeats() {
  const {
    isChecking: isSearching,
    activeSession,
    startSession,
    stopSession,
  } = useCheckSeats();
  const { formData, updateField, toggleTime, handleSubmit } = useSearchForm({
    onSearch: startSession,
  });
  const { departure, arrival, date, selectedTimes } = formData;

  // 세션 경과 시간 계산
  const getElapsedTime = () => {
    if (!activeSession) return "";
    const elapsed = Date.now() - new Date(activeSession.startTime).getTime();
    const minutes = Math.floor(elapsed / 1000 / 60);
    return `${minutes}분 경과`;
  };

  return (
    <div>
      {/* 세션 상태 표시 */}
      {activeSession && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                🔄 반복 조회 진행 중
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {activeSession.attemptCount}회 시도 • {getElapsedTime()} •
                GitHub Actions가 5분마다 자동 조회 중입니다
              </p>
            </div>
            <button
              onClick={stopSession}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              중지
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          좌석 검색 조건
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TerminalSelect
              value={departure}
              onChange={(value) => updateField("departure", value)}
              label="출발지"
            />
            <TerminalSelect
              value={arrival}
              onChange={(value) => updateField("arrival", value)}
              label="도착지"
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출발 날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => updateField("date", e.target.value)}
              min={getTodayDate()}
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
                    className={`px-2 py-2 text-sm font-medium rounded-lg border transition-colors shrink-0 ${
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
            disabled={
              isSearching || selectedTimes.length === 0 || !!activeSession
            }
            className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              isSearching || selectedTimes.length === 0 || activeSession
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {activeSession
              ? "조회 진행 중 (중지 후 새로운 조회 가능)"
              : isSearching
              ? "세션 시작 중..."
              : "반복 조회 시작"}
          </button>
        </form>
      </div>
    </div>
  );
}
