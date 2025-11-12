import axios from "axios";
import { config } from "dotenv";
import prisma from "../lib/prisma";

// Load environment-specific .env file
// Development: .env.local, Production: .env
const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
config({ path: envFile });
const KOBUS_MASTER_DATA_URL = "https://www.kobus.co.kr/mrs/readRotLinInf.ajax";

// ==========================================================
// [변경됨] 제공해주신 실제 지역 코드와 이름으로
// AREA_CODE_MAP을 업데이트합니다.
// ==========================================================
const AREA_CODE_MAP: Record<string, string> = {
  "48": "경남",
  "47": "경북",
  "46": "전남",
  "45": "전북",
  "44": "충남",
  "43": "충북",
  "42": "강원",
  "41": "경기",
  "36": "세종",
  "31": "울산",
  "30": "대전",
  "29": "광주",
  "28": "인천",
  "27": "대구",
  "26": "부산",
  "11": "서울",
  // (참고: Kobus 사이트에서 '제주' 등 추가 지역이 있는지 확인 필요)
};

/**
 * area_codes 테이블을 수동 매핑 정보로 Upsert하는 함수
 */
async function updateAreaCodes() {
  console.log("[SYNC] `area_codes` 테이블 UPSERT 실행...");
  let upsertCount = 0;
  for (const [code, name] of Object.entries(AREA_CODE_MAP)) {
    await prisma.areaCodes.upsert({
      where: { areaCd: code },
      update: { areaNm: name },
      create: { areaCd: code, areaNm: name },
    });
    upsertCount++;
  }
  console.log(`[SYNC] ✅ 지역(AreaCodes) ${upsertCount}건 처리 완료.`);
}

/**
 * 응답 데이터에서 중복되지 않는 터미널 목록을 추출합니다.
 */
function collectTerminals(data: any): Map<string, any> {
  const terminalMap = new Map<string, any>();
  const addTerminal = (cd: string, nm: string, area: string) => {
    // 코드가 유효하고, 이름이 있고, 맵에 없는 경우에만 추가
    if (cd && nm && !terminalMap.has(cd)) {
      // [중요] API에서 온 area 코드가 우리가 정의한 MAP에 있는지 확인
      if (!AREA_CODE_MAP[area]) {
        console.warn(
          `[SYNC] ⚠️ Area 맵에 없는 코드 발견! 코드: '${area}', 터미널: '${nm}'. 이 터미널은 DB에 추가되지 않습니다.`
        );
        // 맵에 없는 지역 코드를 가진 터미널은 아예 수집(add)하지 않음
        // (외래 키 제약 조건 위배를 막기 위함)
        return;
      }
      terminalMap.set(cd, { cd, nm, area });
    }
  };

  // 1. 직행 노선(rotInfList)에서 수집
  data.rotInfList.forEach((route: any) => {
    addTerminal(route.deprCd, route.deprNm, route.deprArea);
    addTerminal(route.arvlCd, route.arvlNm, route.arvlArea);
  });

  // 2. 환승 노선(tfrInfList)에서 수집
  data.tfrInfList.forEach((route: any) => {
    addTerminal(route.deprCd, route.deprNm, route.deprArea);
    addTerminal(route.arvlCd, route.arvlNm, route.arvlArea);
    addTerminal(route.tfrCd, route.tfrNm, route.tfrArea);
  });
  return terminalMap;
}

/**
 * 메인 업데이트 함수
 */
