/**
 * 버스 좌석 확인 관련 타입 정의
 */

// 노선 조회 설정
export interface RouteQuery {
  departure: string; // 출발지
  arrival: string; // 도착지
  targetMonth: string; // 목표 월 (예: "11월")
  targetDate: string; // 목표 일자 (예: "15")
  targetTimes: string[]; // 확인할 시간대 목록 (예: ["08:00", "09:30"])
}

// 특정 시간대 버스 좌석 정보
export interface RouteScheduleSlot {
  time: string; // 시간 (예: "08:00")
  remainSeats: string; // 남은 좌석 (예: "10 석")
  status: string; // 상태 (예: "예매가능", "매진")
  hasSeats: boolean; // 좌석 여부
}

// 좌석 확인 결과
export interface CheckResult {
  timestamp: string; // 확인 시각 (ISO 8601)
  config: RouteQuery; // 조회 설정
  results: RouteScheduleSlot[]; // 각 시간대별 결과
  foundSeats: boolean; // 좌석 발견 여부
  success: boolean; // 조회 성공 여부
  error?: string; // 에러 메시지 (실패 시)
  totalCheckCount: number; // 확인한 시간대 수
  firstFoundTime: string | null; // 최초 좌석 발견 시간
  durationMs: number; // 소요 시간 (밀리초)
}
