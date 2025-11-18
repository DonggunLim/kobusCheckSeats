import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";
import prisma from "../../shared/lib/prisma";
import type {
  RouteQuery,
  RouteScheduleSlot,
  CheckResult,
} from "../../shared/types/bus-check.types";

/**
 * axios + cheerio를 사용하여 코버스 사이트에서 버스 좌석을 확인합니다.
 * (기존 Playwright 방식을 경량화된 HTTP 요청 방식으로 대체)
 */
export async function checkBusSeats(config: RouteQuery): Promise<CheckResult> {
  const { departureCd, arrivalCd, targetMonth, targetDate, targetTimes } = config;
  const startTime = Date.now();

  // axios + cookie jar 설정
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, timeout: 30000 }));

  const results: RouteScheduleSlot[] = [];
  let foundSeats = false;
  let firstFoundTime: string | null = null;

  try {
    // 1. 세션 쿠키 획득
    await client.get("https://www.kobus.co.kr/mrs/rotinf.do", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    });

    // 2. 날짜 포맷팅 (KST 기준)
    const { ymd, formatted } = getTargetDateKST(targetMonth, targetDate);

    // 3. 터미널 이름 조회 (코드 → 이름)
    const terminalNames = await getTerminalNames(departureCd, arrivalCd);

    // 4. alcnSrch.do에 POST 요청
    const pageParams = new URLSearchParams();
    pageParams.append("deprCd", departureCd);
    pageParams.append("deprNm", terminalNames.departureName);
    pageParams.append("arvlCd", arrivalCd);
    pageParams.append("arvlNm", terminalNames.arrivalName);
    pageParams.append("pathDvs", "sngl");
    pageParams.append("pathStep", "1");
    pageParams.append("crchDeprArvlYn", "N");
    pageParams.append("deprDtm", ymd);
    pageParams.append("deprDtmAll", formatted);
    pageParams.append("arvlDtm", ymd);
    pageParams.append("arvlDtmAll", formatted);
    pageParams.append("busClsCd", "0");
    pageParams.append("prmmDcYn", "N");
    pageParams.append("tfrCd", "");
    pageParams.append("tfrNm", "");
    pageParams.append("tfrArvlFullNm", "");
    pageParams.append("abnrData", "");

    const response = await client.post(
      "https://www.kobus.co.kr/mrs/alcnSrch.do",
      pageParams,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
          Referer: "https://www.kobus.co.kr/mrs/rotinf.do",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        },
      }
    );

    // 5. HTML 파싱
    const $ = cheerio.load(response.data);
    const busRows = $('div.bus_time p[role="row"]');

    // 6. 각 시간대별 좌석 정보 추출
    for (const time of targetTimes) {
      let found = false;

      busRows.each((_idx: number, row: cheerio.Element) => {
        const $row = $(row);

        // 시간 추출
        const timeText = $row.find("span.start_time").text().trim();
        const normalizedTime = timeText.replace(/\s+/g, ""); // "12 : 10" → "12:10"

        if (normalizedTime === time) {
          // 잔여 좌석 추출
          const remainSeatsText = $row.find("span.remain").text().trim();

          // 상태 추출
          const statusText = $row.find("span.status").text().trim();

          const hasSeats =
            !statusText.includes("매진") && !remainSeatsText.includes("0 석");

          if (hasSeats) {
            foundSeats = true;
            if (!firstFoundTime) {
              firstFoundTime = time;
            }
          }

          results.push({
            time,
            remainSeats: remainSeatsText,
            status: statusText,
            hasSeats,
          });

          found = true;
        }
      });

      if (!found) {
        results.push({
          time,
          remainSeats: "N/A",
          status: "정보 없음",
          hasSeats: false,
        });
      }
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    return {
      timestamp: new Date().toISOString(),
      config,
      results,
      foundSeats,
      success: true,
      totalCheckCount: targetTimes.length,
      firstFoundTime,
      durationMs,
    };
  } catch (error) {
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `[Worker] ✗ 조회 실패 | ${departureCd} → ${arrivalCd} | ${errorMsg}`
    );

    return {
      timestamp: new Date().toISOString(),
      config,
      results,
      foundSeats: false,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      totalCheckCount: targetTimes.length,
      firstFoundTime: null,
      durationMs,
    };
  }
}

/**
 * KST 기준으로 날짜 포맷팅
 */
function getTargetDateKST(
  targetMonth: string,
  targetDate: string
): { ymd: string; formatted: string } {
  // targetMonth: "11월", targetDate: "18"
  const now = new Date();
  const year = now.getFullYear();
  const month = parseInt(targetMonth.replace("월", ""));
  const day = parseInt(targetDate);

  const targetDateObj = new Date(year, month - 1, day);

  // YYYYMMDD 형식
  const ymd = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(targetDateObj)
    .replace(/\. /g, "")
    .replace(".", "");

  // "2025. 11. 18. (화)" 형식
  const formatted = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(targetDateObj);

  return { ymd, formatted };
}

/**
 * 터미널 코드 → 이름 조회 (DB에서 가져오기)
 */
async function getTerminalNames(
  departureCd: string,
  arrivalCd: string
): Promise<{ departureName: string; arrivalName: string }> {
  try {
    // DB에서 터미널 이름 조회
    const terminals = await prisma.terminal.findMany({
      where: {
        terminalCd: { in: [departureCd, arrivalCd] },
      },
      select: {
        terminalCd: true,
        terminalNm: true,
      },
    });

    const terminalMap = new Map(
      terminals.map((t) => [t.terminalCd, t.terminalNm])
    );

    const departureName = terminalMap.get(departureCd) || departureCd;
    const arrivalName = terminalMap.get(arrivalCd) || arrivalCd;

    return { departureName, arrivalName };
  } catch (error) {
    // DB 연결 실패 시 코드를 그대로 사용
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[Worker] DB 연결 실패, 터미널 코드를 이름으로 사용: ${errorMsg}`);
    return { departureName: departureCd, arrivalName: arrivalCd };
  }
}
