export interface RawHolding {
  no: number;
  name: string;
  purchasePrice: number;
  qty: number;
  code: string;
  sector: string;
}

export interface LiveQuote {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  source: {
    cmp: "yahoo" | "cache" | "unavailable";
    fundamentals: "google" | "yahoo" | "cache" | "unavailable";
  };
  error?: string;
}

export interface PortfolioRow extends RawHolding {
  investment: number;
  portfolioPct: number;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  yahooSymbol: string;
  exchangeLabel: "NSE" | "BSE";
  liveError?: string;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  holdingsCount: number;
}

export interface PortfolioResponse {
  rows: PortfolioRow[];
  sectors: SectorSummary[];
  totals: {
    totalInvestment: number;
    totalPresentValue: number;
    gainLoss: number;
  };
  lastUpdated: string;
  disclaimer: string;
  errors: string[];
}
