# Test report and acceptance plan

Updated 2 November 2026.

## Current evidence

Run `npm run check` to reproduce current asset-generation, syntax and automated tests. Dated iteration records below and WEBSITE_QUALITY_REVIEW.md record the latest counts and scope; older counts are historical evidence.

Earlier browser checks recorded authenticated Zerodha streaming, green/red quote pulses, keyboard-focus retention and restored comparison history. They predate the latest ticker/index/export work. Current rendered acceptance of those revisions is pending because browser-control tooling is unavailable. Current HTTP checks are not presented as visual verification.

GitHub publication is paused. These results describe the local checkout only.

## Automated suite

Run npm run check from the project directory with Node 22+ (release workflow pins Node 24). This discovers root test files and checks all client/server modules.

| File | Principal scope |
|---|---|
| request-policy.test.mjs | Loopback Host/port, browser-origin isolation and callback navigation exceptions |
| market-deltas.test.mjs | Complete/delta reconstruction, skipped updates, removals/restarts, input/count validation, bounded storage and non-price changes |
| chart-motion.test.mjs | Non-interactive crossfade cleanup and reduced-motion/initial-reveal boundaries |
| market-ticker.test.mjs | Native INR/point units, 50 verified constituents, shuffle membership/order and drag wrap geometry |
| ranking-interaction.test.mjs | Rebuilt sort focus, horizontal scroll, sticky column visibility and removal fallback |
| static-files.test.mjs | Public file boundary, sibling traversal, symlinks, null bytes and missing assets |
| history-queue.test.mjs | Foreground priority, pacing, shared queue recovery |
| calculated-metrics.test.mjs | Ratios, unit/input guards, recalculation and independent ranking columns |
| zerodha-trends.test.mjs | IST rolling window, IPO history, cache persistence, source identity and proportional sparklines |
| feed.test.mjs | GFD normalization, exchange identity, missing fields and old ticks |
| listings.test.mjs | Directory normalization, parsing and discovery differences |
| exchange-eod.test.mjs | Official report parsing, validation and matching |
| kite.test.mjs | Kite quote/frame/history-related adapter behavior |
| reference-data.test.mjs | Reference parsing, share/identity and valuation rules |
| ipo-calendar.test.mjs | Supplemental calendar parsing and company matching |
| chart-core.test.mjs | Chart mathematics, calendar markers, periods, layout and related invariants |
| data-loader.test.mjs | Independent source failures, core fallback, retry, history schema and request concurrency |
| http-response.test.mjs | Compression, cache isolation, conditional requests and HEAD responses |
| page-metadata.test.mjs | Route identity, descriptions and malformed deep links |
| ui-utils.test.mjs | Preference recovery, HTML/CSV boundaries, startup retry, real quote movement and feed failure status |

The Pages workflow uses the same complete check command. It does not perform browser visual acceptance or provider login verification.

## Manual release pass

1. Open rankings, search/sort/filter, paginate and navigate directly to a bookmarked company route.
2. Verify an ordinary NSE/BSE security, a directory-only company and a distinct overseas receipt.
3. Switch currencies; verify native INR quotes, USD-billion financials, attribution and unchanged valuation meaning.
4. Save watchlist/comparison selections, reload and remove them.
5. Exercise chart timelines, hover/focus, keyboard navigation, drag comparison and legends.
6. Check wide and narrow screens, reduced motion and chart PNG/SVG exports for clipping, date and unit labels.
7. Import valid NSE and BSE close reports, reject malformed/mismatched files, reload and restore the original dataset.
8. With an authorized account, check real quotes/history, expired login, disconnect/reconnect and stale timestamps.
9. Check static hosting separately: no broker secret or .local file, visible snapshot provenance and graceful unavailable API states.

Record date, revision, environment, command/result, screenshots or output, and remaining failures for each pass. Never paste authenticated URLs, tokens or session data into evidence.


2 November responsive/export pass: phone Rankings/Charts/Compare/company and tablet Compare/Sectors fit within the document width. Watchlist add/reload/remove and sector-to-rankings filtering verified; test state restored. Real market-map, scatter, sector, comparison and price PNGs inspected; largest-companies SVG downloaded. Phone scatter and price export layout defects repaired and rechecked. Annual/dark/INR/SVG combinations remain on the acceptance checklist.

2 November identity/safety pass: official LTIM→LTM mapping verified, duplicate canonical ISIN eliminated, old/current searches return one entry and old bookmark loads current prices. Keyboard Home/Shift+Right/Escape verified. External URL boundary tests reject unsafe schemes, credentials and control characters. Fixed the utility-test initialization race. Shared checks now verify content hashes in the browser asset references.

2 November recovery/flow pass: temporarily withheld supplementary IPO data, confirmed usable live comparison page with named-source notice, restored file, retried and confirmed full recovery. All seven ranking columns sorted correctly both ways across 100 rendered rows. Pagination, company→Back page preservation and changed-sector reset verified. Local source file and default filters restored.

## Latest local acceptance

On 2 November, all four compared company lines completed after restarting the backend. Switching the warmed comparison chart to 5Y completed in 278 ms in a browser check. Earlier single-company warm switches took 281–292 ms; first visible chart took 405 ms. These measurements describe this local cache/session, not a provider cold-start guarantee. The new static-file test uses a temporary sibling folder and external symlink and verifies both are denied, with and without a trailing slash on the public root.

## Ticker and identity acceptance — 2 November

The running local API returns seven real index quotes separately from company quotes: Nifty 50, Sensex, Nifty Bank, Nifty Next 50, Nifty IT, Nifty Midcap 100 and Nifty Smallcap 100. Index packet layouts and units are tested separately from equities. The Nifty 50 constituent file was retrieved from NSE Indices and contains 50 distinct ISINs. Stocks shuffle once per load and retain order during updates. Index order starts Nifty 50, Sensex. Two independent rows are implemented; drag, hover/focus pause and reduced-motion behavior are present. Visual/pointer acceptance is pending because local browser inspection currently reports disabled access. Do not treat passing mathematical checks as visual acceptance.

Five more official symbol changes merge into one row each. Integration audit confirms each canonical symbol retains its ISIN, dated revenue and old aliases, with one company row per identity. Reference audit: 5,678 rows, 5,653 matched identities, 25 unresolved, 569 calculated P/S and pretax margins.

Latest local security acceptance is recorded in WEBSITE_QUALITY_REVIEW.md Iteration 10 and SECURITY_AND_PRIVACY.md. It includes real HTTP rejection codes, retained provider connection and isolated fake-session tests.

The actual readFeed adapter is exercised through full, changed-only and unchanged responses. Running-server transfer results are recorded in PERFORMANCE_AUDIT.md; current full suite is 108 tests.

### Public entry-page acceptance — 2 November 2026

Local HTTP checks passed for rankings, Reliance, M&M, ICICI Life, compare and watchlist. Verified correct titles, stable root asset resolution, successful route-entry script responses, 308 trailing-slash redirect with query preservation, unknown-company 404, watchlist noindex and sitemap exclusion. Sitemap contains 5,658 public URLs, including 5,653 company pages. Evidence: .local/public-pages-audit.json (private local audit). Unit checks cover escaping, identity coverage and mocked route navigation; actual browser history/back navigation and social previews remain pending.

### Chart accessibility — iteration 15

116 checks pass. New regression coverage verifies lazy source-observation tables, semantic headers, safe company text, keyboard focus/Home/Escape/refocus, and recovery after a cancelled pinned drag. Existing reduced-motion and simultaneous comparison-batch tests pass. Actual screen-reader announcements, tab ordering and mobile table/gesture layout need browser acceptance; these checks are not a substitute.

