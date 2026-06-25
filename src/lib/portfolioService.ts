import initialHoldings from "@/data/initialHoldings.json";
import type {
  PortfolioResponse,
  PortfolioRow,
  RawHolding,
} from "@/types/portfolio";
import { fetchGoogleFundamentals } from "./googleFinance";
import { buildSectorSummaries, buildTotals } from "./portfolioUtils";
import { getExchangeLabel, toYahooSymbol } from "./symbols";
import { fetchYahooQuotes } from "./yahooFinance";

const DISCLAIMER =
  "Market data is sourced from unofficial Yahoo Finance and Google Finance endpoints. Values may be delayed or inaccurate and are for demonstration only.";

function buildRows(
  holdings: RawHolding[],
  yahooMap: Map<string, { cmp: number | null; peRatio: number | null; latestEarnings: number | null }>,
  googleMap: Map<string, { peRatio: number | null; latestEarnings: number | null }>,
): { rows: PortfolioRow[]; errors: string[] } {
  const errors: string[] = [];
  const totalInvestment = holdings.reduce(
    (sum, item) => sum + item.purchasePrice * item.qty,
    0,
  );

  const rows: PortfolioRow[] = holdings.map((holding) => {
    const yahooSymbol = toYahooSymbol(holding.code);
    const yahoo = yahooMap.get(yahooSymbol);
    const google = googleMap.get(holding.code);
    const investment = holding.purchasePrice * holding.qty;
    const cmp = yahoo?.cmp ?? null;
    const presentValue = cmp !== null ? cmp * holding.qty : null;
    const gainLoss = presentValue !== null ? presentValue - investment : null;
    const peRatio = google?.peRatio ?? yahoo?.peRatio ?? null;
    const latestEarnings = google?.latestEarnings ?? yahoo?.latestEarnings ?? null;

    const liveError =
      cmp === null
        ? `Live price unavailable for ${holding.name} (${yahooSymbol})`
        : undefined;

    if (liveError) errors.push(liveError);

    return {
      ...holding,
      investment,
      portfolioPct: totalInvestment > 0 ? (investment / totalInvestment) * 100 : 0,
      cmp,
      presentValue,
      gainLoss,
      peRatio,
      latestEarnings,
      yahooSymbol,
      exchangeLabel: getExchangeLabel(holding.code),
      liveError,
    };
  });

  return { rows, errors: [...new Set(errors)] };
}

export async function getPortfolioData(skipGoogle = false): Promise<PortfolioResponse> {
  const holdings = initialHoldings as RawHolding[];
  const yahooSymbols = holdings.map((h) => toYahooSymbol(h.code));
  const codes = holdings.map((h) => h.code);

  const [yahooMapRaw, googleMapRaw] = await Promise.all([
    fetchYahooQuotes(yahooSymbols),
    skipGoogle ? Promise.resolve(new Map()) : fetchGoogleFundamentals(codes),
  ]);

  const yahooMap = new Map(
    [...yahooMapRaw.entries()].map(([symbol, quote]) => [
      symbol,
      {
        cmp: quote.cmp,
        peRatio: quote.peRatio,
        latestEarnings: quote.latestEarnings,
      },
    ]),
  );

  const { rows, errors } = buildRows(holdings, yahooMap, googleMapRaw);

  return {
    rows,
    sectors: buildSectorSummaries(rows),
    totals: buildTotals(rows),
    lastUpdated: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    errors,
  };
}