async function updateMasterData() {
  console.log("[SYNC] Kobus 마스터 데이터 동기화를 시작합니다...");

  try {
    // ---------------------------------
    // 1. [중요] area_codes 테이블부터 업데이트 (외래 키 순서)
    // ---------------------------------
    await updateAreaCodes();

    // ---------------------------------
    // 2. Kobus URL에서 최신 데이터 Fetch
    // ---------------------------------
    console.log(
      `[SYNC] URL에서 최신 데이터 가져오는 중... (${KOBUS_MASTER_DATA_URL})`
    );
    const response = await axios.post(
      KOBUS_MASTER_DATA_URL,
      new URLSearchParams(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "KobusCheckSeats-MasterData-Updater (Personal Project)",
        },
      }
    );

    const data = response.data;
    if (!data.rotInfList || !data.tfrInfList) {
      throw new Error("Kobus 응답 형식이 예상과 다릅니다.");
    }
    console.log(
      `[SYNC] 데이터 Fetch 성공. 직행: ${data.rotInfList.length}, 환승: ${data.tfrInfList.length}`
    );

    // ---------------------------------
    // 3. 터미널 데이터 수집 및 UPSERT
    // ---------------------------------
    console.log("[SYNC] 고유 터미널 수집 중...");
    const terminalMap = collectTerminals(data);
    const terminals = Array.from(terminalMap.values());
    console.log(
      `[SYNC] 유효한(Area 코드가 확인된) 고유 터미널 ${terminals.length}개 발견.`
    );

    if (terminals.length > 0) {
      console.log("[SYNC] `terminals` 테이블 UPSERT 실행...");
      let upsertCount = 0;

      for (const terminal of terminals) {
        // collectTerminals에서 이미 유효한(AREA_CODE_MAP에 있는) 터미널만
        // 걸러졌으므로 별도 확인 없이 바로 Upsert 실행
        await prisma.terminal.upsert({
          where: { terminalCd: terminal.cd },
          update: {
            terminalNm: terminal.nm,
            areaCd: terminal.area, // 예: '11'
          },
          create: {
            terminalCd: terminal.cd,
            terminalNm: terminal.nm,
            areaCd: terminal.area,
          },
        });
        upsertCount++;
      }

      console.log(`[SYNC] ✅ 터미널 ${upsertCount}건 처리 완료.`);
    }

    // ---------------------------------
    // 4. 직행 노선 데이터 (DELETE ALL + INSERT)
    // ---------------------------------
    const routesDirect = data.rotInfList
      .map((r: any) => ({
        deprCd: r.deprCd,
        arvlCd: r.arvlCd,
        takeTime: parseInt(r.takeTime) || null,
        homeTickYn: r.homeTickYn,
        prmmDcYn: r.prmmDcYn,
      }))
      // [중요] 수집된(유효한) 터미널 맵에 있는 노선만 필터링
      .filter(
        (r: any) => terminalMap.has(r.deprCd) && terminalMap.has(r.arvlCd)
      );

    if (routesDirect.length > 0) {
      console.log("[SYNC] `routes_direct` 테이블 초기화 중...");
      await prisma.routesDirect.deleteMany({});

      console.log("[SYNC] `routes_direct` 테이블 INSERT 실행...");
      await prisma.routesDirect.createMany({
        data: routesDirect,
      });
      console.log(`[SYNC] ✅ 직행 노선 ${routesDirect.length}건 삽입 완료.`);
    }

    // ---------------------------------
    // 5. 환승 노선 데이터 (DELETE ALL + INSERT)
    // ---------------------------------
    const routesTransfer = data.tfrInfList
      .map((r: any) => ({
        deprCd: r.deprCd,
        arvlCd: r.arvlCd,
        tfrCd: r.tfrCd,
        arvlNmAll: r.arvlNmAll,
      }))
      // [중요] 수집된(유효한) 터미널 맵에 있는 노선만 필터링
      .filter(
        (r: any) =>
          terminalMap.has(r.deprCd) &&
          terminalMap.has(r.arvlCd) &&
          terminalMap.has(r.tfrCd)
      );

    if (routesTransfer.length > 0) {
      console.log("[SYNC] `routes_transfer` 테이블 초기화 중...");
      await prisma.routesTransfer.deleteMany({});

      console.log("[SYNC] `routes_transfer` 테이블 INSERT 실행...");
      await prisma.routesTransfer.createMany({
        data: routesTransfer,
      });
      console.log(`[SYNC] ✅ 환승 노선 ${routesTransfer.length}건 삽입 완료.`);
    }

    console.log("\n🎉 [SYNC] Kobus 마스터 데이터 동기화 성공!");
  } catch (error) {
    console.error("[SYNC] ❌ 데이터 동기화 중 치명적 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
    console.log("[SYNC] Prisma Client가 종료되었습니다.");
  }
}

// 스크립트 실행
updateMasterData();