### Refresh recovery — iteration 17

119 checks pass. Actual poll-callback tests verify that transient transport failure preserves existing generic-feed prices and avoids a redraw, then applies the next successful prices. Additional tests cover retained provider/configuration/authentication, zero live sockets after transport failure, and invalid/future trade-time freshness. The running local server delivered the updated assets over HTTP. Real broker outages and browser/offline-mode acceptance were not exercised.

### Clickable ticker, index charts/comparison and weekly long ranges — iteration 21

129 checks pass. Regressions cover stock/index routes, matched renamed company identities, seven allowlisted comparison candidates without ranking pollution, click-vs-drag suppression, index lookup/cache/point-unit metadata, real renderer formatting in USD and mixed comparisons, and weekly shared-observation sampling. Actual local Zerodha HTTP checks returned 20 observations for each of seven 1M index histories. Nifty 50 and Sensex 5Y returned 1,240 daily observations each; shared weekly rendering produced 262 points each with axis labels 2022–2026. Private local evidence: .local/index-history-audit.json and .local/index-weekly-audit.json. Actual visual link clicking, measured ticker geometry, mobile rendering and exports remain unverified in a browser.

### Comparison consistency — iteration 22

131 checks pass. Actual comparison-renderer coverage now asserts exactly one price/level row, index-only level/day-change fields and mixed-comparison inapplicability. Actual refresh-function coverage verifies level/day change continue updating the correct filtered rows. Malformed index route decoding is explicitly non-throwing. Browser visual acceptance remains pending.

### Estimated cap presentation — iteration 23

132 checks pass. Shared metric output tests verify approximate-cap labels and safe basis text, preserve exact/missing-value behavior and retain independently derived ratio annotations. Company cards and ranking value annotation now use this shared rendering path; comparison already uses it. Actual rendered readability/hover acceptance remains pending.

### Static image exports and recovery — iteration 25

138 checks pass. New export tests cover static SVG labels/styles without interactive keyboard/focus attributes or hover artwork; PNG success and temporary URL cleanup; image decoding failure and null canvas blobs; 15-second decoding timeout; SVG click failure with cleanup/correct retry text; and exporting while a timeline is busy. Controls restore their label/enabled state and clear aria-busy. These are simulated DOM/image/canvas tests, not actual decoded/downloaded-image acceptance. Browser appearance, PNG conversion and export downloads still need visual verification.

### Operating documentation — iteration 26

140 checks pass using bundled Node v24.22.1. New checks resolve relative documentation links and validate documented npm scripts/direct Node entry files against the package and checkout. Current guides were also manually reconciled against source; command/link existence is not a substitute for semantic review. Earlier browser evidence remains historical and current rendered acceptance remains pending.

### Current rendered comparison and live ticker — iteration 28

144 checks pass. Real browser checks verified comparison button grouping and 38px heights, no page overflow at 386px/1,024px CSS widths, live four-series 1M history and Nifty50 search recovery. Final desktop ticker measurement: 50 symbols, zero clipped, 3px price-change gap, ~44px strip height. Visible-browser reads 67 seconds apart showed 26 price text changes and 50 movement-version advances. Native/FX/source/failure and reduced-motion boundaries are covered by source regressions; a 5,000ms single polling interval is explicitly tested. Full visual accessibility, animation appearance, exports and final ticker-mobile acceptance remain open.


### Iteration 29 — single-line stock ticker (3 November 2026)

Per the latest request, stock symbol, price and change now share one horizontal line. Compact 9/10/9px typography and tight gaps retain measured item widths, drag/click behavior and price glows. The separate index strip remains above the stocks.

Verification: 144 automated checks passed after asset versioning. A freshly reloaded browser measured all 50 stock items on one line with zero clipped symbols. Screenshot: /tmp/isv-single-line-ticker.png. Scores unchanged: navigation/core, local security, privacy/preferences and documentation/operations 9; data coverage/freshness 8; all remaining aspects 8.5. Goal active; GitHub updates paused.


### Iteration 30 — phone header audit and source control location (3 November 2026)

Previous iteration was progress: single-line ticker implemented and measured. Current supported-browser audit at 390px requested width (386px content viewport) found no document overflow and no overflowing stock ticker items. It also found the top Data sources button contradicted the user's earlier removal request and occupied a separate mobile header row. Moved the existing live connection button to the footer as Data connection, preserving its ID/handler and the existing Sources & methodology link. Fresh browser reload confirms the button is in the footer and absent from market actions, with document width equal to viewport width. Screenshot /tmp/isv-mobile-audit-30.png. Temporary viewport override reset. This is concrete responsive evidence, not full-site responsive acceptance.

Scores unchanged: navigation/core, local security, privacy/preferences and documentation/operations 9; data freshness/coverage 8; visual hierarchy, responsive layouts, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, exports, metadata/sharing and maintainability/tests 8.5. Goal remains active. GitHub updates paused.


### Iteration 31 — inspectable scatter values on phones (3 November 2026)

Previous iteration was progress (phone audit and connection control placement). Current rendered charts audit confirmed a 386px phone content viewport with no page overflow, but dense scatter marks needed a precise table alternative. Added a collapsed View chart data disclosure using the actual plotted subset, signed revenue/pretax-profit values, market caps, currency units and approximation marks. It builds semantic scoped headers and text-only cells on first expansion, has a bounded keyboard-scrollable region and adds no initial table row cost. Empty plots add no table.

Evidence: 145 checks pass. New regression covers lazy single construction, plotted subset, negative profit, literal company text, USD units, estimated caps, semantic scopes and empty data. Current browser verified 569 revenue points equal 569 table rows; Technology/pretax-profit filtering produced 28 points and 28 matching rows with correct headings. Phone page width remained 386px with no overflow. Screenshot /tmp/isv-scatter-data-mobile.png; temporary viewport reset. Existing chart selectors and chart interactions preserved. Full-site visual/export acceptance and source coverage remain incomplete.

Scores unchanged: core/navigation, local security, privacy/preferences and documentation/operations 9; data freshness/coverage 8; visual hierarchy, responsive layouts, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, exports, metadata/sharing and maintainability/tests 8.5. Narrow component evidence does not establish whole-category acceptance. Goal active; GitHub updates paused.


### Iteration 32 — actual downloaded image and CSV acceptance (3 November 2026)

Previous iteration was progress (lazy scatter table and filtered phone verification). This iteration supplies missing end-to-end export evidence rather than another implementation-only claim. Used the supported browser's real download controls and opened downloaded PNGs for visual inspection: Technology-filtered pretax-profit scatter, market map, sector donut, four-stock normalized comparison, dark NIFTY 50 native-point history, Reliance annual market cap and INR Reliance price history exported from a 390px phone viewport. All seven PNG files have valid PNG signatures and 2400px width; all were visually inspected for readable titles, units, axes/labels and series/legend where applicable. The largest-companies SVG parsed as valid XML and retained company/value labels. The 7-company Reliance-filtered ranking CSV retained its explicit source-unit metadata, 43-column header and seven consistent 43-field matching rows. The individual-company CSV button remains hidden, as requested. No application change was needed for these successful paths.

Evidence inventory: .local/export-browser-audit-2026-11-03.json. Download files remain in the user's Downloads folder. Prior 145-check suite covers export clone cleanup, initial/loading states, decode errors, timeout, null PNG output, download failure and URL/button recovery; this turn did not change application code, so no redundant suite rerun. Restored USD/light theme, cleared search and reset viewport. Screenshot /tmp/isv-export-audit-preview.png. One pointer click on the moving Reliance ticker did not navigate; keyboard activation succeeded. Investigate pointer behavior next rather than claiming full interactive acceptance.

