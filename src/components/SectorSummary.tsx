import { memo } from "react";
import type { SectorSummary } from "@/types/portfolio";
import { formatCurrency, gainLossClass } from "@/lib/formatters";

interface SectorSummaryProps {
  sectors: SectorSummary[];
}

function SectorSummaryComponent({ sectors }: SectorSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sectors.map((sector) => (
        <article
          key={sector.sector}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{sector.sector}</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {sector.holdingsCount} stocks
            </span>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Total Investment</dt>
              <dd className="font-medium">{formatCurrency(sector.totalInvestment)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Total Present Value</dt>
              <dd className="font-medium">{formatCurrency(sector.totalPresentValue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Gain/Loss</dt>
              <dd className={gainLossClass(sector.gainLoss)}>{formatCurrency(sector.gainLoss)}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

export const SectorSummaryCards = memo(SectorSummaryComponent);
