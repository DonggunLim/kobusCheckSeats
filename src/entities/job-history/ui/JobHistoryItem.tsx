"use client";

import { useState } from "react";
import axios from "axios";
import type { JobHistoryItem } from "../model/types";

interface JobHistoryItemCardProps {
  job: JobHistoryItem;
  onJobCancelled?: () => void;
}

const STATUS_CONFIG = {
  waiting: {
    bg: "bg-beige-light",
    text: "text-text-primary",
    label: "대기",
  },
  active: {
    bg: "bg-green-primary",
    text: "text-white",
    label: "진행중",
  },
  completed: {
    bg: "bg-green-dark",
    text: "text-white",
    label: "완료",
  },
  failed: {
    bg: "bg-red-accent",
    text: "text-white",
    label: "실패",
  },
  cancelled: {
    bg: "bg-orange-accent",
    text: "text-white",
    label: "취소",
  },
};

export function JobHistoryItemCard({
  job,
  onJobCancelled,
}: JobHistoryItemCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const status = STATUS_CONFIG[job.status];

  const canCancel = job.status === "waiting" || job.status === "active";

  const handleCancel = async () => {
    if (!confirm("정말 이 작업을 취소하시겠습니까?")) {
      return;
    }

    setIsCancelling(true);
    try {
      await axios.delete(`/api/queue/job`, {
        params: { jobId: job.jobId },
      });
      onJobCancelled?.();
    } catch (error) {
      console.error("Job cancellation failed:", error);
      alert("작업 취소에 실패했습니다.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <li className="p-5 shadow-sm">
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
            <span>등록: {job.createdAt.split("T")[0]}</span>
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

        {/* 상태 및 취소 버튼 */}
        <div className="flex flex-col items-end gap-8">
          {/* 상태 뱃지 */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
          >
            {status.label}
          </span>

          {/* 취소 버튼 (waiting, active 상태일 때만 표시) */}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="text-xs text-red-accent hover:text-red-accent/80 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isCancelling ? "취소 중..." : "취소하기"}
            </button>
          )}
        </div>
      </div>

      {/* 에러 메시지 (실패시에만) */}
      {job.status === "failed" && job.error && (
        <div className="mt-2 text-xs truncate text-red-accent">{job.error}</div>
      )}
    </li>
  );
}