Export rating rises from 8.5 to 9 based on actual downloaded-family, theme, currency, mobile and filtered-CSV evidence plus existing failure-path regressions. Current scores: core/navigation, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, responsive layouts, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Goal remains active; GitHub updates paused.


### Iteration 33 — ticker gesture thresholds and rendered navigation (3 November 2026)

Previous iteration was progress: actual image/CSV downloads supplied export acceptance. Investigated the observed pointer-navigation failure using current DOM geometry and screenshot. The earlier ticker was partially under the sticky header at scrollY ~79px; a fully visible Coal India ticker link opened correctly by pointer. This does not establish a general click failure. Separate code inspection found confirmed gesture defects: pointer movements below the 5px threshold were already scrubbing the animation/scroll position, and an uncommitted press leaving the strip could retain its dragging pause. Updated the handler to leave positions untouched before threshold, continue scrubbing a committed drag even when returning inside the threshold, and clean up uncommitted pointerleave without interrupting captured drags.

Evidence: 146 checks pass. New behavioral regression exercises animation and scroll-backed ticker paths, 4px jitter, pointerleave cleanup, captured-drag continuation and post-drag click suppression. Supported browser verified a 300px stock drag preserved the current route and cleared dragging state; the next HDFC Life pointer click opened its company page. At a 390px requested phone viewport, a 190px index drag scrolled the index row by ~190px without navigation; the following NIFTY BANK click opened its chart. Screenshot /tmp/isv-ticker-navigation-mobile.png. Temporary viewport reset. Existing keyboard/normal-click tests retained.

Scores unchanged: navigation/core, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, responsive layouts, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. The goal remains active; GitHub updates paused.


### Iteration 34 — unresolved identities no longer receive current ranks (3 November 2026)

Previous iteration was progress (ticker gesture correction with desktop/mobile evidence). Applied the data-quality skill as a scoped companion to the website audit. Current local coverage audit reads one row per verified ISIN plus separate unmatched legacy rows: 5,554 rows, 5,529 directory ISINs, 3,184 attached official share counts, 2,343 rows missing both official shares and prior market-cap inputs; 2,324 of those are BSE-only. Financial snapshot asOf is 2026-10-30, official shares updatedAt 2026-11-03 and reviewed shares updatedAt 2026-11-02. These are local-file dates, not evidence of full exchange completeness or fresh API probing. The missing-input rate is ~42.4% of matched directory companies; this is a high-severity coverage limitation, with high confidence in local counts. Additional verified BSE share-count records are needed; price or volume alone is insufficient. No broad exchange access claim was inferred from this local run. Corrected the audit's hard-coded historical API-denial wording accordingly.

Found a high-severity consistency defect: all 25 unmatched legacy rows had historical source values and could receive ranks even though chart totals excluded them. This could place old/de-merged company identities among current companies. Rows explicitly marked isin:null by directory matching now receive no rank, sort below matched entries for numeric ranking sorts, remain searchable, and show Identity unverified. Company rank/detail claims and related-current-company selections follow the same exclusion. Market-cap availability counts now exclude unresolved rows. Ranking history uses a new version key so the policy correction does not create artificial position-movement arrows. Historical values remain inspectable and are not reassigned to new listings without evidence. Exact-name/symbol resolution of the 25 remains future work.

Evidence: 147 checks pass after correcting a syntax issue caught by the first check run. New behavioral regression proves exclusion from rank state, retention in search, numeric-sort placement, no company-page rank and history versioning. A fresh browser search for Tata Motors showed two matched current listings with ranks and the legacy TATAMOTORS.NS row unranked with Identity unverified. The legacy company page explicitly states Current listing identity unverified / excluded from rankings. Screenshot /tmp/isv-verified-ranking-identities.png. Search cleared and full rankings restored. Inspectable audit: coverage-audit.mjs and .local/coverage-audit.json. No SQL/Python analysis notebook was needed: the existing JavaScript audit runs the actual website identity/share attachment code.

Scores unchanged: core/navigation, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, responsive layouts, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. This fixes a correctness issue but does not resolve the substantial missing source coverage. Goal active; GitHub updates paused.


### Iteration 35 — responsive route matrix and narrow-header correction (3 November 2026)

Previous iteration was progress (unresolved identity rank exclusion). Tested the actual rendered website through the supported browser at requested 320px, 768px and 1280px widths (317/760/1267px CSS content widths). Matrix: Rankings, Sectors, Charts, Compare, empty Watchlist, long-name ICICI Prudential Asset Management company, NIFTY 50 index, methodology and missing-company recovery — 27 route/width combinations. All had document width equal to viewport width; measured primary chart cards stayed within the document. Rankings/comparison tables and ticker/metric strips intentionally retain their own horizontal scrolling. Phone connection dialog fits between ~9.5 and 307.3px, has ~750px client height and 930px scroll height, keeping its long controls internally scrollable. Representative screenshots were visually inspected, including phone sector/compare/company/index/error/methodology, tablet compare/charts and desktop company.

Visual inspection found that a 320px header's brand overlapped its theme control despite no document overflow. Added a <=360px rule with smaller brand/mark, tighter header spacing and narrower controls. Reduced navigation spacing so all five labels fit the available width. Final browser measurement: brand right 197.4px, theme left 203.4px, nav client/scroll width 293/293px. The Watchlist link at the far right opens correctly. Screenshot /tmp/isv-responsive-header-fixed.png; full evidence .local/responsive-browser-audit-2026-11-03.json. Earlier primary screenshots in /tmp/isv-responsive-* predate the correction; supporting/index/missing and final-header captures include it. Restored default viewport and full rankings, cleared audit search, retained watchlist/comparison selections.

Responsive-layout rating increases from 8.5 to 9 based on the broad rendered normal/empty/error/dialog matrix plus prior lower-chart, drag, table-scroll and mobile-export evidence. Visual hierarchy remains 8.5 because this is not a full content/hierarchy acceptance pass. No new implementation-mirroring CSS test added; existing suite and generated assets checked. Other outstanding source, chart-range, recovery, accessibility, metadata and architecture gates remain explicit.

Current scores: navigation/core, responsive layouts, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Goal active; GitHub updates paused.

## 3 November 2026 — iteration 36

154 checks passed: new cases cover once-per-row trend derivation on 5,500 rows, composition/debounce/removal behavior, versioned immutable caching versus changed/private data, independent series baselines, independent weekly selection, calendar placement, unavailable hover/drag endpoints, full OHLCV table fields and reuse of cached daily history. Generated pages/assets and 25 browser scripts pass checks. Node component benchmark and limitations: PERFORMANCE_REVIEW.md. Browser verified compact centered ticker, lazily loaded export controls, later NIFTY IT start with unavailable early hover, Reliance full price chart (2000–2026), and the open/high/low/close/volume table. No slow-device/network score or production deployment claim.

Final browser acceptance: refreshed MAX comparison spans 5 January 1996–3 November 2026, retaining 1,401 weekly Reliance observations, 1,241 each for Bharti Airtel/HDFC Bank, and 1,606 for NIFTY IT. SVG starting x coordinates differ (~185, ~265, ~265, ~78), confirming no common-start stretching. On-demand export produced “Chart downloaded as SVG”. Screenshot /tmp/isv-independent-comparison.png; company screenshot /tmp/isv-company-zerodha-history.png. Earlier 20-year audit results are superseded by this larger provider window. Preview tabs retained.

