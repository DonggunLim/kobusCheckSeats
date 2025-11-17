import type { JobHistoryItem } from '../model/types';

interface JobHistoryItemProps {
  job: JobHistoryItem;
}

export function JobHistoryItemCard({ job }: JobHistoryItemProps) {
  const statusColors = {
    waiting: 'bg-gray-100 text-gray-700',
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    delayed: 'bg-yellow-100 text-yellow-700',
  };

  const statusLabels = {
    waiting: '대기중',
    active: '진행중',
    completed: '완료',
    failed: '실패',
    delayed: '지연',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-200">
      <div className="flex items-start justify-between gap-4">
        {/* 왼쪽: 노선 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {job.deprCd} → {job.arvlCd}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[job.status]
              }`}
            >
              {statusLabels[job.status]}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">날짜:</span> {job.targetDate}
            </p>
            <p>
              <span className="font-medium">시간:</span>{' '}
              {job.targetTimes.join(', ')}
            </p>
            <p className="text-xs text-gray-500">
              추가: {formatDate(job.createdAt)}
            </p>
          </div>
        </div>

        {/* 오른쪽: 재시도 상태 */}
        <div className="flex flex-col items-end gap-2">
          {job.retryCount > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600">
                {job.retryCount}회 조회
              </div>
            </div>
          )}

          {job.status === 'completed' && job.completedAt && (
            <div className="text-xs text-gray-500">
              완료: {formatDate(job.completedAt)}
            </div>
          )}

          {job.status === 'failed' && job.error && (
            <div className="text-xs text-red-600 max-w-xs truncate">
              {job.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
