/**
 * Bus Route entity types
 * 버스 노선 관련 타입 정의
 */

/**
 * 지역 정보 (DB area_codes)
 */
export interface Area {
  areaCd: string;
  areaNm: string;
}

/**
 * 터미널 정보 (DB terminals)
 */
export interface TerminalData {
  terminalCd: string;
  terminalNm: string;
  areaCd: string | null;
}

/**
 * 터미널 정보 (Legacy - 호환성 유지)
 * @deprecated Use TerminalData instead
 */
export interface Terminal {
  value: string;
  label: string;
  region: string;
}

/**
 * 노선 스케줄 슬롯 (시간대별 좌석 정보)
 */
export interface RouteScheduleSlot {
  time: string;
  remainSeats: string;
  status: string;
  hasSeats: boolean;
}

/**
 * 노선 조회 요청
 */
export interface RouteQuery {
  departure: string;
  arrival: string;
  targetMonth: string;
  targetDate: string;
  targetTimes: string[];
}