## Iteration 37 — loading layout stability

154 checks pass. Actual browser diagnostic identified supporting-status insertion/removal and footer relocation as primary loading shifts. Cumulative loading-shift total: default viewport 0.5434 → 0.0013; final phone pass 0.0172. Phone content/document width 386/386px. Screenshot /tmp/isv-stable-loading-phone.png; evidence .local/loading-layout-audit.json. Temporary phone viewport reset. Diagnostic is explicitly a cumulative sum, not a standard CLS session-window or real-user score. No new dependency or production publication.

## Iteration 38 — chart matrix and metric tabs

156 checks pass. Browser completed all 8 company and all 8 mixed stock/index comparison timelines under the new independent-history policy. Domains, calendar markers, weekly counts and independent starts inspected. Added price-domain and real-observation hover tests. Company tab direct mouse test retained scrollY 362.871px exactly. Route regression covers native fragment reset and changing company. Evidence .local/chart-timeline-audit-iteration38.json and /tmp/isv-company-tabs-preserve-position.png. Temporary diagnostic removed. No deployment.

## Iteration 39 — history input boundary

159 checks pass. Added malformed-record/retry, old-cache-expiry ownership and historical instrument/unit/provider/range validation regressions. Real local-server responses passed the actual getPriceHistory function in an isolated Node VM: Reliance 1M/INR/21 observations; NIFTY IT 1M/POINTS/21 observations. No browser screenshot needed for this nonvisual request-validation change. Outage/reconnect and constrained-device acceptance remain outstanding; reliability remains 8.5.

## Iteration 40 — accessible navigation/history

161 checks pass. New regressions cover destination-heading focus, returning to original ranking control/page/scroll offsets including a hashless source URL, and exactly one route render for popstate followed by hashchange. Actual keyboard browser test verified Reliance button Enter -> H1 focus; Back -> ranking table and original data-company=1 button. Reports Enter exposes selected aria-current=page and retains focus. Screenshot /tmp/isv-keyboard-company-reports.png inspected. Temporary QA tab; no deployment.

## Iteration 41 — rank-history readiness

162 checks pass. New regression runs currentRankingState and rank badges through complete/partial/failed-source/recovery and true-rank-change phases. Incomplete source states cannot write saved history or generate movement arrows; actual complete changes still do. New v3 history baseline excludes old potentially provisional states. Re-ran coverage-audit.mjs: 3,184 official counts; 2,343 missing cap inputs; 25 unresolved snapshot identities. No visual UI change or new browser screenshot claimed.

## Iteration 42 — source availability and warming retries

163 checks pass. New test covers failed HTTP warming, unacknowledged queue response, successful retry and duplicate suppression. Current BSE source definitions verified through official public files, but active-equity data returned 403 on both bounded attempts. No data ingested; .local/bse-source-audit.json archives evidence. This does not certify a BSE bulk schema or improve measured coverage. No browser/screenshot claim for this request-layer change.


### Iteration 43 — accessible ranking pagination (4 November 2026)

Previous turn: progress verified by 163 passing checks and recorded BSE-source evidence. Pagination already focused the replacement ranking table, but numbered controls lacked current-page semantics and page changes did not announce the resulting range. Added named page buttons, aria-current=page on the selected numbered button, and an explicit action-only announcement of the actual clamped page and company range. Routine quote refreshes do not invoke this announcement. Pagination scrolling now respects prefers-reduced-motion. Extracted changeRankingPage and executed its real implementation with both motion preferences and a requested page beyond the final page; it announces the rendered final range and focuses the table without extra page scrolling. 164 checks pass. Asset versions regenerated. No fresh browser/screen-reader acceptance claimed, so accessibility remains 8.5.

Scores unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8. GitHub paused; goal active.


### Iteration 44 — keyboard focus through price-chart resizing (4 November 2026)

Previous iteration: progress (pagination semantics and reduced-motion handling, 164 checks). Current code inspection found that responsive price-chart redraws replace the focused SVG. The drawing now records whether that exact plot owns focus and restores focus to the new interactive SVG with preventScroll after interaction/animation setup. Legend and timeline controls keep their own focus; disconnected charts cannot take focus. The outgoing animation clone is appended after the real SVG and already excludes keyboard focus. A behavioral test executes the real restoration helper for focused, externally focused and disconnected cases; integration assertions verify capture/restore placement. 165 checks pass and generated assets are versioned. No fresh browser or assistive-technology acceptance claimed. Broader accessibility remains 8.5.

Ratings: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8. Goal active; GitHub updates paused.


### Iteration 45 — running-preview pagination acceptance (4 November 2026)

Previous turn: progress (responsive chart focus correction and 165 passing checks). Browser initially returned connection refused; confirmed no listener on 4174 before restarting the existing local server. Server now running under session 90518 on loopback with the configured backend; no credentials changed. Fresh temporary browser tab loaded the current rankings. Real keyboard Enter on Page 2 produced 100 rows, aria-current numbered control 2, focus on the ranking region, and exact live-region text “Page 2. Showing 101–200 of 5560 companies.” This closes browser acceptance of iteration 43 pagination semantics, but is not an actual screen-reader speech test.

Comparison navigation displayed four retained selections and the loading state. A subsequent browser observation was denied by automatic approval review because access was being requested for the external kite.zerodha.com brokerage origin. Stopped browser work without accessing that origin or attempting a workaround. No responsive redraw acceptance or screenshot claimed. Inspected local historical endpoint: errors return JSON 401/503, and chart code offers an explicit Connect link; no automatic external-navigation statement is supported by the inspected local history path. Cause of the tool's external-origin approval request remains unverified. Temporary QA tabs unmarked; existing user tabs untouched. No code change this iteration, so no redundant test rerun; last verified suite remains 165 pass.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8. Goal active; GitHub paused. Next acceptance should stay on local-only routes and must not access the blocked brokerage origin without explicit approval.


### Iteration 46 — semantic comparison table and keyboard scrolling (4 November 2026)

Previous turn: progress (preview restored and real pagination acceptance). Inspected current comparison markup: metrics were td cells and company headers lacked explicit scope; overflow wrapper was not keyboard-focusable. Comparison now supplies scope=row metric headers, scope=col company/metric headers, a screen-reader caption and a named tabindex=0 horizontal-scroll region. Updated CSS restricts 94px header height/tint to the column-header row and applies row stripes/hover/borders to both row headers and value cells, preserving compact metric rows and sticky first-column behavior. Existing render regression executes real comparison rendering for mixed and index-only selections and now verifies semantic metric cells, caption, column headers and scroll region. All 165 checks pass; asset versions regenerated. No browser acceptance or screenshot claimed this iteration; previous external brokerage-origin denial is not retried. Accessibility remains 8.5 pending full local-only browser/assistive-technology verification.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8. Goal active; GitHub paused.


### Iteration 47 — indices appear only in comparison charts (4 November 2026)

User clarification: indices belong in charts, not the financial comparison table. RenderCompare now derives company-only columns while passing the full mixed selection to the overlay/history chart and selection controls. Table widths/count reflect only companies; an index-only selection keeps its chart and omits the table entirely. Stock-price metric label no longer mentions index levels. Live table refresh and price/cap pulse mapping apply the same company filter, so an index before a company cannot shift updates into the wrong column. Updated rendering regression covers mixed selection and index-only selection, and actual live refresh regression verifies company values when an index leads the selection. All 165 checks pass; asset versions rebuilt. No browser screenshot or renewed external brokerage-origin access claimed. GitHub paused, goal active.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8.


