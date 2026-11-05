# Chart quality review

Updated 1 November 2026. Scores are an expert implementation review, not a user-study result. Each iteration will report this same set of aspects. 8 means sound and usable with minor limitations; 9 means polished; 10 is reserved for fully validated excellence.

## Current iteration — provisional scores

Scope: individual price and annual market-cap charts, comparison overlays, market map, revenue/profit scatter, largest-company bars and sector composition.

| Aspect | Score / 10 | Evidence and remaining work |
|---|---:|---|
| Data accuracy and transparency | 8 | Shared comparison timestamps, ordinary shares × price, matched-identity aggregates, source-period notes and missing-data states. Financial coverage remains partial. |
| Axes and labels | 8 | Round currency ticks, IST dates, zero references and loss-aware scatter domains; narrow layouts checked. |
| Hover details | 8 | Actual observations, currency values, compact displaced tooltips and focus support. |
| Timelines and controls | 8 | Eight price ranges, visible-series toggles, company finder, scatter metric/sector/scale controls. Annual source has fewer available ranges. |
| Drag comparison | 8 | Snapped endpoints, actual price and percentage differences, pinned selection and keyboard equivalents. |
| Colours and contrast | 8 | Red losses, green gains, stable categories and comparison dash patterns; market-map label contrast tested. |
| Animation | 8 | Gentle reveal and hover transitions; reduced-motion rules present. Reduced-motion runtime verification remains open. |
| Mobile layout | 7 | Price and scatter layouts checked; latest responsive market-map change still needs rendered verification. |
| Keyboard accessibility | 8 | Roving scatter focus, line-chart navigation, sector activation and focus details. No assistive-technology user study. |
| Image downloads | 7 | All chart families exported previously; latest market-map export changes still need image verification. |

These are provisional aspect scores across the reviewed surfaces, not a claim that every chart has passed final acceptance. The goal remains active because mobile and export checks are unfinished.

## Verification for this iteration

All 37 automated tests passed on 1 November 2026, including chart scales, shared timestamps, IST markers, negative values, market-map areas/contrast/reflow, identity matching, calendar periods and INR valuation invariance. Browser checks from the preceding work covered price timelines, comparison drag/legend interaction, mobile axes, scatter selection, sector filters and chart downloads. The latest map layout/export edits require a new browser check before their scores can rise.

## Reporting convention

After each subsequent implementation iteration, append the changes, the same aspect scores, remaining limitations and verification evidence. Do not silently replace provisional scores with final scores. Completion requires every aspect to reach at least 8 with its pending checks resolved.

## Next iteration — export consistency and verification access

Comparison image legends now retain the exact dash pattern of each plotted series, including the fourth series' dash-dot pattern. Previously the exported legend reduced both dashed variants to the same pattern. Both changed JavaScript files passed syntax checks.

| Aspect | Score / 10 |
|---|---:|
| Data accuracy and transparency | 8 |
| Axes and labels | 8 |
| Hover details | 8 |
| Timelines and controls | 8 |
| Drag comparison | 8 |
| Colours and contrast | 8 |
| Animation | 8 |
| Mobile layout | 7 |
| Keyboard accessibility | 8 |
| Image downloads | 7 |

Scores remain provisional and unchanged. The preview server was restarted successfully. The browser service reports that local browser use is disabled in Work settings; therefore fresh rendered mobile and export verification cannot proceed yet. No alternative browser connection was used to bypass that setting. User action to enable browser access has been requested. The goal remains active.

## Iteration — individual Zerodha history and expanded ergonomics scope

Browser access is working again through the available browser tool. Individual company entry links now open Price history first. Historical lookup can resolve the company ISIN without a live quote, preferring NSE and supporting BSE-only equities. Market-cap history remains separately labelled annual source data; historical share prices are not presented as historical market caps. No GitHub publication was performed for this iteration, as requested.

Verified Reliance 1M: 20 daily observations, 1–30 October 2026. Verified 1D: 72 five-minute observations, IST axis from 09:15 to 15:10; the incomplete closing-session coverage is explicitly disclosed. Home-key readout showed the first real observation and price. All 38 tests passed, including the new ISIN lookup test. Screenshot: zerodha-history-preview.png.

| Aspect | Provisional score / 10 |
|---|---:|
| Data accuracy and transparency | 8 |
| Axes and labels | 8 |
| Hover details | 8 |
| Timelines and controls | 8 |
| Drag comparison | 8 |
| Colours and contrast | 8 |
| Animation | 8 |
| Mobile layout | 7 |
| Keyboard accessibility | 8 |
| Image downloads | 7 |
| Alignment and page ergonomics (expanded scope) | 7 |
| Aesthetics, shapes and sizes (expanded scope) | 7 |

The newly requested site-wide design aspects still require a full review across pages. Remaining lower scores are not final acceptance. Goal remains active.

## Final iteration — responsive layouts, exports and design consistency

Completed 1 November 2026 in the local preview. GitHub publication remains paused.

