"use client";

import { CheckBusSeatsFormData } from "../model/types";
import { useCheckSeats } from "../model/useCheckSeats";

interface CheckButtonProps {
  formData: CheckBusSeatsFormData;
  disabled?: boolean;
}

export function CheckButton({ formData, disabled }: CheckButtonProps) {
  const { isChecking, startSession } = useCheckSeats();

  const handleClick = () => {
    startSession(formData);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isChecking}
      className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
        disabled || isChecking
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {isChecking ? "Job 추가 중..." : "좌석 조회 시작"}
    </button>
  );
}
