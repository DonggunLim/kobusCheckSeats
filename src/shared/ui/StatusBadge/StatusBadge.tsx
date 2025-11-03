interface StatusBadgeProps {
  foundSeats: boolean;
  success: boolean;
}

export function StatusBadge({ foundSeats, success }: StatusBadgeProps) {
  const getStyles = () => {
    if (foundSeats) {
      return "bg-green-100 text-green-800";
    }
    if (success) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-red-100 text-red-800";
  };

  const getLabel = () => {
    if (foundSeats) return "좌석 발견";
    if (success) return "빈 좌석 없음";
    return "실패";
  };

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStyles()}`}>
      {getLabel()}
    </div>
  );
}
