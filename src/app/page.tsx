import { PortfolioDashboard } from "@/components/PortfolioDashboard";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-teal-700">
          Octa Byte Case Study
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
          Dynamic Portfolio Dashboard
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Live Indian equity portfolio with CMP from Yahoo Finance and P/E ratio plus latest
          earnings from Google Finance.
        </p>
      </header>
      <PortfolioDashboard />
    </main>
  );
}
