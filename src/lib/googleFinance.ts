import axios from "axios";
import * as cheerio from "cheerio";
import { getCached, setCache } from "./cache";
import { toGoogleSymbol } from "./symbols";

const CACHE_TTL_MS = 300_000;
const REQUEST_DELAY_MS = 400;

export interface GoogleFundamentals {
  peRatio: number | null;
  latestEarnings: number | null;
}

function parseMetric(text: string | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.-]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

function extractFromHtml(html: string): GoogleFundamentals {
  const $ = cheerio.load(html);
  let peRatio: number | null = null;
  let latestEarnings: number | null = null;

  $("[data-field]").each((_, element) => {
    const field = $(element).attr("data-field");
    const valueText = $(element).find(".P6K39c").text().trim() || $(element).text().trim();

    if (field === "pe_ratio" || field === "price_to_earnings") {
      peRatio = parseMetric(valueText);
    }
    if (
      field === "eps" ||
      field === "earnings_per_share" ||
      field === "diluted_eps" ||
      field === "basic_eps"
    ) {
      latestEarnings = parseMetric(valueText);
    }
  });

  if (peRatio === null || latestEarnings === null) {
    $("div").each((_, element) => {
      const label = $(element).text().trim().toLowerCase();
      const sibling = $(element).next().text().trim();

      if (!peRatio && (label === "p/e ratio" || label === "pe ratio")) {
        peRatio = parseMetric(sibling);
      }
      if (
        !latestEarnings &&
        (label.includes("earnings per share") || label === "eps" || label.includes("diluted eps"))
      ) {
        latestEarnings = parseMetric(sibling);
      }
    });
  }

  return { peRatio, latestEarnings };
}

async function fetchOne(code: string): Promise<GoogleFundamentals> {
  const googleSymbol = toGoogleSymbol(code);
  const cacheKey = `google:${googleSymbol}`;
  const cached = getCached<GoogleFundamentals>(cacheKey);
  if (cached) return cached;

  const url = `https://www.google.com/finance/quote/${googleSymbol}`;
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    timeout: 15_000,
  });

  const data = extractFromHtml(response.data);
  setCache(cacheKey, data, CACHE_TTL_MS);
  return data;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchGoogleFundamentals(
  codes: string[],
): Promise<Map<string, GoogleFundamentals>> {
  const unique = [...new Set(codes)];
  const map = new Map<string, GoogleFundamentals>();

  for (const code of unique) {
    try {
      const data = await fetchOne(code);
      map.set(code, data);
    } catch {
      map.set(code, { peRatio: null, latestEarnings: null });
    }
    await delay(REQUEST_DELAY_MS);
  }

  return map;
}
