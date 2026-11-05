# IndiaStockView — project overview

Updated 2 November 2026.

## Product

IndiaStockView helps visitors explore Indian companies through rankings, profiles, price charts, market maps, comparisons and watchlists. It supports a public static reference site and a private local server with optional market-data connections. It is an information product; no order-entry or trading execution feature is implemented.

## Implemented scope

- Reference financial rankings plus an NSE/BSE equity directory, consolidated by matched ISIN.
- Search, filters, sorting, 100-row pages and ranking movement comparisons.
- Individual bookmarkable company pages, financial tabs and available annual history.
- Interactive stock/index price comparisons, index pages, market maps, scatter plots and sector views.
- Browser-local watchlists, comparisons, currency choice and exchange-report imports.
- INR/USD display, daily reference FX and source-aware valuation.
- Verified IPO-date records and a rolling three-calendar-month New listings filter.
- Local Zerodha quote/history integration and an alternative Global Datafeeds bridge.
- Local instrument discovery, official reference refreshes and coverage audit tooling.

## Product boundaries

The directory is broader than financial coverage. A known listing does not guarantee a price, a financial metric, a share count or a verified logo. Snapshot financials, official closing reports and live quotes have different dates and provenance. Missing observations remain missing. Ranking trends use actual dated broker prices; legacy illustrative shapes are excluded. Indices stay separate from company ranks and their levels are not converted to currency.

No user-account system, cross-device watchlist sync, native mobile application, billing or production multi-user broker service is implemented. Mobile web acceptance is separate from native app support.

## Success criteria

Visitors can identify a security, understand the source/date of each displayed number, compare supported observations and distinguish stale data from a failed feed. Release acceptance requires reproducible checks and rendered verification, including small screens and exports; a successful test suite alone is insufficient.