### Iteration 48 — chronological and internally consistent chart observations (4 November 2026)

Previous turn: progress (company-only comparison tables with mixed-selection quote alignment). Inspected the actual getPriceHistory response boundary: record shape, identity and prices were validated but chronology and candle bounds were not. It now rejects adjacent timestamps that are not strictly increasing by parsed instant, including identical instants with different timezone spellings. It also rejects supplied high/low values inconsistent with close, open or each other. Missing optional OHLC fields remain supported; no values are invented, reordered or averaged. Rejection uses the existing request-owned cache eviction and retry path. Regression runs the actual request function against reversed, duplicate, equivalent-zone timestamps and impossible candle bounds, then verifies a valid series recovers and is cached. 166 checks pass; generated asset versions updated. No live-provider or browser verification claimed this iteration. Goal active; GitHub paused.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8.


### Iteration 49 — bounded history-chart resize observation (4 November 2026)

Previous turn: progress (history chronology/candle validation). Inspected chart lifecycle for accumulated work. SVG listeners are attached to discarded drawings, while each successful history rendering created a new local ResizeObserver that only disconnected if a later resize callback noticed detachment. Replaced this with one owned history-chart observer: a completed replacement first disconnects/releases the prior observer, including empty/error replacements; new valid charts install the sole observer. Queued callbacks from older observers cannot redraw detached/replaced charts. Current observer releases itself when a callback detects detachment. At most one current observer remains; this does not claim all chart families have complete route teardown. Behavioral regression verifies replacement disconnect, stale callback suppression, current redraw and detached cleanup. Updated pre-existing ResizeObserver mock to include its real disconnect method after the initial suite exposed that incomplete mock. Final 167 checks pass; asset versions regenerated. No browser heap or long-session benchmark claimed, so performance remains 8.5. GitHub paused; goal active.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8.


### Iteration 50 — shareable generated index entry pages (4 November 2026)

Previous turn: progress (bounded history resize observer). Metadata audit found supported indices still used fragment URLs canonically reduced to the homepage, unlike company entry documents. Added an explicit seven-index public catalog in metadata and generated dedicated indices/{encoded exchange:id}/index.html entry pages with distinct titles, descriptions, canonical/Open Graph URLs, initial routes, stable asset bases and index-points context. Added all seven to sitemap/manifest. Runtime clean-path checks require manifest membership for indices as well as companies; unknown index routes remain fragment-based and noindex rather than receiving fabricated public entries. Regression verifies all index metadata and all seven generated HTML/canonical/bootstrap/sitemap entries. Final 169 checks pass. Actual local HTTP checks returned 200 for every index with matching bootstrap and canonical. No browser chart or third-party share-preview acceptance claimed. Metadata/sharing remains 8.5 pending external deployed-preview checks; publication is explicitly paused.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8. GitHub paused; goal active.


### Iteration 51 — logarithmic chart hover lookup (4 November 2026)

Previous turn: progress (dedicated index metadata/entry pages). Inspected hover path: union-timeline nearest lookup used reduce, series observation matching used find, and keyboard index used findIndex on each pointer move. Added binary nearestChartObservation over ordered x geometry; union keyboard positions use a prebuilt map; per-series exact endpoint matching uses binary lookup plus the same 1e-6 tolerance, preserving missing observations as blank. Earlier observation wins equal-distance ties, matching prior behavior. Regression compares exhaustive lookup across empty/single/sparse/1,606-observation sets and many cursor positions; verifies ties and fewer than 30 x reads on 100,000 observations. Existing mixed-start-date and unavailable-endpoint interaction tests still pass. 170 checks pass; assets rebuilt.

Saved .local/hover-lookup-audit.json: isolated Node/VM lookup benchmark, 1,606 observations/10,000 queries, linear 2293.41ms versus binary 0.95ms. These numbers include the test VM/runtime characteristics and are not browser frame time or site speedup claims. No browser animation/slow-device acceptance claimed; performance remains 8.5. Goal active; GitHub paused.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8.


### Iteration 52 — live responsive comparison acceptance (4 November 2026)

Previous turn: progress (binary chart hover lookup, 170 passing checks). Fresh local comparison tab successfully loaded current live chart data without accessing any external brokerage origin. Browser DOM verified table headers Metric/Reliance/Bharti/HDFC and 22 semantic metric row headers; NIFTY IT remains only in the four-line chart. Desktop document width equals scroll width 1267px. Keyboard Home exposed exact 5 Oct 2026 first observations, including NIFTY IT points. Resized to tablet 768x900 (760 CSS px): chart retained focus on the replacement SVG, all four lines remained, document width=scrollWidth=760. Phone 390x844 (386 CSS px): plot still focused and ArrowRight showed the latest observed values for all four instruments; document width=scrollWidth=386, table width660px contained in its own scroll region, metric row height42.98px. This is responsive focus/interaction acceptance, not a speech-output or slow-device benchmark. Saved and visually inspected /tmp/isv-comparison-phone-iteration52.png, showing compact semantic metric rows and company-only table. Viewport override reset; temporary QA tab unmarked, user preview untouched.

No code changes or redundant suite rerun; latest verified suite170 pass. Accessibility remains8.5 pending broader assistive-technology checks; performance remains8.5 pending browser/device measurements. Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8. GitHub paused; goal active.


### Iteration 53 — small-text colour contrast (4 November 2026)

Previous turn: progress (live desktop/tablet/phone comparison acceptance). Audited current stylesheet palette with luminance calculations. Light red declines were4.22:1 on page background and4.03:1 on pale tint; muted text4.44:1 and green4.43:1 on tint; hardcoded table-heading blue3.91:1 on tint. Darkened light-theme muted/up/down tokens to #566985/#08764f/#c53043; chart-axis fill to #616b78; replaced hardcoded table-heading blue with muted token. Dark-theme tokens unchanged. Added regression verifying ink/muted/up/down against panel/page/tint surfaces in both themes and axis text on its chart background, all at least4.5:1. Initial helper failed to strip CSS comments/import before selector matching; corrected parser and reran full suite:171 pass. This is bounded palette coverage, not full WCAG compliance (e.g. heatmap labels and transient colour composites are separate).

Fresh browser confirmed actual computed updated tokens and table-heading rgb(86,105,133); visually inspected /tmp/isv-contrast-iteration53.png. No user preferences changed, temporary tab unmarked. Accessibility/design remain8.5 pending complete colour/component/assistive-technology acceptance. Ratings otherwise unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8. GitHub paused; goal active.


### Iteration 54 — readable secondary market-map labels (4 November 2026)

Previous turn: progress (shared text palette contrast). Audited market-map-specific styles and existing contrast test: it covered white text on base/hover colours but not secondary-label opacity or decorative white gradient. Actual opacity .78 company names/.85 market caps reduced endpoint contrast to roughly3.56–4.00:1 with gradient/hover. Made both secondary label classes fully opaque; size/weight still provide hierarchy. New regression verifies effective explicit label opacity and all601 changes from-3 to+3%, extremes, neutral and missing values against all combinations of white gradient alpha0/10-of255 and normal/1.04 hover brightness. All tested white-label composites meet4.5:1. Existing geometry/font ordering unchanged.172 checks pass; assets rebuilt. No fresh browser screenshot or full component compliance claimed. GitHub paused; goal active.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 55 — explicit acceptance gates and dark-layout inspection (4 November 2026)

