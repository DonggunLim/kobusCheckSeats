// src/scripts/update-routes-schedules.ts
// 고속버스 노선별 시간표 크롤링 스크립트

import axios from "axios";
import { config } from "dotenv";
import prisma from "../lib/prisma";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
config({ path: envFile });

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, timeout: 30000 }));

interface ScheduleData {
  deprCd: string;
  arvlCd: string;
  departureTime: string;
  busClass: string | null;
  busCompany: string | null;
  isViaRoute: boolean;
  viaLocation: string | null;
}

/**
 * KST 기준으로 오늘+N일 날짜 반환
 */
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

/**
 * 모든 활성 노선의 시간표 크롤링
 */
async function crawlAllActiveRoutes() {
  console.log("[CRAWL] 🚍 버스 노선 시간표 크롤링 시작...\n");

  try {
    // 1. 세션 쿠키 획득
    console.log("[AUTH] 세션 쿠키 획득 중...");
    await client.get("https://www.kobus.co.kr/mrs/rotinf.do", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    });
    console.log("[AUTH] ✅ 세션 쿠키 확보 완료\n");

    // 2. DB에서 모든 노선 로드
    const routes = await prisma.routesDirect.findMany({
      select: {
        deprCd: true,
        arvlCd: true,
        departureTerminal: { select: { terminalNm: true } },
        arrivalTerminal: { select: { terminalNm: true } },
      },
    });

    const { ymd: deprDt, formatted: deprDtAll } = getTargetKST(2);

    console.log(`📊 대상 노선: ${routes.length}개`);
    console.log(`📅 크롤링 날짜: ${deprDt} (${deprDtAll})\n`);

    let totalSchedules = 0;
    let successCount = 0;
    let failCount = 0;

    // 3. 각 노선별로 시간표 크롤링
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const routeName = `${route.departureTerminal.terminalNm} → ${route.arrivalTerminal.terminalNm}`;

      console.log(
        `\n[${i + 1}/${routes.length}] ${routeName} (${route.deprCd}→${route.arvlCd})`
      );

      try {
        // alcnSrch.do에 POST하여 HTML 응답 받기
        const pageParams = new URLSearchParams();
        pageParams.append("deprCd", route.deprCd);
        pageParams.append("deprNm", route.departureTerminal.terminalNm);
        pageParams.append("arvlCd", route.arvlCd);
        pageParams.append("arvlNm", route.arrivalTerminal.terminalNm);
        pageParams.append("pathDvs", "sngl");
        pageParams.append("pathStep", "1");
        pageParams.append("crchDeprArvlYn", "N");
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

        // HTML 파싱
        const $ = cheerio.load(response.data);
        const scheduleLinks = $('a[onclick*="fnSatsChc"]');

        if (scheduleLinks.length === 0) {
          console.log(`  └ ⚠️ 배차 정보 없음`);
          failCount++;
          continue;
        }

        // 시간표 데이터 추출
        const scheduleList: ScheduleData[] = [];
        scheduleLinks.each((_idx: number, el: cheerio.Element) => {
          const $link = $(el);

          // 시간 추출
          const timeText = $link.find("span.start_time").text().trim();
          const time = timeText.replace(/\s+/g, ""); // "06 : 00" → "06:00"

          // 등급 추출
          const gradeText = $link
            .find("span.grade")
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim();

          // 경유지 추출
          const viaText = $link.find("span.grade span.via").text().trim();
          const viaLocation = viaText
            ? viaText.replace(/[()]/g, "").trim()
            : null;

          // 회사명 추출
          const company = $link
            .find("span.bus_com span")
            .first()
            .text()
            .trim();

          scheduleList.push({
            deprCd: route.deprCd,
            arvlCd: route.arvlCd,
            departureTime: time,
            busClass: gradeText || null,
            busCompany: company || null,
            isViaRoute: !!viaLocation,
            viaLocation,
          });
        });

        // DB 저장 (기존 데이터 삭제 후 새로 생성)
        if (scheduleList.length > 0) {
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
            `  └ ✅ ${createdCount}개 배차 저장 완료 (누적: ${totalSchedules}개)`
          );
        } else {
          console.log(`  └ ⚠️ 배차 정보 없음`);
          failCount++;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(`  └ ❌ 실패: ${error.message}`);
          console.error(`  └    상태 코드: ${error.response?.status}`);
        } else {
          console.error(`  └ ❌ 실패: ${(error as Error).message}`);
        }
        failCount++;
      }

      // API 서버 부하 방지 (0.5초 대기)
      if (i < routes.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // 최종 결과 출력
    console.log("\n" + "=".repeat(60));
    console.log("🎉 크롤링 완료!");
    console.log(`📊 통계:`);
    console.log(`  - 처리 노선: ${routes.length}개`);
    console.log(`  - ✅ 성공: ${successCount}개`);
    console.log(`  - ❌ 실패: ${failCount}개`);
    console.log(`  - 🕒 총 배차: ${totalSchedules}개`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ 크롤링 중 치명적 오류:", error);
  } finally {
    await prisma.$disconnect();
    console.log("\n[CRAWL] 종료");
  }
}

// 스크립트 실행
crawlAllActiveRoutes();
