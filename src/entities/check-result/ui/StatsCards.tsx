"use client";

import { useStats } from "../model/useStats";

/**
 * 통계 데이터를 카드 형태로 표시하는 Entity UI
 * 자체적으로 데이터를 페칭하고 모든 상태를 처리하는 완전한 독립 컴포넌트
 */
export function StatsCards() {
  const { stats, loading, error } = useStats();

  // Error 상태
  if (error) {
    return (
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">통계 로딩 실패: {error}</p>
      </div>
    );
  }

  // Data 상태
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}초`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds.toFixed(0)}초`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">총 조회 세션</div>
        <div className="text-3xl font-bold text-gray-900">
          {stats.totalSessions}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">평균 체크 수</div>
        <div className="text-3xl font-bold text-purple-600">
          {stats.avgChecksPerSession.toFixed(1)}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">좌석 발견률</div>
        <div className="text-3xl font-bold text-blue-600">
          {stats.foundSeatsRate.toFixed(1)}%
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">평균 소요 시간</div>
        <div className="text-2xl font-bold text-green-600">
          {formatDuration(stats.avgDurationSeconds)}
        </div>
      </div>
    </div>
  );
}
