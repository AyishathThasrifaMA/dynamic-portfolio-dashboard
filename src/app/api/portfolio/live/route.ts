import { NextResponse } from "next/server";
import initialHoldings from "@/data/initialHoldings.json";
import { toYahooSymbol } from "@/lib/symbols";
import { fetchYahooQuotes } from "@/lib/yahooFinance";
import type { RawHolding } from "@/types/portfolio";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const holdings = initialHoldings as RawHolding[];
    const symbols = holdings.map((h) => toYahooSymbol(h.code));
    const quotes = await fetchYahooQuotes(symbols);

    const updates = holdings.map((holding) => {
      const yahooSymbol = toYahooSymbol(holding.code);
      const quote = quotes.get(yahooSymbol);
      const cmp = quote?.cmp ?? null;
      const investment = holding.purchasePrice * holding.qty;
      const presentValue = cmp !== null ? cmp * holding.qty : null;
      const gainLoss = presentValue !== null ? presentValue - investment : null;

      return {
        code: holding.code,
        cmp,
        presentValue,
        gainLoss,
      };
    });

    return NextResponse.json({
      updates,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh live quotes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
