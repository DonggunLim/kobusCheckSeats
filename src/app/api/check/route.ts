import { NextRequest, NextResponse } from "next/server";
import { checkBusSeats, DEFAULT_CONFIG } from "@/shared/api/kobus-scraper";
import { saveCheckResult } from "../lib/check-result-repository";
import type { RouteQuery } from "@/entities/bus-route";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 최대 60초 실행 허용

/**
 * POST /api/check
 * 버스 좌석을 확인합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: RouteQuery = {
      departure: body.departure || DEFAULT_CONFIG.departure,
      arrival: body.arrival || DEFAULT_CONFIG.arrival,
      targetMonth: body.targetMonth || DEFAULT_CONFIG.targetMonth,
      targetDate: body.targetDate || DEFAULT_CONFIG.targetDate,
      targetTimes: body.targetTimes || DEFAULT_CONFIG.targetTimes,
    };

    // 좌석 확인 실행
    const result = await checkBusSeats(config);

    // 결과를 히스토리에 저장
    await saveCheckResult(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/check:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/check
 * 기본 설정으로 버스 좌석을 확인합니다.
 */
export async function GET() {
  try {
    const result = await checkBusSeats(DEFAULT_CONFIG);
    await saveCheckResult(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/check:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
