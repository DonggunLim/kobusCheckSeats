/**
 * GitHub Actions에서 실행되는 스크립트
 * 웹 애플리케이션과 동일한 로직을 사용하여 좌석을 확인하고 결과를 저장합니다.
 */

// TypeScript 모듈을 CommonJS에서 사용하기 위해 동적 import 사용
async function main() {
  // 동적 import로 TypeScript 모듈 로드
  const { checkBusSeats, DEFAULT_CONFIG } = await import("./src/lib/scraper.ts");
  const { saveCheckResult } = await import("./src/lib/db.ts");

  try {
    console.log("🚀 좌석 체크 시작...");

    // 좌석 확인 실행
    const result = await checkBusSeats(DEFAULT_CONFIG);

    // 결과를 히스토리에 저장
    await saveCheckResult(result);

    console.log("✅ 결과 저장 완료");

    // 좌석을 찾았으면 성공 코드로 종료
    if (result.foundSeats) {
      console.log("🎉 좌석을 찾았습니다!");
      process.exit(0);
    } else {
      console.log("...아직 빈 좌석이 없습니다. 다음 스케줄에 다시 확인합니다.");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ 스크래핑 중 오류 발생:", error);
    process.exit(1);
  }
}

main();
