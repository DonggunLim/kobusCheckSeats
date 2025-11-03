import type { CheckResult } from "../model/types";
import { RouteScheduleCard } from "@/entities/bus-route";
import { StatusBadge } from "@/shared/ui";

interface CheckResultCardProps {
  result: CheckResult;
  showTimestamp?: boolean;
  title?: string;
}

/**
 * CheckResult를 표시하는 통합 카드 컴포넌트
 * Entity UI - CheckResult 도메인 객체를 표현
 */
export function CheckResultCard({
  result,
  showTimestamp = false,
  title,
}: CheckResultCardProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ko-KR");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* 헤더 영역 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {showTimestamp && (
            <div
              className={`w-3 h-3 rounded-full ${
                result.foundSeats
                  ? "bg-green-500"
                  : result.success
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
          )}
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {title}
              </h2>
            )}
            <div
              className={`${
                title ? "text-gray-700" : "font-semibold text-gray-900"
              }`}
            >
              {result.config.departure} → {result.config.arrival}
            </div>
            {showTimestamp && (
              <div className="text-sm text-gray-500">
                {formatDate(result.timestamp)}
              </div>
            )}
          </div>
        </div>
        <StatusBadge foundSeats={result.foundSeats} success={result.success} />
      </div>

      {/* 결과 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {result.results.map((timeResult, idx) => (
          <RouteScheduleCard key={idx} result={timeResult} />
        ))}
      </div>

      {/* 에러 메시지 */}
      {result.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">오류: {result.error}</div>
        </div>
      )}
    </div>
  );
}
