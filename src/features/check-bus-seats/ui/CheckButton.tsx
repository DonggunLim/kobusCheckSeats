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
      disabled={
        disabled ||
        isChecking ||
        !formData.departureTerminalCd ||
        !formData.arrivalTerminalCd ||
        !formData.date ||
        formData.selectedTimes.length === 0
      }
      className="w-full rounded-lg px-6 py-3 font-bold transition-colors duration-300 hover:bg-opacity-90 disabled:cursor-not-allowed bg-beige-light text-text-primary"
    >
      {isChecking ? "작업 추가 중..." : "좌석 조회 시작"}
    </button>
  );
}
