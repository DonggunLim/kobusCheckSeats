import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const areaCd = searchParams.get("areaCd");

    if (!areaCd) {
      return NextResponse.json(
        { error: "areaCd parameter is required" },
        { status: 400 }
      );
    }

    // Get terminals in the specified area that have departure routes
    const terminals = await prisma.terminal.findMany({
      where: {
        areaCd,
        departureRoutesDirect: {
          some: {},
        },
      },
      orderBy: { terminalNm: "asc" },
      select: {
        terminalCd: true,
        terminalNm: true,
        areaCd: true,
      },
    });

    return NextResponse.json(terminals);
  } catch (error) {
    console.error("Failed to fetch terminals:", error);
    return NextResponse.json(
      { error: "Failed to fetch terminals" },
      { status: 500 }
    );
  }
}
