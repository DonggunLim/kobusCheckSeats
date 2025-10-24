import { NextResponse } from "next/server";
import { getStatistics } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/stats
 * 통계 정보를 조회합니다.
 */
export async function GET() {
  try {
    const stats = await getStatistics();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in /api/stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