Previous turn: progress (market-map secondary-label contrast). Re-read original quality rubric and current evidence rather than treating unchanged8.5 scores as an implicit endless checklist. Added QUALITY_ACCEPTANCE.md with specific remaining proof for each sub9 area, retaining original scope and publication pause. Fresh browser dark-theme charts: market map/scatter full-width1191px, paired largest/sector cards586px; controls readable, no document overflow1267px; secondary map-label computed opacity1. Inspected market-map and scatter screenshots. Phone390x844/386CSS px: all chart cards363px, no document overflow; visually inspected sector hierarchy/cards/metrics. Saved /tmp/isv-dark-phone-sectors-iteration55.png. Restored original light preference and default viewport; temporary tab unmarked. No provider settings or user selections changed. These bounded dark checks advance design acceptance but do not cover all remaining routes. No code changes/redundant suite rerun; latest172 checks pass.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8. Goal active; GitHub paused.


### Iteration 56 — inspectable historical request boundaries (4 November 2026)

Previous turn: progress (explicit quality acceptance gates and dark layout checks). Refactored the compressed getPriceHistory implementation into readable validateHistoricalPoints, validateHistoricalIdentity, fetchPriceHistory and cache-owner functions. Parsed observation times are carried forward once per record instead of reparsing prior timestamps. Preserved validation order, identity/native-unit checks, empty/one-record support, response errors/status,20-second timeout, coalescing, range TTL and owner-only rejection/expiry release. Existing malformed chronology/candle/identity/retry/expiry regressions pass unchanged. Added actual request-boundary concurrency test: two simultaneous consumers of TEST/1M yield one fetch and the same result object; TEST/6M is independent; subsequent1M uses the cached request. Final173 checks pass; assets rebuilt. No live-provider/UI acceptance required or claimed for this structure-only change. Remaining rendering/global wrappers prevent promoting overall maintainability solely from this extraction. GitHub paused; goal active.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 57 — share-count/quote date compatibility in broker valuations (4 November 2026)

Previous turn: progress (historical request refactor). Audited exact-cap paths and found applyReferenceValuations checks quote.date against shareCountDate, while applyKiteQuotes could recalculate from an older referencePriceINR without this guard; stale broker observations had the same issue. calculateLiveMarketCap now accepts the actual quote timestamp/date and requires valid quote/share dates with quote Indian-calendar date >= share-count date for exact official-share calculations. Missing/impossible dates reject the exact calculation and cannot fall through to implied-share estimation. Broker path passes match.lastTrade or referenceQuote.at/date; no arbitrary current-date substitution. Existing dated financial baseline handling remains explicit. Overseas receipt exclusion and native-INR invariance preserved; direct official-share tests now supply real dates.

Regression covers older/undated/malformed quotes, impossible share dates, IST midnight boundary, and actual applyKiteQuotes integration for stale reference -> stale broker -> compatible broker -> compatible reference.175 checks pass; assets rebuilt. No new source records, corporate-action source audit or live UI verification claimed. Identity/valuation remains8.5 pending wider source-record acceptance. GitHub paused; goal active.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 58 — conflicting official share-count handling (4 November 2026)

Previous turn: progress (quote/share-date compatibility). Official record join previously silently retained the first count when latest same-ISIN/same-date official records disagreed. It now flags the conflict with both source URLs regardless of record order, clears verified shares and any already-derived exact cap, and blocks both exact and implied-share cap calculations. A genuinely newer unambiguous effective record clears the conflict. Reference valuation skips flagged stocks; metric hover explains unavailable counts/calculations while any separately dated financial-source cap remains distinguishable. Impossible calendar effective dates are rejected before record selection. Tests cover both input orders, prior computed-cap clearing, estimate blocking, newer resolution and invalid effective date.176 checks pass; assets rebuilt.

Audited actual public official/reviewed files using the real join:3201 records,3200 distinct ISINs,3200 accepted counts,zero latest-date conflicts. This is share-file identity coverage, not current-ranking coverage or full-market completeness; no new data added. Evidence .local/share-conflict-audit.json. No visible current company affected in this audit, so no new UI screenshot claimed. Wider corporate-action/ADR source-record audit still required for identity9. GitHub paused; goal active.

Ratings unchanged: navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; visual hierarchy/design, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 59 — complete dark design acceptance and index action wrapping (4 November 2026)

Previous turn: progress (official count conflicts). Completed current dark-theme review of rankings, mixed comparison, Reliance company, NIFTY50 index, methodology and empty watchlist at phone390x844/386CSS px and tablet768x900/760CSS px, plus missing-company recovery at both widths. Every recorded document width equals scrollWidth; tables/metric strips retain their own intended horizontal scroll. Visually inspected saved screenshots for all states, not only dimensions. Comparison loading placeholder and completed four-line chart both inspected; 320ms outgoing chart animation layers were allowed to finish for final index proof. Found index action link split “Open” from “comparison” on phone. Grouped index quote/actions with wrapping flex groups and kept the action link unbroken; retested phone/tablet. No compare selections/watchlist entries altered; theme and viewport restored.

Evidence .local/dark-design-audit-iteration59.json and /tmp/isv-dark-*-59.png; final corrected phone proof /tmp/isv-dark-index-phone-final-59.png. Full176 checks pass after markup/CSS change and asset regeneration. Visual hierarchy/design raised8.5→9 based on this completed remaining dark-route matrix, earlier27-route/width review, responsive/focus checks and light/dark/map contrast fixes. This does not claim perfect design or assistive-technology certification. Quality acceptance document updated. Goal active; GitHub paused.

Current ratings: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 60 — browser-measured MAX formatting cost (4 November 2026)

Previous turn: progress (dark design matrix/index action fix; design9). Used actual page-local performance diagnostics on a fresh comparison tab with four real series. Initial before: content ready116ms, FCP104ms, LCP220ms, cumulative non-input layout shift0, long tasks0. MAX switch added one157ms long task;6M added none. Inspected render path formats every observation through Date.toLocaleString; replaced repeated locale formatter creation with a bounded five-style Intl.DateTimeFormat cache (full-time/full-date/time/date-year/date), preserving IST and full intraday detail. Regression checks every8range/full combination against original locale output across repeated calls and exactlyfive formatter constructions. Also corrected accidental screen-reader caption “companies companies” to “selected companies”; updated existing render expectation.

Fresh browser reload after: content ready96ms, FCP80ms,LCP260ms,cumulative shift0.0065; initial phase3long tasks188ms. Subsequent MAX and6M each added zero long tasks, allfour series ready; slowest measured interaction56ms afterMAX/72ms after6M. Initial long tasks/LCP variance means this is not an overall page-speed percentage claim. No network/device throttling or browser heap stress test performed. Evidence .local/browser-performance-iteration60.json contains before/after DOM diagnostic snapshots. Performance stays8.5 pending broader constrained/long-session acceptance.177 checks pass; assets rebuilt. Temporary tab unmarked; no preferences/provider settings changed. Goal active; GitHub paused.

Current ratings: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 61 — scatter keyboard selection survives redraw (4 November 2026)

Previous turn: progress (browser-measured date formatter optimisation). Reviewed existing scatter keyboard behavior: it already provides one roving Tab stop plus arrow/Home/End navigation and a company finder; no hundreds-of-Tab-stops claim is warranted. Found resize-driven renderAuditedScatter replaces the focused mark and resets the roving selection to first company. Added explicit capture/restore keyed by current company rank. Preserves the selected mark even when external controls own focus; restores focus with preventScroll only when the prior scatter mark owned it; falls back to first available mark when the former company is absent. Restoration occurs after fresh event handlers are bound. Behavioral helper regression covers selected focused replacement, external focus, single0tabindex and missing-company fallback.178 checks pass; assets rebuilt. No fresh browser/assistive-technology acceptance claimed; accessibility remains8.5. Goal active; GitHub paused.

