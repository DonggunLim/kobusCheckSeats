import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deprCd = searchParams.get("deprCd");

    if (!deprCd) {
      return NextResponse.json(
        { error: "deprCd parameter is required" },
        { status: 400 }
      );
    }

    // Get all destinations reachable from the departure terminal
    const routes = await prisma.routesDirect.findMany({
      where: { deprCd },
      include: {
        arrivalTerminal: true,
      },
      orderBy: {
        arrivalTerminal: {
          terminalNm: "asc",
        },
      },
    });

    const destinations = routes.map((route) => ({
      terminalCd: route.arrivalTerminal.terminalCd,
      terminalNm: route.arrivalTerminal.terminalNm,
      areaCd: route.arrivalTerminal.areaCd,
    }));

    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}
