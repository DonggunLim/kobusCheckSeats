import { NextRequest, NextResponse } from "next/server";
import {
  getActiveSession,
  startSession,
  endSession,
} from "../../api/lib/session-manager";
import type { RouteQuery } from "@/entities/bus-route";

export const dynamic = "force-dynamic";

/**
 * GET /api/session
 * 현재 활성 세션 정보를 조회합니다.
 */
export async function GET() {
  try {
    const session = await getActiveSession();

    if (!session) {
      return NextResponse.json({ session: null, active: false });
    }

    return NextResponse.json({ session, active: true });
  } catch (error) {
    console.error("Error in GET /api/session:", error);
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
 * POST /api/session
 * 새로운 세션을 시작합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 기존 활성 세션이 있는지 확인
    const existingSession = await getActiveSession();
    if (existingSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Active session already exists",
          session: existingSession,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const config: RouteQuery = {
      departure: body.departure,
      arrival: body.arrival,
      targetMonth: body.targetMonth,
      targetDate: body.targetDate,
      targetTimes: body.targetTimes,
    };

    const session = await startSession(config);

    // GitHub Actions workflow 트리거
    try {
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRepo = process.env.GITHUB_REPOSITORY; // 예: "username/repo"

      console.log("🔍 Config being sent to GitHub Actions:", config);

      if (githubToken && githubRepo) {
        const [owner, repo] = githubRepo.split("/");

        const workflowInputs = {
          departure: config.departure,
          arrival: config.arrival,
          targetMonth: config.targetMonth,
          targetDate: config.targetDate,
          targetTimes: config.targetTimes.join(","),
        };

        console.log("🔍 Workflow inputs:", workflowInputs);

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/actions/workflows/check-seats.yml/dispatches`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              "Content-Type": "application/json",
              Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
              ref: "main", // 또는 현재 브랜치
              inputs: workflowInputs,
            }),
          }
        );

        if (!response.ok) {
          console.error("Failed to trigger GitHub Actions:", await response.text());
        } else {
          console.log("✅ GitHub Actions workflow triggered successfully");
        }
      } else {
        console.warn("⚠️  GitHub token or repository not configured. Workflow not triggered.");
      }
    } catch (error) {
      console.error("Error triggering GitHub Actions:", error);
      // 에러가 나도 세션은 시작되었으므로 계속 진행
    }

    return NextResponse.json({
      success: true,
      session,
      message: "Session started. GitHub Actions will start checking seats every 5 minutes.",
    });
  } catch (error) {
    console.error("Error in POST /api/session:", error);
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
 * DELETE /api/session
 * 현재 활성 세션을 종료합니다.
 */
export async function DELETE() {
  try {
    await endSession();

    return NextResponse.json({
      success: true,
      message: "Session ended successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/session:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