Ratings: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 62 — real scatter keyboard acceptance and table continuity (4 November 2026)

Previous turn: progress (scatter mark-state preservation). Fresh browser: company finder selected Bharti Airtel; exactlyone point tabindex0; ArrowRight focused HDFC Bank; phone resize preserved same rank/name and one Tab stop. Tab moved directly to View chart data, Enter expanded569-company alternative. Verified actual scope attributes col/col/col and first row THscope=row (browser DOM scope property shortcut returned null, so checked attributes). Restoring viewport then exposed another genuine bug: resize closed details and lost summary focus. Extended keyboard state with open state, summary/table focus and internal scroll offsets. Lazy table builder can synchronously restore an already-open table while retaining once-only construction. Existing mark selection behavior retained. New behavioral test covers table focus/scroll and restored-open lazy construction.179 checks pass; assets rebuilt.

Browser retest after reload: Enter opened data table; phone resize retained details.open=true, focusSUMMARY,569rows,scopeattributes and one pointTabstop; default-viewport restoration retained open table and summary focus. Saved/inspected /tmp/isv-scatter-data-preserved-iteration62.png; original viewport restored, no user selections/provider settings changed. Temporary tab unmarked. Accessibility remains8.5 pending broader current route/control/live-refresh/assistive-technology acceptance. Goal active; GitHub paused.

Ratings: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 63 — line-chart data alternative continuity (4 November 2026)

Previous turn: progress (real scatter keyboard acceptance and expanded-table fix). Inspected shared line-chart redraw: the same expanded-data loss applied to company/index/comparison price charts. Added shared captureChartDataState/restoreChartDataState for open state, focus ownership and each named company data region's scroll offsets. Resize/legend redraw captures state before replacing canvas and passes it to interactive setup. Lazy builder can synchronously restore previously open tables and remains once-only; focus restoration uses preventScroll and does not take focus from outside controls. Existing plot focus restoration remains separate. Test executes real table open/build idempotency and per-company focused-region/scroll restore, plus external-focus noninterference. All180 checks pass; assets rebuilt. No fresh browser resize or speech-output acceptance claimed this iteration; accessibility remains8.5. GitHub paused; goal active.

Ratings: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 64 — live line-table acceptance and first-feed continuity (4 November 2026)

Previous turn: progress (shared line-chart table-state preservation). Browser comparison: opened four data regions, focused HDFC Bank data, PageDown scrolled it, resized phone/tablet; same region stayed focused/open, Tab advanced to NIFTY IT data. Scroll remained nonzero but measured offsets changed during native smooth-scroll/reflow (238.12/376.24px); exact pixel invariance is not proven and is not claimed. Company table retained summary focus/open state22rows across resize. Index initially lost table during startup; after feed settled it retained summary focus/open state22rows through resize, proving resize path works but exposing initial-refresh replacement separately. Saved /tmp/isv-index-data-table-iteration64.png; viewport restored, temporary tab unmarked.

Root cause in current source: initLive rebuilt every view after first authenticated quotes arrived. It now updates statistics and existing stock/index/compare/charts views through refreshKiteView; ranking controls still rebuild for provider-specific metrics. Existing chart guard protects focused workspace, and index levels already update through the readFeed wrapper. Regression executes actual initLive for allfive route types, verifying quote application and in-place refresh versus ranking render.181 checks pass; assets rebuilt. First-feed timing fix is unit-verified, not a fresh delayed-browser replay; reliability/accessibility remain8.5. Goal active; GitHub paused.

Ratings: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 65 — freshest dual-exchange quote and conflict propagation (4 November 2026)

Previous turn: progress (line-table acceptance and first-feed continuity). Inspected current dual-listing quote join: always chose NSE even if BSE traded later. Added selectLatestKiteQuote selecting newest valid parsed trade instant across NSE/BSE; NSE only breaks equal/undated ties. Invalid/nonpositive quote prices are excluded. Same ISIN grouping remains authoritative, selected exchange/symbol/timestamp stays attached and quote-pulse exchange-switch safeguard is retained. Full applyKiteQuotes regression covers newer BSE, equal instants in different timezone spellings selecting NSE, invalid/undated competitor and invalid price.

Also found a real integration omission in iteration58: calculateLiveMarketCap rejects shareCountConflict but the broker caller's copied valuation object did not pass the flag, allowing implied-share fallback when verified shares were cleared. Passed the flag explicitly and added the same full-update regression with a dated baseline to prove no implied estimate is produced; any separate dated financial-source cap remains10 in fixture, native computed cap staysnull. This corrects the earlier overly broad blocked-fallback claim.182 checks pass; assets rebuilt. No fresh provider/browser valuation acceptance or coverage gain claimed. Goal active; GitHub paused.

Ratings: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 66 — exclude rights entitlements from company rankings (4 November 2026)

Previous goal turn: verification of existing company-only comparison tables; no score increase. Current directory audit found SHIVAM-RE1 (INE637H20024, BE) and URBAN-RE (INE0O0220019, ST), which represent subscription entitlements rather than separate companies. Added conservative explicit -RE/-RE<number> symbol suffix or rights-entitlement name classification at fresh directory normalization and cached/snapshot universe merging. Ordinary BE/ST companies, SME entries and RE-prefixed company names remain. Behavioral fixtures check backend/browser predicate parity, both exchange ticker suffixes, source-order independence and preservation of eligible identities. Public page generation already consumes this universe; rebuilt pages/sitemap remove entitlement pages, and acceptance now checks their absence against the source. Initial check correctly exposed obsolete raw-ISIN-count expectation; corrected it to eligible companies plus explicit excluded-page assertions.

Current authoritative directory: 8,032 listing records, two entitlement records excluded, 5,533 eligible distinct company ISINs; merged directory-only universe contains exactly all 5,533. Evidence: .local/equity-classification-audit.json. Full syntax/behavior checks: 183 pass, zero failures (/tmp/isv-iteration66.log). Assets/public pages rebuilt. No fresh browser acceptance, live valuation audit or provider coverage gain claimed. Running backend will use ingestion filter on next refresh/restart; current cached browser directories are filtered immediately after loading updated assets. Goal active; GitHub publication paused.

Ratings: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations 9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests 8.5; data freshness/coverage 8. Scores unchanged pending remaining acceptance gates.


### Iteration 67 — current market-wide quote and valuation reconciliation (4 November 2026)

Previous turn: progress (entitlement exclusion with full eligible-company preservation). Added reproducible read-only scripts/audit-live-valuations.mjs. It fetches the current local /api/market response, loads the current directory, dated official/reviewed shares and financial baseline, then runs the actual browser merge, attachment, quote selection and applyKiteQuotes path in a VM. Independently reconciles selected quote identity/price and latest parsed timestamp, exact INR price × shares, bundled-FX USD conversion, date eligibility and conflicting-share suppression. Quote records remain in memory; only aggregate counts and failing identities are saved in .local/live-valuation-audit.json. No credentials read or exported.

Actual observation 2026-11-04T04:46:05.388Z: provider Zerodha Kite,7,140 exchange quote records,5,533 eligible distinct companies,4,851 matched company quotes,3,090 exact calculated caps,2 estimated caps,0 remaining dated-source caps,2,441 missing caps,0 conflicting-share companies,86 companies whose selected quote predates their attached share-count date,25 unresolved historical identities excluded from company counts. No quote-selection/calculation/date invariant failures. This proves current integration across the observed universe, not independent source truth or complete market coverage. FX is the bundled dated reference, not freshly validated. Full syntax/behavior check183 pass (/tmp/isv-iteration67.log). No UI or provider-setting changes; GitHub paused; goal active.

