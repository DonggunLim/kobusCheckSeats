"use client";

import { JobHistoryItemCard } from './JobHistoryItem';
import { useJobHistory } from '../model/useJobHistory';

interface JobHistoryListProps {
  limit?: number;
  autoRefresh?: boolean;
}

export function JobHistoryList({ limit = 20, autoRefresh = true }: JobHistoryListProps) {
  const { jobs, loading, error } = useJobHistory(limit, autoRefresh);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">조회 히스토리</h2>
          {autoRefresh && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-gray-500">실시간 업데이트</span>
            </div>
          )}
        </div>
      </div>

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
