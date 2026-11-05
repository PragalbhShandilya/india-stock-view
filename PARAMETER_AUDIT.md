# Parameter audit

Verified 2 November 2026 against the current local files. Reproduce with `node parameter-audit.mjs`; detailed evidence is saved privately in `.local/parameter-audit.json`. This is a reference-data audit, not a count of live provider coverage.

Grain: 5,678 ranking rows, 5,653 matched identities. The 25 unresolved source identities remain separate rather than being joined by similar names. Counts below include reported and derived values after merging identities and applying reference valuations.

| Parameter | Available rows | Calculation / limitation |
|---|---:|---|
| Market cap | 3,216 | Current/reference price × verified outstanding shares where both exist. Otherwise retain dated cap or clearly marked price-scaled estimate; trading volume is never outstanding shares. |
| Shares outstanding | 3,194 | Official dated share records; requires maintenance after capital changes. |
| Revenue | 594 | Reported TTM source figure; price and volume cannot reconstruct sales. |
| Earnings | 594 | Source pretax earnings; must not be treated as net profit. |
| Price / sales | 569 | Added: market cap / TTM revenue, both USD billions. Marked approximate because source dates and FX bases can differ. Only matched identities and positive denominators qualify. |
| Pretax margin | 569 | Added: pretax earnings / revenue × 100, same-capture TTM source fields. Separately labelled from operating margin; negative earnings are allowed. |
| P/E | 4 | Reported values retained. Additional calculations need post-tax earnings and a consistent equity basis. |
| EPS | 0 | Needs earnings attributable to ordinary shareholders and weighted-average shares for the period. Current outstanding shares alone are insufficient. |
| Operating margin | 24 | Reported source values retained; requires operating profit for further calculations. |
| Dividend yield | 14 | Reported values retained; further calculation needs verified dividends per share and the relevant period. |
| Employees | 53 | Reported headcount; cannot derive from market data. |
| Price / book | 0 | Needs attributable book equity and consistent share basis. |
| Total assets | 0 | Needs financial statements. |
| Net assets | 0 | Needs assets and liabilities on the same reporting basis. |
| Total liabilities | 0 | Needs financial statements. |
| Total debt | 0 | Needs financial statements and a defined debt basis. |
| Cash on hand | 0 | Needs financial statements. |
| Volume | 3,189 | Reference observation count; connected Zerodha quotes may add coverage. Never used as outstanding shares. |
| Traded value | 0 offline | Connected provider value, or volume × average traded price when both fields exist. Latest price × volume is not used. |
| Stock price / day change | Default columns | Retained in the table; no duplicate parameter controls. Values keep their own quote provenance. |
| Cost to borrow | Removed from selector | No supported source. |

Derived values recalculate when inputs change and clear when required inputs disappear. Existing reported values are preserved. Hover details explain formulas and dates. Missing values remain blank rather than fabricated.

## Ranking controls

Select multiple parameters to add independent columns. Added columns sit directly to the left of the permanent Market cap column. Each can be sorted and removed independently. Rank/move continues to mean market-cap rank. Selected columns persist in this browser. Reset filters returns to the default market-cap table and clears added columns.

## Trend and chart basis

Ranking trends use actual Zerodha observations within the latest 30 calendar days in IST, clipped to verified IPO dates. Shorter histories occupy their calendar-day share of the width and align to the right. A one-observation listing displays a point; no history displays no invented line.

Selected chart ranges load first; other supported timelines warm in the background. Foreground history requests take priority over market-wide background work. Requests are shared and paced; historical results cache in memory and locally. This reduces repeat loading but cannot guarantee provider availability or cold-start latency.

Headline totals now exclude unresolved legacy identities and count each verified ISIN once, matching the market-chart universe. Those legacy rows remain searchable while they are reviewed. Five more verified symbol changes were merged on 2 November; reference coverage counts above reflect the deduplication.
