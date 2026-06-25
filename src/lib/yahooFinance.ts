import axios from "axios";
import { getCached, setCache } from "./cache";

const YAHOO_QUOTE_URL = "https://query1.finance.yahoo.com/v7/finance/quote";
const CACHE_TTL_MS = 30_000;
const BATCH_SIZE = 20;

export interface YahooQuote {
  symbol: string;
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

async function fetchBatch(symbols: string[]): Promise<YahooQuote[]> {
  const cacheKey = `yahoo:${symbols.sort().join(",")}`;
  const cached = getCached<YahooQuote[]>(cacheKey);
  if (cached) return cached;

  const response = await axios.get(YAHOO_QUOTE_URL, {
    params: { symbols: symbols.join(",") },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
    timeout: 15_000,
  });

  const results: YahooQuote[] = (response.data?.quoteResponse?.result ?? []).map(
    (item: Record<string, unknown>) => ({
      symbol: String(item.symbol ?? ""),
      cmp: parseNumber(item.regularMarketPrice),
      peRatio: parseNumber(item.trailingPE),
      latestEarnings: parseNumber(item.epsTrailingTwelveMonths),
    }),
  );

  setCache(cacheKey, results, CACHE_TTL_MS);
  return results;
}

export async function fetchYahooQuotes(symbols: string[]): Promise<Map<string, YahooQuote>> {
  const unique = [...new Set(symbols)];
  const map = new Map<string, YahooQuote>();

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    try {
      const quotes = await fetchBatch(batch);
      for (const quote of quotes) {
        map.set(quote.symbol, quote);
      }
    } catch {
      for (const symbol of batch) {
        map.set(symbol, {
          symbol,
          cmp: null,
          peRatio: null,
          latestEarnings: null,
        });
      }
    }
  }

  return map;
}