Ratings unchanged: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8. Outstanding identity gate still requires representative dated source/corporate-action acceptance; coverage gaps are now quantified against a running feed.


### Iteration 68 — isolate insufficient weekly histories in comparisons (4 November 2026)

Previous turn: progress (running market-wide valuation audit). Inspected pending comparison lifecycle: request-generation and document-containment guards already suppress superseded/detached batches; did not claim new cancellation behavior. Found a genuine availability bug after weekly sampling: renderKiteHistoryValues rejected the entire prepared batch whenever any series had fewer than two weekly observations. A new listing with two daily observations in one week therefore hid established companies on5Y/MAX. Now filters prepared series independently, retains every drawable line, and adds the named insufficient-weekly-history message for sparse series. If no drawable series remains, existing Not enough history state is retained. No interpolated observations or padded histories added.

Behavioral regression executes actual renderer and weekly preparation for5Y andMAX with established/new mixed selection; asserts chart remains, established observation count appears, new-company warning appears and sparse line is not reported as drawn. Also verifies sparse-only selection still shows no false chart. Full184 checks pass (/tmp/isv-iteration68.log); assets/generated entries rebuilt. No fresh browser acceptance claimed. Goal active; GitHub paused.

Ratings unchanged: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8. Reliability improvement is specific to partial weekly-history batches; broader running-site outage/reconnect acceptance remains.


### Iteration 69 — reference quote calendar and timestamp consistency (4 November 2026)

Previous turn: progress (partial weekly comparison availability fix). Inspected official/reviewed share attachment: effective share dates were strictly validated, but referencePriceDate only matched a date-shaped regex and compared lexically; malformed calendar dates could attach prices, and referencePriceAt could disagree with the displayed trading date. Tightened quote eligibility to require a real calendar date and, when a timestamp exists, agreement with its Indian calendar date. Valid share counts remain attached even when their separate reference quote is rejected. No prices fabricated or dates silently repaired.

Behavioral regression covers31February, invalid timestamp, next-day timestamp, UTC timestamp still on previous Indian day, and accepted prior-UTC-day timestamp that falls on the reported Indian day; rejected quotes cannot produce reference caps, accepted quote yields exact price×shares. Current file audit:3,201 share records,3,189 positive reference prices,zero date/timestamp inconsistencies (.local/reference-date-audit.json). This hardens future/refreshed input without claiming current coverage gain. Full185 checks pass (/tmp/isv-iteration69.log); assets/generated pages rebuilt. No fresh browser or external source acceptance claimed. Goal active; GitHub paused.

Ratings unchanged: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 70 — current live comparison browser acceptance (4 November 2026)

Previous turn: progress (reference quote date validation plus actual record audit). Opened temporary local comparison tab with opt-in performance diagnostics. Actual saved selection: Reliance, Bharti Airtel, HDFC Bank, NIFTY IT. Once loaded, four SVG series, three company table columns plus Metric,22rows with four cells each, no index financial column. Native table-region Tab focused Reliance company control; it retained focus while current quote/cap text changed across feed polls. No selection modifications. MAX then6M controls accepted via observed data-kite-range selectors; allfour lines remained, aria-busy=false on completion. Native role locator checkbox was not matched by Playwright despite AX exposure; switched to observed selector, no app-state manipulation. Plot keyboard ArrowRight/Shift+ArrowRight/Escape worked; shift at final endpoint reported same-date zero difference, no invented movement.

Actual initial diagnostics: navigation78ms,first paint124ms,largest paint260ms,data ready137ms,cumulative diagnostic layout shift.0102,one54ms long task. MAX added one50ms long task; subsequent6M addednone. Final slowest interaction64ms. No horizontal document overflow. This is one warm/local browser session, not field percentiles, throttled-device acceptance or proof of broad performance9. Browser completion summary recorded; temporary unmarked tab, no provider/currency/theme/saved-selection changes. No source edits or redundant full check this iteration; latest full185 checks from iteration69 retained. Goal active; GitHub paused.

Ratings unchanged: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 71 — permanent market-cap update glow and latest preview (5 November 2026)

Previous turn: progress (live comparison browser acceptance). Fixed old single-metric guard in paintQuotePulses: permanent market-cap cell now receives its native up/down movement glow even with an optional metric selected. Behavioral regression executes actual painter with revenue selected, verifies price/day-change/cap directions for both up/down, and confirms movements are consumed once. Full186 checks pass (/tmp/isv-iteration71.log); assets/pages rebuilt.

User requested latest preview during work. Browser initially returned connection refused; listener check confirmed no4174server. Started current server successfully (session18823), opened visible local rankings, reloaded and marked tab4deliverable. DOM verified current versioned ranking-universe/kite-ui scripts and100rows; screenshot inspected and saved /tmp/isv-latest-preview-71.png. Dated top status shown; index levels unavailable at startup, so no fresh live-provider success claimed. Actual native glow timing not visually sampled; unit behavioral path verified. GitHub paused; goal active.

Ratings unchanged: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.


### Iteration 72 — explicit page-owned chart disposal (5 November 2026)

Previous turn: progress (permanent market-cap glow and preview recovery). Inspected current chart lifecycle: observer self-disconnects on a detached-canvas notification and replacement chart render disconnects old observer, but top-level page navigation had no explicit disposal boundary. Added disposePriceChart(), called by render after data readiness and before route replacement. It immediately disconnects/releases the price-chart ResizeObserver and increments chart request generation. Shared network/history-cache promises intentionally remain reusable; this is not transport cancellation. Existing generation/containment checks prevent late render.

Regression executes actual loader and disposal: observer disconnect once, repeated disposal safe, pending response cannot queue a render, already queued animation-frame commit cannot render after disposal. Existing complete-batch/error/stale-response/observer tests remain. Full187 checks pass (/tmp/isv-iteration72.log); assets/generated pages rebuilt. No fresh browser long-session or memory measurement claimed. Goal active; GitHub paused.

Ratings unchanged: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8. Explicit lifecycle ownership improves maintainability but does not alone close broader global-render coupling acceptance.


### Iteration 73 — indexed financial/directory identity merge (5 November 2026)

Previous turn: progress (explicit chart disposal boundary). Replaced per-snapshot full-directory find with one exchange/symbol bucket index built alongside ISIN groups. Ordinary records preserve first matching directory entry; reviewed renames search only their symbol bucket for the required verified ISIN, preserving duplicate-symbol and wrong-exchange behavior. No identity policy, ordering, alias or financial-value changes intended.

Actual current-data before/after reconciliation:595 financial records,8,033 directory entries,5,560 merged records; JSON output byte-identical. Alternating isolated Node VM benchmark after two warmups,15measured runs/version: old median22.77575ms,indexed median7.577416ms. Evidence .local/universe-merge-audit.json. This measures merge computation only, not browser page speed, constrained devices or field metrics. New behavioral fixture verifies duplicate ordinary first-match preservation and reviewed rename selecting correct ISIN past wrong-ISIN duplicate; all188 checks pass (/tmp/isv-iteration73.log). Assets/generated entries rebuilt. No fresh browser acceptance claimed. Goal active; GitHub paused.

Ratings unchanged: visual hierarchy/design, navigation/core, charts/interactions, responsive layout, local security, privacy/preferences, exports, documentation/operations9; identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing, maintainability/tests8.5; data freshness/coverage8.
