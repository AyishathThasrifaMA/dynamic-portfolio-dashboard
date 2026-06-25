import type { PortfolioRow, SectorSummary } from "@/types/portfolio";

export function buildSectorSummaries(rows: PortfolioRow[]): SectorSummary[] {
  const grouped = new Map<string, SectorSummary>();

  for (const row of rows) {
    const existing = grouped.get(row.sector) ?? {
      sector: row.sector,
      totalInvestment: 0,
      totalPresentValue: 0,
      gainLoss: 0,
      holdingsCount: 0,
    };

    existing.totalInvestment += row.investment;
    existing.totalPresentValue += row.presentValue ?? 0;
    existing.gainLoss += row.gainLoss ?? 0;
    existing.holdingsCount += 1;
    grouped.set(row.sector, existing);
  }

  return [...grouped.values()].sort((a, b) => a.sector.localeCompare(b.sector));
}

export function buildTotals(rows: PortfolioRow[]) {
  const totalInvestment = rows.reduce((sum, row) => sum + row.investment, 0);
  const totalPresentValue = rows.reduce((sum, row) => sum + (row.presentValue ?? 0), 0);
  return {
    totalInvestment,
    totalPresentValue,
    gainLoss: totalPresentValue - totalInvestment,
  };
}
