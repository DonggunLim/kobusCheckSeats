import { NextRequest, NextResponse } from "next/server";
import prisma from "@/shared/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/jobs/history
 * 잡 히스토리 목록 조회 (최신순)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // waiting, active, completed, failed

    // DB에서 잡 히스토리 조회
    const whereClause = status ? { status } : {};

    const jobs = await prisma.jobHistory.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // JSON 파싱하여 반환
    const parsedJobs = jobs.map((job) => ({
      ...job,
      targetTimes: JSON.parse(job.targetTimes),
      result: job.result ? JSON.parse(job.result) : null,
    }));

    return NextResponse.json({
      success: true,
      jobs: parsedJobs,
      count: parsedJobs.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch job history" },
      { status: 500 }
    );
  }
}
