/**
 * GitHub Actions에서 실행되는 스크립트
 * 웹 애플리케이션과 동일한 로직을 사용하여 좌석을 확인하고 결과를 저장합니다.
 * 세션 관리를 통해 반복 조회 시 누적 시간과 시도 횟수를 추적합니다.
 */

import { checkBusSeats } from "./src/shared/api/kobus-scraper/scraper";
import { DEFAULT_CONFIG } from "./src/shared/api/kobus-scraper/config";
import { saveCheckResult } from "./src/app/api/lib/check-result-repository";
import {
  getActiveSession,
  startSession,
  incrementAttempt,
  endSession,
  getSessionDuration,
} from "./src/app/api/lib/session-manager";

async function main() {
  try {
    console.log("🚀 좌석 체크 시작...");

    // 1. 활성 세션 확인
    let session = await getActiveSession();

    if (!session) {
      // 세션이 없으면 새로 시작
      console.log("🆕 새 세션 시작");
      session = await startSession(DEFAULT_CONFIG);
    } else {
      console.log(
        `♻️  기존 세션 계속 (시도 ${session.attemptCount + 1}회, 경과 ${(
          getSessionDuration(session.startTime) /
          1000 /
          60
        ).toFixed(1)}분)`
      );
    }

    // 2. 시도 횟수 증가
    await incrementAttempt(session.sessionId);
    session.attemptCount += 1;

    // 3. 좌석 확인 실행 (단일 조회만 수행)
    const result = await checkBusSeats(session.config);

    // 4. 세션 정보 추가
    const totalDuration = getSessionDuration(session.startTime);
    result.sessionId = session.sessionId;
    result.totalCheckCount = session.attemptCount;
    result.durationMs = totalDuration;

    console.log(
      `📊 세션 통계: ${session.attemptCount}회 시도, 총 ${(totalDuration / 1000 / 60).toFixed(1)}분 경과`
    );

    // 5. 좌석을 찾았으면 세션 종료
    if (result.foundSeats) {
      console.log("🎉 좌석을 찾았습니다!");
      console.log(
        `⏱️  총 소요: ${(totalDuration / 1000 / 60).toFixed(1)}분, ${session.attemptCount}회 시도`
      );

      // 결과 저장
      await saveCheckResult(result);

      // 세션 종료
      await endSession();

      console.log("✅ 세션 종료 및 결과 저장 완료");
      process.exit(0);
    } else {
      console.log(
        "...아직 빈 좌석이 없습니다. 다음 스케줄(5분 후)에 다시 확인합니다."
      );
      // 좌석을 못 찾았을 때는 저장하지 않음 (세션만 유지)
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ 스크래핑 중 오류 발생:", error);
    process.exit(1);
  }
}

main();
