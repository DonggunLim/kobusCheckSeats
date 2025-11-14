// src/scripts/update-routes-schedules.ts (최종 파라미터 수정)

import axios, { AxiosInstance } from "axios";
import { config } from "dotenv";
import prisma from "../lib/prisma";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
config({ path: envFile });

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, timeout: 10000 }));

interface ScheduleData {
  deprCd: string;
  arvlCd: string;
  departureTime: string;
  busClass: string | null;
  busCompany: string | null;
  isViaRoute: boolean;
  viaLocation: string | null;
}

function getTargetKST(daysOffset: number): { ymd: string; formatted: string } {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  const ymd = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\. /g, "")
    .replace(".", "");

  const formatted = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);

  return { ymd, formatted };
}

async function crawlAllActiveRoutes() {
  console.log("[CRAWL] 🚍 (테스트) 10개 노선 시간표 크롤링 시작...");

  try {
    // 1. "워밍업"
    console.log("[AUTH] 세션 쿠키를 얻기 위해 메인 페이지 접속 중...");
    await client.get("https://www.kobus.co.kr/mrs/rotinf.do", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      },
    });
    console.log("[AUTH] ✅ 세션 쿠키 확보 완료.\n");

    // 2. DB에서 10개 노선 목록 로드
    const routes = await prisma.routesDirect.findMany({
      select: {
        deprCd: true,
        arvlCd: true,
        departureTerminal: { select: { terminalNm: true } },
        arrivalTerminal: { select: { terminalNm: true } },
      },
      take: 1,
    });

    const { ymd: deprDt, formatted: deprDtAll } = getTargetKST(2);

    console.log(`📊 대상 노선: ${routes.length}개 (테스트 모드)`);
    console.log(`📅 크롤링 기준 날짜: ${deprDt}\n`);

    let totalSchedules = 0;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const routeName = `${route.departureTerminal.terminalNm} → ${route.arrivalTerminal.terminalNm}`;

      console.log(
        `\n[${i + 1}/${routes.length}] ${routeName} (${route.deprCd}→${
          route.arvlCd
        })`
      );

      try {
        // [단계 1: 세션 컨텍스트 설정 (alcnSrch.do)]
        console.log(`  └ [1/2] 세션 컨텍스트 설정 중...`);
        const pageParams = new URLSearchParams();
        pageParams.append("deprCd", route.deprCd);
        pageParams.append("deprNm", route.departureTerminal.terminalNm);
        pageParams.append("arvlCd", route.arvlCd);
        pageParams.append("arvlNm", route.arrivalTerminal.terminalNm);
        pageParams.append("pathDvs", "sngl");
        pageParams.append("pathStep", "1");
        pageParams.append("deprDtm", deprDt);
        pageParams.append("deprDtmAll", deprDtAll);
        pageParams.append("arvlDtm", deprDt);
        pageParams.append("arvlDtmAll", deprDtAll);
        pageParams.append("busClsCd", "0");
        pageParams.append("prmmDcYn", "N");
        pageParams.append("tfrCd", "");
        pageParams.append("tfrNm", "");
        pageParams.append("tfrArvlFullNm", "");
        pageParams.append("abnrData", "");

        // ▼▼▼ [수정] 최종 누락 필드 추가 ▼▼▼
        pageParams.append("crchDeprArvlYn", "N");

        await client.post(
          "https://www.kobus.co.kr/mrs/alcnSrch.do",
          pageParams,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
              Referer: "https://www.kobus.co.kr/mrs/rotinf.do",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        // [단계 2: 실제 데이터 요청 (readDispatchInf.ajax)]
        console.log(`  └ [2/2] 시간표 데이터 가져오는 중...`);
        const dataParams = new URLSearchParams();
        dataParams.append("deprCd", route.deprCd);
        dataParams.append("arvlCd", route.arvlCd);
        dataParams.append("deprDt", deprDt);
        dataParams.append("busClas", "A");

        const response = await client.post(
          "https://www.kobus.co.kr/mrs/readDispatchInf.ajax",
          dataParams,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
              Referer: `https://www.kobus.co.kr/mrs/alcnSrch.do`,
              Accept: "application/json, text/plain, */*",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        const scheduleList = (response.data?.dispatchInfList || []).map(
          (s: any): ScheduleData => ({
            deprCd: route.deprCd,
            arvlCd: route.arvlCd,
            departureTime: `${s.tm.substring(0, 2)}:${s.tm.substring(2, 4)}`,
            busClass: s.gradeNm || null,
            busCompany: s.corNm || null,
            isViaRoute: s.viaYn === "Y",
            viaLocation: s.viaYn === "Y" ? s.viaNm : null,
          })
        );

        if (scheduleList.length > 0) {
          // 4. 노선별로 트랜잭션(삭제->생성) 실행
          const transaction = await prisma.$transaction([
            prisma.busSchedules.deleteMany({
              where: { deprCd: route.deprCd, arvlCd: route.arvlCd },
            }),
            prisma.busSchedules.createMany({
              data: scheduleList,
            }),
          ]);

          const createdCount = transaction[1].count;
          totalSchedules += createdCount;
          successCount++;
          console.log(
            `  └ 💾 DB 저장 완료: ${createdCount}개 배차 (누적: ${totalSchedules}개)`
          );
        } else {
          console.log(`  └ ⚠️ 배차 정보가 없습니다.`);
          failCount++;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(`  └ ❌ 처리 실패 (Axios):`, error.message);
        } else {
          console.error(
            `  └ ❌ 처리 실패 (Internal):`,
            (error as Error).message
          );
        }
        failCount++;
      }

      // 5. API 서버 부하 방지를 위한 대기 (0.5초)
      if (i < routes.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 [CRAWL] (테스트) 배차 정보 크롤링 완료!");
    console.log(`📊 통계:`);
    console.log(`  - 처리한 노선: ${routes.length}개`);
    console.log(`  - ✅ 성공: ${successCount}개`);
    console.log(`  - ❌ 실패: ${failCount}개`);
    console.log(`  - 🕒 총 배차 수: ${totalSchedules}개`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("[CRAWL] ❌ 크롤링 중 치명적 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
    console.log("[CRAWL] Prisma Client가 종료되었습니다.");
  }
}

// 스크립트 실행
crawlAllActiveRoutes();
