"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import type { PortfolioResponse, PortfolioRow } from "@/types/portfolio";
import { formatCurrency, gainLossClass } from "@/lib/formatters";
import { buildSectorSummaries, buildTotals } from "@/lib/portfolioUtils";
import { PortfolioCharts } from "./PortfolioCharts";
import { PortfolioTable } from "./PortfolioTable";
import { SectorSummaryCards } from "./SectorSummary";

export function PortfolioDashboard() {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/portfolio", { cache: "no-store" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to load portfolio");
      }
      const payload = (await response.json()) as PortfolioResponse;
      setData(payload);
      setRows(payload.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  const sectors = useMemo(() => buildSectorSummaries(rows), [rows]);
  const totals = useMemo(() => buildTotals(rows), [rows]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading portfolio and live market data...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-rose-600" />
        <h2 className="text-lg font-semibold text-rose-800">Failed to load dashboard</h2>
        <p className="mt-2 text-sm text-rose-700">{error ?? "Unknown error"}</p>
        <button
          type="button"
          onClick={() => void loadPortfolio()}
          className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm text-white hover:bg-rose-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Investment</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(totals.totalInvestment)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Present Value</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(totals.totalPresentValue)}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Overall Gain/Loss</p>
          <p className={`mt-1 text-2xl font-bold ${gainLossClass(totals.gainLoss)}`}>
            {formatCurrency(totals.gainLoss)}
          </p>
        </article>
      </section>

      {data.errors.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Some live quotes could not be fetched:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {data.errors.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
            {data.errors.length > 5 ? <li>...and {data.errors.length - 5} more</li> : null}
          </ul>
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-700" />
          <h2 className="text-xl font-semibold text-slate-900">Sector Summary</h2>
        </div>
        <SectorSummaryCards sectors={sectors} />
      </section>

      <PortfolioCharts sectors={sectors} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Holdings</h2>
        <PortfolioTable rows={rows} onRowsUpdate={setRows} />
      </section>

      <footer className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <p>{data.disclaimer}</p>
        <p className="mt-1">Last updated: {new Date(data.lastUpdated).toLocaleString("en-IN")}</p>
      </footer>
    </div>
  );
}
