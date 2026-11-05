# Data sources and interpretation

Updated 2 November 2026. This describes project provenance, not a fresh external-source audit.

| Dataset | Project source | Interpretation |
|---|---|---|
| Financial reference | dist/data.json; CompaniesMarketCap | 595 reference companies; source dates/coverage are stored with data |
| Broad equity directory | dist/instruments.json; Upstox, cross-referenced to Kite | Exchange listings; not certified complete company coverage |
| Price/history | Kite through local server | Requires configured credentials, login and account data permission |
| Alternative quote stream | GFD StreamAllSymbols | Requires configured endpoint/key and enabled exchanges |
| Official close import | Visitor-provided NSE/BSE UDiFF Final CSV | Dated closing prices, browser-local |
| Official share counts | official-shares.json and reviewed-shares.json | Dated, matched records; incomplete coverage |
| IPO dates | ipo-listings.json and supplemental-ipos.json | Official/reviewed records take precedence over supplemental calendars |
| Annual history | company-history.json | Selected companies and metrics only |
| FX | fx-reference.js; ExchangeRate-API | Dated reference rate, not intraday FX |
| Logos | Existing source URLs, Dhan fallback and calendar images | Best-effort images; initials if unavailable |

## Identity rules

Match companies using verified equity ISINs and exchange identity. NSE and BSE listings may represent the same company. Exchange-symbol pairs identify quotes; a symbol alone is insufficient across exchanges. Overseas depositary receipts are distinct securities and must not inherit an Indian ordinary-share quote without verified matching. First discovery in a directory is not an IPO listing date.

## Units and valuation

Reference monetary financials use USD billions internally; native equity quotes use INR per share and index levels use points. Currency formatting must respect the source units. Profit in the reference dataset means pretax earnings. Do not present it as net income.

Market cap from a quote requires a matched share count: shares outstanding × INR price. Never use traded volume, IPO offer size or free float as total shares. Official dated counts support verified calculations; fallback dated-cap/price estimates must retain their approximate label. Dates and reporting periods differ across metrics, so ratios are not automatically same-date valuations.

## Freshness and missing values

Financial snapshot prices/caps are dated; earnings and revenue were expanded on 31 October 2026 and have company-specific reporting periods. A connected socket proves transport availability, not fresh trading for every listing. Preserve per-quote timestamps and show stale/error states. A calendar market-open badge is not confirmation that the exchange is accepting trades.

Ranking trends use dated Zerodha prices over the latest 30 calendar days in IST, restricted to verified listing dates where known. They do not fall back to legacy illustrative paths. Stock/index comparison histories intersect actual timestamps before normalization; 5Y/MAX use weekly shared observations. Annual-history ranges remain limited to what annual source data can support. Null values remain null and sort after known values.

## Refresh and audit

Run node coverage-audit.mjs for the local coverage report. Run npm run refresh:reference for source refresh; this makes outbound requests and writes reference files. Source failures should retain previously verified data. BSE-only share coverage and automatic intraday exchange notice monitoring remain incomplete. Inspect output provenance and counts before publication.

Attribution and source links are in README.md and the browser's data views. Third-party availability or publication of this code does not establish redistribution permission.


## Reviewed identity changes (2 November 2026)

LTIMindtree’s LTIM→LTM symbol change and subsequent LTM Limited name change are backed by exchange circulars CML72948 and CML73700. The directory ISIN INE214T01019 joins the current listing; duplicate old/current financial rows collapse into the current identity without mixing their figures. Old ticker/name searches and bookmarked company links still resolve. Other unmatched legacy records are not automatically joined by similar names, particularly across mergers or demergers.

## Calculated metrics and ranking trends — 2 November 2026

See PARAMETER_AUDIT.md for every parameter, current reference coverage and calculation limits. Approximate Price / sales and separately labelled Pretax margin are calculated only with supported inputs. Ranking sparklines use Zerodha historical observations, not legacy illustrative trend shapes. Market-wide filling runs in the background; unavailable provider histories stay blank. Private history/trend caches live under .local and are excluded from publication.
