# Technical Document — Dynamic Portfolio Dashboard

## Overview

This application is a full-stack portfolio dashboard built for the Octa Byte case study. It combines static portfolio holdings (from the provided Excel sheet) with live market data from unofficial Yahoo Finance and Google Finance sources.

## Architecture

```
Browser (React Client)
    │
    ├── GET /api/portfolio        ──► Initial load (Yahoo + Google, ~15–30s)
    └── GET /api/portfolio/live   ──► Every 15s (Yahoo CMP only, ~2–5s)
              │
              ▼
        Node.js API Routes (Next.js)
              │
    ┌─────────┴──────────┐
    ▼                    ▼
Yahoo Finance      Google Finance
(unofficial API)   (HTML scraping)
    │                    │
    └─────────┬──────────┘
              ▼
      In-memory TTL Cache
              │
              ▼
      Portfolio Service
    (merge + calculate)
```

## Key Challenges & Solutions

### 1. No Official Yahoo/Google Finance APIs

**Challenge:** Neither Yahoo nor Google provides a public, documented API for stock quotes.

**Solution:**
- **Yahoo:** Use the widely-used unofficial quote endpoint (`query1.finance.yahoo.com/v7/finance/quote`). Batch up to 20 symbols per request.
- **Google:** Scrape the public quote page HTML with Cheerio, extracting P/E ratio and EPS from `data-field` attributes and label/value pairs.
- **Fallback:** If Google scraping fails, use Yahoo's `trailingPE` and `epsTrailingTwelveMonths` fields.

### 2. Rate Limiting & Blocking

**Challenge:** Aggressive polling can trigger IP blocks or CAPTCHAs.

**Solution:**
- **In-memory cache** with TTL (30s for Yahoo, 5min for Google)
- **Batch requests** to Yahoo (20 symbols per call instead of 30 individual calls)
- **Throttled Google scraping** (400ms delay between requests)
- **Separate live endpoint** that only hits Yahoo during 15s refresh — Google data is fetched once on initial load

### 3. NSE vs BSE Symbol Mapping

**Challenge:** The Excel sheet mixes NSE ticker symbols (`HDFCBANK`) and BSE numeric codes (`532174`).

**Solution:** Auto-detect exchange by code format:
- All-numeric codes → BSE → Yahoo: `.BO`, Google: `:BOM`
- Alphanumeric codes → NSE → Yahoo: `.NS`, Google: `:NSE`

### 4. Slow Initial Load

**Challenge:** Fetching Google data for 30 stocks sequentially takes ~12 seconds.

**Solution:**
- Show a loading spinner with clear message
- Run Yahoo and Google fetches in parallel via `Promise.all`
- Cache Google results for 5 minutes so subsequent page loads are fast
- Live refresh (15s) only updates CMP from Yahoo — no Google re-fetch

### 5. Data Accuracy & Disclaimers

**Challenge:** Scraped/unofficial data may be stale or wrong.

**Solution:**
- Display a disclaimer footer on every page load
- Show amber warning banner when individual stock quotes fail
- Use `null` and "—" display for missing data instead of showing wrong values

### 6. Performance on the Client

**Challenge:** Frequent re-renders during 15s refresh could cause UI jank.

**Solution:**
- `React.memo` on table, sector cards, and chart components
- `useMemo` for sector summaries and totals derived from row state
- `useRef` for row data in refresh callback to avoid resetting the interval timer
- Only CMP/Present Value/Gain/Loss update on refresh — P/E and earnings stay static

## Data Flow

1. **Static data** loaded from `initialHoldings.json`
2. **Yahoo quotes** fetched in batches → CMP, fallback P/E, fallback earnings
3. **Google pages** scraped sequentially → primary P/E and earnings
4. **Calculated fields:**
   - `investment = purchasePrice × qty`
   - `portfolioPct = (investment / totalInvestment) × 100`
   - `presentValue = cmp × qty`
   - `gainLoss = presentValue - investment`
5. **Sector summaries** aggregated by `sector` field
6. **Client** renders table, cards, charts; polls `/api/portfolio/live` every 15s

## Security

- All external API calls happen **server-side only** (Next.js API routes)
- No API keys required (unofficial endpoints)
- No sensitive data in client-side JavaScript bundles
- `dynamic = "force-dynamic"` on API routes to prevent stale cached responses


