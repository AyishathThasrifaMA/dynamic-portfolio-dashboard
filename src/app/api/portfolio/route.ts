import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/portfolioService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPortfolioData(false);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load portfolio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
