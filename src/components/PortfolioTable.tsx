"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import type { PortfolioResponse, PortfolioRow } from "@/types/portfolio";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  gainLossClass,
} from "@/lib/formatters";

const REFRESH_INTERVAL_MS = 15_000;
const columnHelper = createColumnHelper<PortfolioRow>();

interface PortfolioTableProps {
  rows: PortfolioRow[];
  onRowsUpdate: (updates: PortfolioResponse["rows"]) => void;
}

function PortfolioTableComponent({ rows, onRowsUpdate }: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const refreshLive = useCallback(async () => {
    try {
      setRefreshing(true);
      setRefreshError(null);
      const response = await fetch("/api/portfolio/live", { cache: "no-store" });
      if (!response.ok) throw new Error("Live refresh failed");
      const payload = (await response.json()) as {
        updates: Array<{
          code: string;
          cmp: number | null;
          presentValue: number | null;
          gainLoss: number | null;
        }>;
      };

      onRowsUpdate(
        rowsRef.current.map((row) => {
          const update = payload.updates.find((item) => item.code === row.code);
          if (!update) return row;
          return {
            ...row,
            cmp: update.cmp,
            presentValue: update.presentValue,
            gainLoss: update.gainLoss,
          };
        }),
      );
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }, [onRowsUpdate]);

  useEffect(() => {
    const timer = setInterval(() => {
      void refreshLive();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refreshLive]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: "Particulars", cell: (info) => info.getValue() }),
      columnHelper.accessor("purchasePrice", {
        header: "Purchase Price",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("qty", { header: "Qty", cell: (info) => info.getValue() }),
      columnHelper.accessor("investment", {
        header: "Investment",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("portfolioPct", {
        header: "Portfolio (%)",
        cell: (info) => formatPercent(info.getValue()),
      }),
      columnHelper.accessor("code", {
        header: "NSE/BSE",
        cell: (info) => (
          <span title={info.row.original.exchangeLabel}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("cmp", {
        header: "CMP",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("presentValue", {
        header: "Present Value",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("gainLoss", {
        header: "Gain/Loss",
        cell: (info) => (
          <span className={gainLossClass(info.getValue())}>
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("peRatio", {
        header: "P/E Ratio",
        cell: (info) => formatNumber(info.getValue()),
      }),
      columnHelper.accessor("latestEarnings", {
        header: "Latest Earnings",
        cell: (info) => formatCurrency(info.getValue()),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          CMP, Present Value, and Gain/Loss refresh every 15 seconds.
        </p>
        <button
          type="button"
          onClick={() => void refreshLive()}
          disabled={refreshing}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh now"}
        </button>
      </div>
      {refreshError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {refreshError}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-3 py-3 font-semibold">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-3 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const PortfolioTable = memo(PortfolioTableComponent);
