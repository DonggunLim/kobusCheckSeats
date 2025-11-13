import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET() {
  try {
    const areas = await prisma.areaCodes.findMany({
      orderBy: { areaCd: "asc" },
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error("Failed to fetch areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}
