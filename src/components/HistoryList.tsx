import type { CheckResult } from "@/lib/types";
import HistoryItem from "./HistoryItem";

interface HistoryListProps {
  history: CheckResult[];
}

export default function HistoryList({ history }: HistoryListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">최근 확인 기록</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            아직 확인 기록이 없습니다.
          </div>
        ) : (
          history.map((item, index) => <HistoryItem key={index} item={item} />)
        )}
      </div>
    </div>
  );
}
