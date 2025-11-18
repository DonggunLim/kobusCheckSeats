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
