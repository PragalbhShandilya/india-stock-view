# IndiaStockView

A data-focused Indian equity website with rankings, company profiles, market maps, financial comparisons, watchlists, and interactive charts.

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for the full project documentation, setup guides, architecture, data sources, quality register, test plan, deployment notes and next-session handoff.

## Features

- NSE/BSE company directory and 100-company ranking pages
- Sortable financial rankings with rank movement comparisons
- USD and INR display, including Indian number abbreviations
- Market-cap treemap, revenue/profit scatter plots, and sector breakdowns
- Stock/index comparison overlays, index chart pages and available annual company history
- Browser-local watchlists and comparisons
- PNG/SVG chart downloads and ranking CSV exports
- Official NSE/BSE closing-price CSV import
- Calendar-based market open/closed indicator

## Public website

GitHub updates and publication are currently paused at the user’s request. Continue local work until publication is explicitly resumed.

The `Deploy website to GitHub Pages` workflow publishes `dist/` after changes to `main`. In repository **Settings → Pages**, select **GitHub Actions** as the source.

GitHub Pages hosts the static snapshot website. It does not run the local Node server, live-market feed bridge, or daily directory updater. No broker credentials are included or required for the public preview. Report imports and preferences stay in each visitor's browser.

## Run locally

Requires Node.js 22 or later (Node 24 is used by the Pages workflow). No package installation is needed.

```sh
npm start
```

Open http://127.0.0.1:4174/. Optional server-only feed configuration is documented in `.env.example`; never place API secrets in `dist/`.

```sh
npm run version:assets
npm run check
```

## Data and accuracy

The bundled financial universe contains 595 reference companies. The directory adds securities from NSE/BSE broker instrument masters, deduplicated by ISIN where matched; coverage is not certified exhaustive. Company-equity directory data is derived from Upstox and cross-referenced with Zerodha's public instrument master.

Prices and market caps are dated source values. Revenue and pretax earnings were retrieved across all six CompaniesMarketCap India ranking pages on 31 October 2026, with 595 matching tickers for each metric. Reporting periods vary. `dist/data.json` records financial source links and coverage. Profit means **pretax earnings**, not net income. Market cap and financial metrics may have different dates and must not be interpreted as a same-date valuation multiple.

Some reference prices are overseas depositary-receipt quotes. Their identities are retained. Currency conversion uses a dated ExchangeRate-API reference rate, not intraday FX. Attribution is displayed when INR conversion is used.

Ranking 30-day trends use actual Zerodha observations within a common 30-calendar-day IST window, clipped to verified IPO dates. Short listing histories occupy only their available day share of the width; missing history stays blank. Stock/index charts support the configured daily/intraday timelines; 5Y/MAX plot the last shared observation per week with calendar-year axes. Index levels remain points in either display currency. Annual market-cap history remains annual and is available only for selected companies.

Direct company/section entry documents are generated from verified identities. Run `npm run build:pages` after directory or metadata changes; asset versioning also rebuilds existing entries. Older hash bookmarks still work. See [DEPLOYMENT.md](DEPLOYMENT.md) for generated-page and hosting details.

## Official exchange report imports

In **Data sources**, select an official Capital Market/Equity **UDiFF Common Bhavcopy Final CSV** downloaded from:

- [NSE reports](https://www.nseindia.com/all-reports)
- [BSE bhavcopy](https://www.bseindia.com/markets/MarketInfo/BhavCopy.aspx)

Unzip reports before import. The importer validates schema, dates, ISIN and price fields, then matches the directory by ISIN, exchange and series. Imported closing prices are separate from existing financials and historical charts. Unmatched prices remain unavailable. Reports persist only in the importing browser, and the data panel can restore the original dataset.

No official exchange report is bundled or automatically loaded. Automated archive downloads could not be verified. Broker quote/history access depends on the local authenticated session and provider permissions; it is separate from official closing-report imports.

## Attribution

Financial reference data and company logo URLs: [CompaniesMarketCap](https://companiesmarketcap.com/india/largest-companies-in-india-by-market-cap/) / [CompaniesLogo](https://companieslogo.com/). Logos remain the property of their owners. FX reference: [ExchangeRate-API](https://www.exchangerate-api.com/). Instrument directories: [Upstox](https://upstox.com/developer/api-documentation/instruments/) and [Kite Connect](https://kite.trade/docs/connect/v3/market-data-and-instruments/).

Publication of this code does not grant redistribution rights to third-party market data, logos, or broker services. Obtain appropriate source permissions for production use.


### Official share counts and market caps

`dist/official-shares.json` stores reviewed, dated NSE/BSE share-count records keyed by equity ISIN. Each record must include `sharesOutstanding` (a positive safe integer), `effectiveDate`, and a direct HTTPS exchange `source` URL. Add a new dated record after an allotment, cancellation, split or bonus; the latest effective record wins. Counts with future effective dates or unofficial source domains are rejected. This is a reviewed dataset, not an automatic full-exchange filing feed.

When a Zerodha quote is available, official shares × INR quote produces INR market cap, converted to USD for the site's common internal units. Without an official count, the existing dated-cap/price estimate remains marked ≈. No market cap is calculated from traded volume. The market-wide reference sweep now reads NSE issued-share data for all eligible directory ISINs, preferring entries without financial snapshots. The backend refreshes these records daily while running. Reviewed BSE notices are kept separately in `dist/reviewed-shares.json`; initial NSE-on-BSE coverage uses 2,475,000,000 shares, effective 24 September 2026, notice 20260923-39. BSE reference API access is currently unavailable, so remaining BSE-only share counts are pending. Further company coverage and corporate-action updates require verified filings; do not infer the total from IPO offer size or free float.

### Coverage audit and IPO dates

Run `node coverage-audit.mjs` to produce `.local/coverage-audit.json`, with missing market-cap inputs, unmatched snapshot identities and recent IPO source records. `node reference-data.mjs` refreshes official NSE share counts and IPO history. The server also refreshes supplemental IPO calendars daily, joining companies by ISIN after matching their exchange identity, and preserving provenance. Official NSE history and reviewed BSE notices take precedence over broker and IPO Central calendar dates. `[NEW]` and the Rankings-only New listings filter use a rolling three-calendar-month window in Asia/Kolkata. Transfers and secondary listings are not inferred to be IPOs from directory discovery dates.

Logos retain existing source images and use Dhan symbol images as a fallback; broker calendar images are used when present. If an image is unavailable, company initials are shown. This is not a claim of verified logo coverage for every security.
