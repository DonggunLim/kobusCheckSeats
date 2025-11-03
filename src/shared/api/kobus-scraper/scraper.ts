import { chromium } from "playwright";
import type { RouteQuery, RouteScheduleSlot } from "@/entities/bus-route";
import { CheckResult } from "@/entities/check-result";

/**
 * Playwright를 사용하여 코버스 사이트에서 버스 좌석을 확인합니다.
 */
export async function checkBusSeats(
  config: RouteQuery
): Promise<CheckResult> {
  const { departure, arrival, targetMonth, targetDate, targetTimes } = config;
  const startTime = Date.now();

  console.log(
    `🚌 ${new Date().toLocaleString()}: ${departure} -> ${arrival} (${targetTimes.join(
      ", "
    )}) 좌석 확인 중...`
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const results: RouteScheduleSlot[] = [];
  let foundSeats = false;
  let firstFoundTime: string | null = null;

  try {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.goto("https://www.kobus.co.kr/mrs/rotinf.do");

    // 출발지, 도착지, 날짜 선택 로직
    await page.click("a#readDeprInfoList");
    await page.click(`button:has-text("${departure}")`);
    await page.click(`button:has-text("선택완료")`);
    await page.click("a#readArvlInfoList");
    await page.click(`button:has-text("${arrival}")`);
    await page.click(`button:has-text("선택완료")`);
    await page.click("button.datepicker-btn");

    const monthElement = page.locator(
      "div.ui-datepicker-title > span.ui-datepicker-month"
    );
    while ((await monthElement.innerText()) !== targetMonth) {
      await page.click("a.ui-datepicker-next.ui-corner-all");
    }

    await page.getByRole("link", { name: targetDate, exact: true }).click();
    await page.click("button.btn_confirm");

    await page.waitForSelector("div.bus_time");

    const allBusRows = page.locator('div.bus_time p[role="row"]');
    console.log(`--- 🧐 ${targetTimes.join(", ")} 시간대 좌석 확인 시작 ---`);

    for (const time of targetTimes) {
      const timePattern = new RegExp(time.replace(":", "\\s*:\\s*"));
      const targetRow = allBusRows.filter({
        has: page.locator("span.start_time", { hasText: timePattern }),
      });

      if ((await targetRow.count()) === 0) {
        console.log(`- [${time}] 시간의 버스 정보를 찾을 수 없습니다.`);
        results.push({
          time,
          remainSeats: "N/A",
          status: "정보 없음",
          hasSeats: false,
        });
        continue;
      }

      const remainSeatsText = await targetRow.locator(".remain").innerText();
      const statusText = await targetRow.locator(".status").innerText();

      console.log(`- [${time}] 좌석: ${remainSeatsText}, 상태: ${statusText}`);

      const hasSeats =
        !statusText.includes("매진") && !remainSeatsText.includes("0 석");

      if (hasSeats) {
        console.log(`🎉 [${time}] 좌석 발견!`);
        foundSeats = true;
        // 최초 발견 시간 기록
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
    }

    if (foundSeats) {
      console.log("✅ 목표 좌석을 찾았습니다!");
    } else {
      console.log("...아직 빈 좌석이 없습니다. 다음 스케줄에 다시 확인합니다.");
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    console.log(`⏱️  조회 소요 시간: ${(durationMs / 1000).toFixed(2)}초`);

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
    console.error("❌ 스크래핑 중 오류 발생:", error);
    const endTime = Date.now();
    const durationMs = endTime - startTime;

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
  } finally {
    await browser.close();
  }
}
