import type { JobHistoryItem } from "../model/types";

interface JobHistoryItemCardProps {
  job: JobHistoryItem;
}

export function JobHistoryItemCard({ job }: JobHistoryItemCardProps) {
  const statusConfig = {
    waiting: {
      bg: "var(--beige-light)",
      text: "var(--text-primary)",
      label: "대기",
    },
    active: {
      bg: "var(--green-primary)",
      text: "white",
      label: "진행중",
    },
    completed: {
      bg: "var(--green-dark)",
      text: "white",
      label: "완료",
    },
    failed: {
      bg: "var(--red-accent)",
      text: "white",
      label: "실패",
    },
    delayed: {
      bg: "var(--orange-accent)",
      text: "white",
      label: "지연",
    },
  };

  const status = statusConfig[job.status];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  return (
    <li className="p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        {/* 노선 정보 */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg mb-1 text-green-primary">
            {job.departure} → {job.arrival}
          </div>
          <div
            className="text-sm mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="font-medium">예약 희망:</span> {job.targetMonth}{" "}
            {job.targetDate}일 ({job.targetTimes.join(", ")})
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 text-xs">
            <span>등록: {formatDate(job.createdAt)}</span>
            {job.retryCount > 0 && (
              <>
                <span>·</span>
                <span className="font-medium text-orange-accent ">
                  {job.retryCount}회 조회
                </span>
              </>
            )}
          </div>
        </div>

        {/* 상태 */}
        <div
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${status.bg} ${status.text}`}
        >
          {status.label}
        </div>
      </div>

      {/* 에러 메시지 (실패시에만) */}
      {job.status === "failed" && job.error && (
        <div className="mt-2 text-xs truncate text-red-accent">{job.error}</div>
      )}
    </li>
  );
}
