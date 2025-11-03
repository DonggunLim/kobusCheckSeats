"use client";

import { CheckResultHistoryItem } from "./CheckResultHistoryItem";
import { useHistory } from "../model/useHistory";

interface CheckResultHistoryListProps {
  limit?: number;
}

export function CheckResultHistoryList({
  limit = 10,
}: CheckResultHistoryListProps) {
  const { history, loading, error } = useHistory(limit);
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">최근 확인 기록</h2>
      </div>

      {/* Loading 상태 */}
      {loading && (
        <div className="p-8 text-center text-gray-500">로딩 중...</div>
      )}

      {/* Error 상태 */}
      {error && !loading && (
        <div className="p-6">
          <p className="text-red-800">히스토리 로딩 실패: {error}</p>
        </div>
      )}

      {/* Data 상태 */}
      {!loading && !error && (
        <div className="divide-y divide-gray-200">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              아직 확인 기록이 없습니다.
            </div>
          ) : (
            history.map((item, index) => (
              <CheckResultHistoryItem key={index} history={item} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
