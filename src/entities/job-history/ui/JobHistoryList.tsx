"use client";

import { JobHistoryItemCard } from "./JobHistoryItem";
import { useJobHistory } from "../model/useJobHistory";

interface JobHistoryListProps {
  limit?: number;
}

export function JobHistoryList({ limit = 20 }: JobHistoryListProps) {
  const { jobs, loading, error } = useJobHistory(limit);

  return (
    <div className="bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900">조회 히스토리</h2>

      {/* Loading 상태 */}
      {loading && jobs.length === 0 && (
        <div className="p-8 text-center text-gray-500">로딩 중...</div>
      )}

      {/* Error 상태 */}
      {error && !loading && (
        <div className="p-6">
          <p className="text-red-800">히스토리 로딩 실패: {error}</p>
        </div>
      )}

      {/* Data 상태 */}
      {!loading && !error && jobs.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          아직 조회 기록이 없습니다.
        </div>
      )}

      {jobs.length > 0 && (
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {jobs.map((job) => (
            <JobHistoryItemCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
