"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SectorSummary } from "@/types/portfolio";
import { formatCurrency } from "@/lib/formatters";

const COLORS = ["#0f766e", "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#ca8a04"];

interface PortfolioChartsProps {
  sectors: SectorSummary[];
}

function PortfolioChartsComponent({ sectors }: PortfolioChartsProps) {
  const allocationData = useMemo(
    () =>
      sectors.map((sector) => ({
        name: sector.sector,
        value: sector.totalInvestment,
      })),
    [sectors],
  );

  const performanceData = useMemo(
    () =>
      sectors.map((sector) => ({
        name: sector.sector,
        gainLoss: sector.gainLoss,
      })),
    [sectors],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Sector Allocation</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={allocationData} dataKey="value" nameKey="name" outerRadius={100} label>
                {allocationData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Sector Gain/Loss</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="gainLoss">
                {performanceData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.gainLoss >= 0 ? "#059669" : "#e11d48"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export const PortfolioCharts = memo(PortfolioChartsComponent);
