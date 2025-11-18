import type { JobHistoryItem } from '../model/types';

interface JobHistoryItemProps {
  job: JobHistoryItem;
}

export function JobHistoryItemCard({ job }: JobHistoryItemProps) {
  const statusConfig = {
    waiting: { bg: 'bg-gray-100', text: 'text-gray-700', label: '대기' },
    active: { bg: 'bg-blue-100', text: 'text-blue-700', label: '진행중' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: '완료' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: '실패' },
    delayed: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '지연' },
  };

  const status = statusConfig[job.status];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* 노선 정보 */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg text-gray-900 mb-1">
            {job.deprCd} → {job.arvlCd}
          </div>
          <div className="text-sm text-gray-700 mb-2">
            <span className="font-medium">예약 희망:</span> {job.targetMonth} {job.targetDate}일 ({job.targetTimes.join(', ')})
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>등록: {formatDate(job.createdAt)}</span>
            {job.retryCount > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-blue-600 font-medium">
                  {job.retryCount}회 조회
                </span>
              </>
            )}
          </div>
        </div>

        {/* 상태 */}
        <div className={`px-3 py-1.5 rounded-lg ${status.bg} ${status.text} font-medium text-sm whitespace-nowrap`}>
          {status.label}
        </div>
      </div>

      {/* 에러 메시지 (실패시에만) */}
      {job.status === 'failed' && job.error && (
        <div className="mt-2 text-xs text-red-600 truncate">
          {job.error}
        </div>
      )}
    </div>
  );
}