Changes: mobile navigation now has its own complete row; small bar-chart rows no longer inherit oversized logos; desktop summary chart cards share equal dimensions; comparison colours brighten in dark mode; exported legends preserve all dash patterns; market-map exports preserve 30 weighted rectangles and their labels. Quote labels now show the actual NSE/BSE symbol when an Indian Zerodha quote replaces an overseas financial-source quote. Sector totals use the same matched-identity universe as the charts. Missing historical instruments receive a specific explanation. Headings use short, direct names.

| Aspect | Previous | Final / 10 | Acceptance evidence |
|---|---:|---:|---|
| Data accuracy and transparency | 8 | 8 | Exact shared observations, native INR valuation, identity-based joins, source-specific quote labels, explicit missingness and partial-session notes. |
| Axes and labels | 8 | 8 | IST dates/times, round money ticks, actual-price stock axis, percent comparison baseline, negative profit domain and separate annual-cap labels. |
| Hover details | 8 | 8 | Observed prices/dates, compact displaced tooltips, keyboard readouts; mobile comparison tooltip remains within viewport. |
| Timelines and controls | 8 | 8 | Eight real-price ranges, annual-only supported ranges, scatter scale/metric/sector/finder and market-map count/sector controls. |
| Drag comparison | 8 | 8 | Actual endpoint price differences and returns; pinned selection, Escape and Shift+keyboard equivalents. |
| Colours and contrast | 8 | 8 | Red losses/green gains; 31 negative profit points verified red; four brighter dark-mode colours plus distinct dashes; map label contrast tests pass. |
| Animation | 8 | 8 | Normal reveal finishes at opacity 1; short hover transitions; reduced-motion CSS disables animations and transitions. |
| Mobile layout | 7 | 8 | At requested 390px viewport, measured page width equals 386px viewport; map reflows, three line-chart date ticks, all five navigation links available, bars have no inner scrollbar. |
| Keyboard accessibility | 8 | 8 | Line chart Home/End/arrows and Shift comparison, scatter roving focus/finder, native controls and focusable market-map/sector controls; theme button explicitly named. |
| Image downloads | 7 | 8 | PNG/SVG downloads exercised across families in prior and current iterations. Latest map XML: 30 rectangles, area 552960.0000000002 versus expected 552960, no invalid numeric text. PNG visually inspected. Sector PNG checked; comparison SVG has all four dash patterns. |
| Alignment and page ergonomics | 7 | 8 | Rank width 84px; rank and heading centres differ by under 0.01px. Compare headers/cells have matching widths. Desktop small cards are both 713.38px tall and about 585.65px wide. Stock, rankings, comparison, sectors and empty watchlist flows reviewed. |
| Aesthetics, shapes and sizes | 7 | 8 | Consistent blue theme, card spacing/borders, common logo sizes by context, restrained text hierarchy, compact controls and cap-proportional map labels. |

### Scope acceptance

Each chart family meets at least 8/10 for the applicable aspects above: individual Zerodha price charts; annual market-cap charts; comparison overlays; market map; revenue scatter; pretax-profit scatter; largest-company bars; sector composition. Timeline/drag controls apply to time series; category, metric, scale and selection controls apply to the other families. Missing data is an explicit state rather than an invented chart.

### Final verification

- 39 automated tests passed; all 15 client scripts passed syntax checks.
- Reliance daily and intraday history rendered from Zerodha. Mobile keyboard comparison from 1–30 October showed actual endpoint deltas for all four compared stocks.
- Current charts: 3156 matched companies with cap data, 564 with the selected financial data; missing financial records are disclosed. Sector shares sum to 100% before display rounding.
- Mobile map Top 30 and exported PNG/SVG checked; recent comparison SVG retains solid, dashed, dotted and dash-dot legends.
- Annual INR chart shows 0, 10, 20 and 30 L Cr with actual years. Missing-instrument stock page shows its explicit unavailable state. No client errors were reported by the final browser log check.
- Desktop and narrow layouts, light and dark themes, quote labels, empty watchlist and navigation reviewed. Temporary viewport override reset; light theme and USD restored.

### Practical limits

These are expert review scores, not external user-study measurements. A score of 8 means usable and verified with minor limitations, not perfection. No physical-device, screen-reader user study or reduced-motion OS session was performed. Historical market caps remain annual source observations; current shares are not backfilled across old price history. Zerodha history depends on login, instrument availability and its provider window (up to 20 years); incomplete sessions are disclosed. Financial coverage remains partial and separate source periods are not implied to be contemporaneous. Public GitHub Pages does not run the local Zerodha backend.

### Comparison batch transition — 2 November 2026
Comparison histories now commit once after all selected requests settle, preserving selection order. The previous chart stays mounted while loading; the existing 320 ms crossfade reveals the completed chart together. Missing histories retain their error handling. Superseded requests cannot overwrite the active range. Deferred-response tests cover out-of-order completion, errors and stale batches. Full checks: 114 passing. Visual smoothness remains unverified because local browser access is unavailable; chart quality stays 8.5/10 pending visual acceptance.
