# Dynamic Portfolio Dashboard

A full-stack **Next.js + Node.js** portfolio dashboard that displays Indian equity holdings with live market data. CMP is fetched from **Yahoo Finance** (unofficial API), and **P/E ratio** plus **latest earnings** are fetched from **Google Finance** (HTML parsing). Built with **React**, **TypeScript**, and **Tailwind CSS**.

## Features

- Portfolio table with all required columns (Particulars, Purchase Price, Qty, Investment, Portfolio %, NSE/BSE code, CMP, Present Value, Gain/Loss, P/E, Latest Earnings)
- **Auto-refresh every 15 seconds** for CMP, Present Value, and Gain/Loss
- **Green/red** color coding for gains and losses
- **Sector grouping** with investment, present value, and gain/loss summaries
- **Recharts** visualizations (sector allocation pie chart, sector gain/loss bar chart)
- Server-side API routes (Node.js backend) with caching and throttling
- Error handling with user-friendly messages and data disclaimer

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Next.js API Routes (Node.js) |
| Styling | Tailwind CSS v4 |
| Table | @tanstack/react-table |
| Charts | Recharts |
| HTTP | Axios |
| Scraping | Cheerio (Google Finance) |

## Prerequisites

- **Node.js 18+** (recommended: 20 LTS)
- **npm** 9+

## How to Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The first load may take 15–30 seconds because Google Finance data is fetched sequentially with throttling to avoid rate limits.

### 3. Production build (optional)

```bash
npm run build
npm start
```


## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio` | GET | Returns full portfolio with Yahoo CMP + Google P/E & earnings |
| `/api/portfolio/live` | GET | Returns live CMP updates only (used for 15s refresh) |

All API logic runs **server-side** — no API keys or scraping logic is exposed to the browser.

## Data Sources

### Yahoo Finance (CMP)
Uses the unofficial Yahoo Finance quote endpoint:
```
https://query1.finance.yahoo.com/v7/finance/quote?symbols=HDFCBANK.NS,532174.BO
```
- NSE tickers use `.NS` suffix (e.g., `HDFCBANK.NS`)
- BSE numeric codes use `.BO` suffix (e.g., `532174.BO`)

### Google Finance (P/E & Earnings)
Scrapes public Google Finance pages:
```
https://www.google.com/finance/quote/HDFCBANK:NSE
https://www.google.com/finance/quote/532174:BOM
```
If Google data is unavailable, Yahoo's `trailingPE` and `epsTrailingTwelveMonths` are used as fallback.


## Troubleshooting

| Issue | Solution |
|-------|----------|
| Slow first load | Normal — Google scraping is throttled (~400ms per stock) |
| Some CMP shows "—" | Yahoo may not have data for that symbol; verify NSE/BSE code |
| Google P/E missing | Falls back to Yahoo data; check network/firewall |
| `npm run dev` fails | Ensure Node.js 18+ and run `npm install` first |

## Documentation

See [TECHNICAL.md](./TECHNICAL.md) for architecture details, challenges, and design decisions.

## Disclaimer

Market data is sourced from unofficial endpoints and may be delayed or inaccurate. This application is for educational/demo purposes only — not financial advice.
