import { NextRequest, NextResponse } from "next/server";
import {
  getRecentHistory,
  getFoundSeatsHistory,
  getHistoryByDateRange,
} from "../lib/check-result-repository";

export const dynamic = "force-dynamic";

/**
 * GET /api/history
 * 히스토리를 조회합니다.
 *
 * Query Parameters:
 * - limit: 가져올 개수 (기본: 50)
 * - foundOnly: true이면 좌석이 있었던 것만 (기본: false)
 * - startDate: 시작 날짜 (ISO 형식)
 * - endDate: 종료 날짜 (ISO 형식)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const foundOnly = searchParams.get("foundOnly") === "true";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let history;

    if (foundOnly) {
      history = await getFoundSeatsHistory();
    } else if (startDate && endDate) {
      history = await getHistoryByDateRange(startDate, endDate);
    } else {
      history = await getRecentHistory(limit);
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error in /api/history:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
