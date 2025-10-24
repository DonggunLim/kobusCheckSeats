import type { CheckResult } from "@/lib/types";
import BusTimeCard from "./BusTimeCard";

interface HistoryItemProps {
  item: CheckResult;
}

export default function HistoryItem({ item }: HistoryItemProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ko-KR");
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              item.foundSeats
                ? "bg-green-500"
                : item.success
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
          <div>
            <div className="font-semibold text-gray-900">
              {item.config.departure} → {item.config.arrival}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(item.timestamp)}
            </div>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            item.foundSeats
              ? "bg-green-100 text-green-800"
              : item.success
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.foundSeats
            ? "좌석 발견"
            : item.success
            ? "빈 좌석 없음"
            : "실패"}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {item.results.map((result, idx) => (
          <BusTimeCard key={idx} result={result} />
        ))}
      </div>
      {item.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">오류: {item.error}</div>
        </div>
      )}
    </div>
  );
}
