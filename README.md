# IndiaStockView

A data-focused Indian equity website with rankings, company profiles, market maps, financial comparisons, watchlists, and interactive charts.

## Features

- NSE/BSE company directory and 100-company ranking pages
- Sortable financial rankings with rank movement comparisons
- USD and INR display, including Indian number abbreviations
- Market-cap treemap, revenue/profit scatter plots, and sector breakdowns
- Comparison overlays and available annual company history
- Browser-local watchlists and comparisons
- PNG/SVG chart downloads and ranking CSV exports
- Official NSE/BSE closing-price CSV import
- Calendar-based market open/closed indicator

## Public website

The `Deploy website to GitHub Pages` workflow publishes `dist/` after changes to `main`. In repository **Settings → Pages**, select **GitHub Actions** as the source.

GitHub Pages hosts the static snapshot website. It does not run the local Node server, live-market feed bridge, or daily directory updater. No broker credentials are included or required for the public preview. Report imports and preferences stay in each visitor's browser.

## Run locally

Requires Node.js 22 or later. No package installation is needed.

```sh
npm start
```

Open http://127.0.0.1:4174/. Optional server-only feed configuration is documented in `.env.example`; never place API secrets in `dist/`.

```sh
npm test
```

## Data and accuracy

The bundled financial universe contains 595 reference companies. The directory adds securities from NSE/BSE broker instrument masters, deduplicated by ISIN where matched; coverage is not certified exhaustive. Company-equity directory data is derived from Upstox and cross-referenced with Zerodha's public instrument master.

Prices and market caps are dated source values. Revenue and pretax earnings were retrieved across all six CompaniesMarketCap India ranking pages on 31 October 2026, with 595 matching tickers for each metric. Reporting periods vary. `dist/data.json` records financial source links and coverage. Profit means **pretax earnings**, not net income. Market cap and financial metrics may have different dates and must not be interpreted as a same-date valuation multiple.

Some reference prices are overseas depositary-receipt quotes. Their identities are retained. Currency conversion uses a dated ExchangeRate-API reference rate, not intraday FX. Attribution is displayed when INR conversion is used.

The 30-day trend graphics contain independently normalized relative shapes, not dated historical prices or percentage returns. Approximate date markers are labeled accordingly. Annual market-cap history is available only for selected companies; unsupported time ranges are disabled.

## Official exchange report imports

In **Data sources**, select an official Capital Market/Equity **UDiFF Common Bhavcopy Final CSV** downloaded from:

- [NSE reports](https://www.nseindia.com/all-reports)
- [BSE bhavcopy](https://www.bseindia.com/markets/MarketInfo/BhavCopy.aspx)

Unzip reports before import. The importer validates schema, dates, ISIN and price fields, then matches the directory by ISIN, exchange and series. Imported closing prices are separate from existing financials and historical charts. Unmatched prices remain unavailable. Reports persist only in the importing browser, and the data panel can restore the original dataset.

No official exchange report is bundled or automatically loaded. Automated archive downloads could not be verified. No paid live-feed subscription is connected.

## Attribution

Financial reference data and company logo URLs: [CompaniesMarketCap](https://companiesmarketcap.com/india/largest-companies-in-india-by-market-cap/) / [CompaniesLogo](https://companieslogo.com/). Logos remain the property of their owners. FX reference: [ExchangeRate-API](https://www.exchangerate-api.com/). Instrument directories: [Upstox](https://upstox.com/developer/api-documentation/instruments/) and [Kite Connect](https://kite.trade/docs/connect/v3/market-data-and-instruments/).

Publication of this code does not grant redistribution rights to third-party market data, logos, or broker services. Obtain appropriate source permissions for production use.
