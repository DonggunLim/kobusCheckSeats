import type { Stats } from "@/lib/types";

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">총 체크 횟수</div>
        <div className="text-3xl font-bold text-gray-900">
          {stats.totalChecks}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">성공률</div>
        <div className="text-3xl font-bold text-green-600">
          {stats.successRate.toFixed(1)}%
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">좌석 발견</div>
        <div className="text-3xl font-bold text-blue-600">
          {stats.foundSeatsCount}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">발견률</div>
        <div className="text-3xl font-bold text-purple-600">
          {stats.foundSeatsRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
