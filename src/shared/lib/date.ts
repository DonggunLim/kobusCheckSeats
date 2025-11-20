/**
 * Date utility functions
 */

/**
 * Get current time adjusted for KST storage in MySQL
 * MySQL DATETIME stores values without timezone info, so we need to
 * add the timezone offset to store the correct local time
 */
export function getKSTNow(): Date {
  const now = new Date();
  const offset = now.getTimezoneOffset(); // KST = -540 (9 hours ahead of UTC)
  const kstTime = new Date(now.getTime() - offset * 60 * 1000);
  return kstTime;
}

/**
 * Get today's date in ISO format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// ============================================================
// KST (한국 표준시) 기준 날짜 포맷팅 유틸리티
// ============================================================

export interface FormattedDate {
  ymd: string; // YYYYMMDD 형식
  formatted: string; // "YYYY. MM. DD. (요일)" 형식
}

/**
 * Date 객체를 KST 기준으로 포맷팅 (내부 함수)
 */
function formatDateKST(date: Date): FormattedDate {
  // YYYYMMDD 형식
  const ymd = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\. /g, "")
    .replace(".", "");

  // "YYYY. MM. DD. (요일)" 형식
  const formatted = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);

  return { ymd, formatted };
}

/**
 * 오늘 기준 N일 후의 날짜를 KST로 포맷팅
 * @param daysOffset 오늘로부터의 일수 (양수: 미래, 음수: 과거)
 */
export function getTargetKST(daysOffset: number): FormattedDate {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return formatDateKST(date);
}

/**
 * 특정 월/일을 KST로 포맷팅
 * @param targetMonth 월 문자열 (예: "11월")
 * @param targetDate 일 문자열 (예: "18")
 */
export function getTargetDateKST(
  targetMonth: string,
  targetDate: string
): FormattedDate {
  const now = new Date();
  const year = now.getFullYear();
  const month = parseInt(targetMonth.replace("월", ""));
  const day = parseInt(targetDate);

  const targetDateObj = new Date(year, month - 1, day);
  return formatDateKST(targetDateObj);
}
