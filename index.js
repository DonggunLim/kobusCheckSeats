const { chromium } = require("playwright");

const DEPARTURE = "서울경부";
const ARRIVAL = "상주";
const TARGET_MONTH = "10";
const TARGET_DATE = "2";
const TARGET_TIMES = ["18:40", "19:40"];

/**
 * Playwright를 사용하여 코버스 사이트에서 버스 좌석을 확인합니다.
 */
async function checkBusSeats() {
  console.log(
    `🚌 ${new Date().toLocaleString()}: ${DEPARTURE} -> ${ARRIVAL} (${TARGET_TIMES.join(
      ", "
    )}) 좌석 확인 중...`
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  let foundThisRun = false;

  try {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.goto("https://www.kobus.co.kr/mrs/rotinf.do");

    // 출발지, 도착지, 날짜 선택 로직 (기존과 동일)
    await page.click("a#readDeprInfoList");
    await page.click(`button:has-text("${DEPARTURE}")`);
    await page.click(`button:has-text("선택완료")`);
    await page.click("a#readArvlInfoList");
    await page.click(`button:has-text("${ARRIVAL}")`);
    await page.click(`button:has-text("선택완료")`);
    await page.click("button.datepicker-btn");
    const monthElement = page.locator(
      "div.ui-datepicker-title > span.ui-datepicker-month"
    );
    while ((await monthElement.innerText()) !== TARGET_MONTH) {
      await page.click("a.ui-datepicker-next.ui-corner-all");
    }
    await page.getByRole("link", { name: TARGET_DATE, exact: true }).click();
    await page.click("button.btn_confirm");

    await page.waitForSelector("div.bus_time");

    const allBusRows = page.locator('div.bus_time p[role="row"]');
    console.log(`--- 🧐 ${TARGET_TIMES.join(", ")} 시간대 좌석 확인 시작 ---`);

    for (const time of TARGET_TIMES) {
      const timePattern = new RegExp(time.replace(":", "\\s*:\\s*"));
      const targetRow = allBusRows.filter({
        has: page.locator("span.start_time", { hasText: timePattern }),
      });

      if ((await targetRow.count()) === 0) {
        console.log(`- [${time}] 시간의 버스 정보를 찾을 수 없습니다.`);
        continue;
      }

      const remainSeatsText = await targetRow.locator(".remain").innerText();
      const statusText = await targetRow.locator(".status").innerText();

      console.log(`- [${time}] 좌석: ${remainSeatsText}, 상태: ${statusText}`);

      if (!statusText.includes("매진") && !remainSeatsText.includes("0 석")) {
        console.log(`🎉 [${time}] 좌석 발견!`);
        foundThisRun = true;
      }
    }

    if (foundThisRun) {
      console.log("✅ 목표 좌석을 찾았습니다!");
      // 알림을 보내는 로직을 추가.
    } else {
      console.log("...아직 빈 좌석이 없습니다. 다음 스케줄에 다시 확인합니다.");
    }
  } catch (error) {
    console.error("❌ 스크래핑 중 오류 발생:", error);
    // 오류가 발생했음을 Actions에 알리기 위해 실패 코드로 종료합니다.
    process.exit(1);
  } finally {
    await browser.close();
  }
}

(async () => {
  await checkBusSeats();
})();
