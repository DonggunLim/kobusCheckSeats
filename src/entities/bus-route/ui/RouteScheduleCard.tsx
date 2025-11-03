import type { RouteScheduleSlot } from "../model/types";

interface RouteScheduleCardProps {
  result: RouteScheduleSlot;
}

export function RouteScheduleCard({ result }: RouteScheduleCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        result.hasSeats
          ? "border-green-300 bg-green-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-900">{result.time}</span>
        <span
          className={`text-sm ${
            result.hasSeats ? "text-green-700 font-semibold" : "text-gray-600"
          }`}
        >
          {result.remainSeats}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">{result.status}</div>
    </div>
  );
}
