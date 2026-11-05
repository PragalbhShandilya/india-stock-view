# Website quality review — target 9/10

Started 2 November 2026. This broader review supersedes the earlier 8/10 chart target. Scores are an expert assessment supported by the evidence below, not an external user study. A 9 requires the relevant normal flow, error states, responsive layout and safeguards to be verified. An unverified area cannot earn a 9 solely because a related test passes.

GitHub publication is paused at the user's request. Current improvements are local.

## Iteration 1 — recovery, safe rendering and disconnected valuations

| Aspect | Baseline / 10 | Current / 10 | Remaining work toward 9 |
|---|---:|---:|---|
| Core flows, navigation and search | 8 | 8 | Broader persistence/filter/back-navigation acceptance and clearer listing filters. |
| Visual hierarchy, alignment and sizing | 8 | 8 | Review every state at narrow, intermediate and desktop widths. |
| Responsive layouts | 8 | 8 | Complete tablet and narrow-screen acceptance beyond the earlier chart pass. |
| Charts and interactions | 8 | 8 | Verify all calendar ranges in both stock/comparison views when historical access is restored; finish compact-selection visual acceptance. |
| Data identity and valuation correctness | 7 | 8 | Extend identity/source-period audit across ordinary, overseas, delisted and corporate-action cases. |
| Data freshness and coverage | 6 | 6 | Zerodha currently rejects historical access; BSE-only share/price gaps remain. Do not claim complete live coverage. |
| Reliability and recovery | 6 | 8 | More provider, timeout, restart and partial-source failure acceptance. |
| Accessibility | 8 | 8 | Full route/focus, semantics and keyboard audit, including live updates. |
| Performance | 7 | 7 | Measure and reduce transfer size, periodic reference downloads and expensive joins. |
| Security and input handling | 7 | 8 | Continue rendering/URL/API boundary review beyond this iteration's escaping and CSV checks. |
| Privacy and saved preferences | 8 | 8 | Verify persistence/removal/storage-failure flows and make storage behavior easy to understand. |
| CSV and image exports | 7 | 8 | Recheck all currencies, provenance columns and chart families against latest code. |
| Metadata, search visibility and sharing | 6 | 6 | Review route metadata, sharing previews and static-host limitations. |
| Maintainability and test coverage | 7 | 7 | Reduce coupled rendering/global overrides and cover more application boundaries. |
| Documentation and operations | 6 | 7 | Reconcile older reports with current implementation and verify repeatable local/release workflows. |

### Changes

- Shared preference validation prevents malformed saved watchlist/comparison/theme values from breaking startup. A module-ready startup avoids rendering before later scripts install their behavior.
- Search values, option labels and company names are escaped at the presentation boundary. Text CSV formulas are neutralized while numeric negative values remain numeric.
- Unknown stock links show a dedicated recovery page instead of silently opening Rankings. Initial data loading has a visible status, timeout and Retry action.
- CSV export headers are unique, dates reflect the export day, units distinguish INR quote prices from USD-billion totals, and quote identity/source/date fields are separate from the financial-source ticker.
- Methodology copy reflects the current Zerodha connection and actual history/logo behavior. Historical chart authentication errors offer a direct connection action; transient failures offer retry.
- Calendar chart markers now use month starts for 6M/YTD/1Y, January 1 for 5Y/MAX and date-only labels for 5D. Hover retains observation times. Drag selection shows only endpoint dates/times and coloured absolute/percentage changes.
- NSE and Jio Platforms were present in the directory but disappeared from leading ranks when no broker quotes arrived. Market-wide reference valuation now works independently of Zerodha: matching dated prices × verified official shares, with quote and share-count sources kept separate. Prices predating a share count cannot manufacture a new cap. INR cap is invariant to display FX.
- NSE's BSE-only price uses a specifically dated, reviewed Business Standard observation because direct BSE access is blocked. Its outstanding shares retain their separate official BSE source. This is a snapshot, not a live feed.
- Official reference parsing now retains explicit quote timestamps, daily percentage changes and volume, with a one-time snapshot migration running across eligible NSE identities. Missing changes remain blank rather than mixing old daily moves with newer prices.

### Evidence

- 51 tests passed after these changes, covering calendar ticks, CSV/input boundaries, startup retry, official reference parsing, disconnected IPO valuation and native-INR invariance.
- Browser: unknown stock recovery works; an HTML-like search remains plain text and creates no unexpected image; currency switching preserves the search; CSV downloads successfully with unique headers and dated filename.
- Browser: Jio Platforms returned to rank 2 and NSE to rank 14 at the observed reference prices. Positions can change with source updates. The top label shows a dated snapshot rather than live data.
- Provider check: historical requests return a session/data-permission error. User reconnect requested; this is an external acceptance dependency, not a reason to invent chart observations.

### Still open

The objective remains active. The scores above deliberately remain below 9 where coverage or acceptance is incomplete. The source migration's final coverage result and the full rerun after any subsequent edits must be recorded in the next iteration. Earlier chart screenshots and prior 8/10 ratings do not by themselves prove the broader 9/10 objective.


## Iteration 2 — real movement cues and restored broker access

Previous goal turn: progress. Zerodha reconnected successfully, changing the authoritative provider state from login-required to authenticated streaming.

### Scores / 10

| Aspect | Current | Change / remaining acceptance |
|---|---:|---|
| Core flows, navigation and search | 8 | Focused ranking controls survive live updates; broader filter/back-navigation work remains. |
| Visual hierarchy, alignment and sizing | 8 | Real movements have a short, subtle green/red glow. Full responsive route review remains. |
| Responsive layouts | 8 | No new claim beyond prior acceptance. |
| Charts and interactions | 8 | Real historical data restored; comparison 5D/6M/YTD/1Y/5Y/MAX markers verified. Individual Reliance 6M month markers verified. Remaining stock-range and export acceptance is still open. |
| Data identity and valuation correctness | 8 | Native-INR change comparison avoids FX-induced pulses. Corporate-action/legacy identity audit remains. |
| Data freshness and coverage | 8 | Up from 6: authenticated streaming observed, 7,239 quotes across three connections. Official reference refresh completed: 3,193 verified of 3,215 checked, 22 failed, with 2,438 BSE-only identities pending. Not full-market coverage. |
| Reliability and recovery | 8 | Feed reads have an eight-second timeout. Failed reads preserve provider identity and clear the Live claim even if the last quote is recent. More fault/restart acceptance remains. |
| Accessibility | 8 | Focus retention verified across multiple real updates; reduced-motion CSS suppresses pulse animation. Full route audit remains. |
| Performance | 7 | Removed repeated per-stock baseline searches; official reference polling reduced from 30 seconds to five minutes (90% fewer scheduled full-file transfers). Large live payloads remain. |
| Security and input handling | 8 | No credential exposure or new permissions; broader URL/rendering audit remains. |
| Privacy and saved preferences | 8 | No new claim beyond prior acceptance. |
| CSV and image exports | 8 | Latest export-family acceptance remains open. |
| Metadata, search visibility and sharing | 6 | Still pending. |
| Maintainability and test coverage | 7 | Pure quote tracker with boundary tests added; coupled rendering remains. |
| Documentation and operations | 8 | Up from 7: current test report reconciled with available runtime, source refresh and provider evidence. Release/restart verification remains. |

### Implementation and verification

- Pulses reflect native price and calculated cap changes only. Initial loads, equal values, null values, missing quotes and provider/exchange changes establish a baseline without flashing. Display-currency changes cannot create movement.
- Rankings, company overview and comparison price/cap cells use the movement cue. Daily percentage text retains its daily return colour, while the pulse indicates the newest movement.
- Focused ranking rows receive updated numeric cells without rebuilding their buttons or checkboxes. Sorting resumes on subsequent refreshes after focus leaves.
- Browser evidence: real rising and falling prices produced `quote-up` and `quote-down` classes. Reliance's focused company control remained focused across multiple live polling cycles. No simulated quote data was introduced.
- Data sources dialog title now describes the mixed current sources rather than asserting only official end-of-day reports.
- Full suite: 53 tests passing. Native movement tests include FX-only changes, missing values, exchange switches and reconnect baselines. Failure-status test verifies a recent cached quote cannot retain a Live claim after authentication/network failure.

Goal remains active. No aspect is promoted to 9 solely from this bounded iteration.


## Iteration 3 — transfer efficiency, page identity and repeatable checks

Previous turn: progress (real movement cues and provider reconnection verified). This pass changes the authoritative local implementation; GitHub publication remains paused.

| Aspect | Score / 10 | Current evidence / next acceptance |
|---|---:|---|
| Core flows, navigation and search | 8 | Rankings, Charts and a company deep link still render after server restart. Broader filtering/back-navigation acceptance remains. |
| Visual hierarchy, alignment and sizing | 8 | Company page reviewed at desktop; broader route/width coverage remains. |
| Responsive layouts | 8 | No new claim beyond prior evidence. |
| Charts and interactions | 8 | Real company price history continues to load after API changes. Remaining range/exports acceptance remains. |
| Data identity and valuation correctness | 8 | Quotes/status unchanged by compact payload; identity/corporate-action audit remains. |
| Data freshness and coverage | 8 | Saved session restored after restart; 7,239 quotes and authenticated streaming verified. Share-count gaps remain. |
| Reliability and recovery | 8 | Server restart retained broker access. More partial-source and provider-failure acceptance remains. |
| Accessibility | 8 | No new claim beyond prior focus/reduced-motion evidence. |
| Performance | 8 | Up from 7: actual live response reduced from 4,096,981 bytes to 609,891 wire bytes (~85%). Public share file 2,437,699 decoded bytes → 256,773 compressed bytes; repeat request verified 304 / zero body. Full quote snapshots and broad rendering still warrant work. |
| Security and input handling | 8 | Account data remains no-store with no ETag; cache separation and gzip negotiation tested. Broader rendering/URL audit remains. |
| Privacy and saved preferences | 8 | No new claim beyond prior evidence. |
| CSV and image exports | 8 | Acceptance still open across current chart families. |
| Metadata, search visibility and sharing | 8 | Up from 6: route-specific browser titles/descriptions and Open Graph text, site canonical, social fallback and favicon added. Browser verified Rankings, Charts and Reliance price route. Hash-route social-crawler limitation documented; rich images/dedicated crawlable pages remain. |
| Maintainability and test coverage | 8 | Up from 7: one repeatable check command covers all 17 browser modules, root server modules and all root tests; release runtime pinned to Node 24. Coupled global rendering still remains. |
| Documentation and operations | 8 | API/cache/metadata/release documentation reconciled; 59 passing tests, syntax checks and successful authenticated restart verified. |

### Verification limits

Compression measurements describe the local server. GitHub Pages controls its own caching/compression, and the paused public deployment has not received these changes. Lightweight polling retains complete quote semantics but omits unchanged directory fields; it is not a delta stream. Cached public files are content-addressed with ETags; account/session responses remain uncacheable. Dynamic company metadata helps browser tabs, while social crawlers receive the stable site-level HTML fallback.

Goal remains active. No incomplete aspect has been promoted to 9.


## Iteration 4 — phone/tablet acceptance, identity filters and image reflow

Previous turn: progress (measured compression and route metadata improvements). The work remains local; publication remains paused.

| Aspect | Score / 10 | Evidence / remaining acceptance |
|---|---:|---|
| Core flows, navigation and search | 8.5 | Indian listings now follows actual current exchange identity, so HDFC Bank is included despite its HDB financial-source identity. Verified mobile filtering, watchlist lifecycle, comparison loading and tablet sector→rankings→reset. Broader sort/pagination/back-navigation acceptance remains. |
| Visual hierarchy, alignment and sizing | 8.5 | Phone metrics fit two compact rows. Scatter and price downloads now use a consistent landscape composition rather than magnifying a phone layout. Remaining route/dark-theme review remains. |
| Responsive layouts | 8.5 | At 390×844 override (386 CSS px), Rankings, Charts, Compare and Reliance price pages have no document overflow; large tables scroll inside wrappers. At 768×1024 override (760 CSS px), comparison and sector views fit. Remaining intermediate/dark/empty/error route coverage remains. |
| Charts and interactions | 8 | Actual price and comparison history works; remaining timeline/selection/error acceptance remains. |
| Data identity and valuation correctness | 8 | Listing classification regression covered by a boundary test. Broader corporate-action and legacy alias audit remains. |
| Data freshness and coverage | 8 | No new coverage claim. |
| Reliability and recovery | 8 | Blocked/full browser storage verified to fall back and report unsaved changes; provider/partial-source fault acceptance remains. |
| Accessibility | 8 | No document clipping on checked mobile/tablet routes. Remaining keyboard/semantics and chart-state coverage remains. |
| Performance | 8 | Prior transfer improvements retained. Full snapshots/rendering remain. |
| Security and input handling | 8 | Rendering/URL review still open. |
| Privacy and saved preferences | 9 | Mobile add→reload→remove watchlist verified; original zero-entry watchlist restored. Existing four-company comparisons persisted across reloads. Invalid saved types and blocked/quota storage cases pass. No saved selection is sent in the market API request. Methodology now explains local records, individual removal, site-storage clearing, lack of device sync and separate server broker session; visible guidance verified. This is a product assessment, not a privacy/security certification. |
| CSV and image exports | 8.5 | Actual downloads checked: market-map PNG, scatter PNG before/after fix, sector PNG, largest-companies SVG, comparison PNG before/after fix and Reliance price PNG. Images viewed to inspect labels, dates, units, geometry and legends. Remaining annual/dark/INR/SVG combinations and latest CSV acceptance remain. |
| Metadata, search visibility and sharing | 8 | No new claim beyond Iteration 3. |
| Maintainability and test coverage | 8 | One additional listing-identity boundary test and one storage-failure test; all 61 tests and module syntax checks pass. |
| Documentation and operations | 8 | User/security/test/review documentation updated. Runtime/publication limits remain explicit. |

### Export fixes

Phone SVG cloning previously enlarged fonts and produced tall posters. Scatter exports now recalculate the same filtered dataset using the selected scale at a fixed landscape width. Zerodha price/comparison exports map existing plot geometry into a landscape frame while retaining displayed observations, date ticks, line dashes, endpoint markers and legends. Hover overlays are excluded. Both fixes were verified with real downloaded PNGs; no synthetic prices were introduced.

### Acceptance cleanup

Temporary test watchlist entry removed, original comparison list retained, ranking filters reset and viewport override removed. Goal remains active: one aspect now reaches 9; the remaining requirements are not declared complete.


## Iteration 5 — verified identity merge and safer source boundaries

Previous turn: progress (mobile filters, export reflow and saved-preference acceptance). GitHub publication remains paused.

| Aspect | Score / 10 | Evidence / remaining acceptance |
|---|---:|---|
| Core flows, navigation and search | 8.5 | Old LTIMindtree and current LTM searches each return one canonical company; old bookmarked route opens the current chart. Sort/pagination/back-navigation acceptance remains. |
| Visual hierarchy, alignment and sizing | 8.5 | Existing mobile/export improvements retained. Dark/intermediate review remains. |
| Responsive layouts | 8.5 | No new claim beyond Iteration 4. |
| Charts and interactions | 8.5 | Up from 8: actual keyboard Home, Shift+Right range selection and Escape verified on the corrected company. Compact selection has endpoints and signed absolute/percentage delta only. Remaining timeline/provider-error/export combinations remain. |
| Data identity and valuation correctness | 8.5 | Up from 8: official symbol/name change verified for LTIM→LTM; same-ISIN duplicate removed, current source financial row retained, aliases/bookmarks/saved identities supported. Coverage audit now 5,683 entries, 3,194 verified share counts and 30 unmatched legacy source records. Those unresolved records and corporate-action cases still prevent a 9. |
| Data freshness and coverage | 8 | Outstanding-share gaps remain: 2,457 rows lack cap inputs; 2,435 are BSE-only. No full-market claim. |
| Reliability and recovery | 8 | Existing recovery improvements retained. Wider failure acceptance remains. |
| Accessibility | 8.5 | Up from 8: keyboard chart flow verified; active company metric and main ranking link expose aria-current. Ranking headers declare column scope. Broader keyboard/semantics review remains. |
| Performance | 8 | Prior transfer savings retained. No new throughput claim. |
| Security and input handling | 8.5 | Up from 8: data-driven external source links and logo URLs now require absolute HTTPS without embedded credentials or controls. Link attributes are escaped; sector labels/attributes escaped. Tests reject executable/data/file/insecure/protocol-relative/credential/control URLs. Remaining server/callback/rendering review prevents a 9. |
| Privacy and saved preferences | 9 | Prior acceptance retained; alias migration preserves saved company identity and deduplicates selections in memory. |
| CSV and image exports | 8.5 | Prior acceptance retained. |
| Metadata, search visibility and sharing | 8 | Metadata resolves old stock aliases to the canonical company. Hash-route crawler limitation remains. |
| Maintainability and test coverage | 8.5 | Up from 8: fixed a test-initialization timing race; 63 tests pass. Asset version generation is now a repeatable command and the shared check fails on stale asset versions. Coupled rendering still remains. |
| Documentation and operations | 8 | Latest evidence recorded; broader release/fault acceptance remains. |

### Official identity evidence

- Symbol effective 27 February 2026: https://nsearchives.nseindia.com/content/circulars/CML72948.pdf
- Name effective 17 April 2026: https://nsearchives.nseindia.com/content/circulars/CML73700.pdf
- Current directory identity matches LTM / INE214T01019 across NSE and BSE. A mismatch or future-effective record cannot apply the alias.

The current source row is preferred when the financial snapshot contains both the old and current ticker; values from the old row are not mixed into the newer row. Other legacy mismatches are deliberately not joined by approximate company name. Verified source/change notice is available in company details.

### Checks

All 63 tests and client/server syntax checks pass. Browser verified old bookmark, old/current search, price-history load, navigation semantics and keyboard selection. Goal remains active; the scorecard does not certify complete market coverage or feature parity.


## Iteration 6 — partial-source recovery and complete primary-flow acceptance

Previous turn: progress (identity merge, source safety and keyboard chart checks). All work remains local.

| Aspect | Score / 10 | Evidence / remaining acceptance |
|---|---:|---|
| Core flows, navigation and search | 9 | All seven sortable columns verified ascending/descending in the real 100-row table. Next page shows rows/ranks 101–200. Company→browser Back restores page 2; changing sector starts page 1. Reset returns market cap/all companies. These complement prior mobile search, aliases, watchlist persistence/removal and comparison checks. |
| Visual hierarchy, alignment and sizing | 8.5 | Failure notice is compact and appears only when needed; dark/intermediate review remains. |
| Responsive layouts | 8.5 | Prior acceptance retained; new notice wraps on small screens. Broader state review remains. |
| Charts and interactions | 8.5 | History requests now have a 20-second bound and reject malformed payloads; retries discard failed cached requests. More chart-state acceptance remains. |
| Data identity and valuation correctness | 8.5 | Bad financial/directory/supporting source schemas are isolated rather than rendered as valid data. Prior unresolved identities remain. |
| Data freshness and coverage | 8 | No new coverage claim. Supplementary failures never manufacture missing share counts or IPO dates. |
| Reliability and recovery | 8.5 | Up from 8: six sources load independently; one usable core source is enough, while both core sources failing shows Retry. Browser controlled-file test retained live quotes, four comparison selections and history; restoring the source and Retry removed the notice. Repeated retries start only one polling interval. Historical timeout/retry and malformed-payload boundaries covered; wider failure matrix remains. |
| Accessibility | 8.5 | Partial-source status and Retry are visible/keyboard-operable; primary-flow checks retained. Broader state review remains. |
| Performance | 8.5 | Up from 8: overlapping market reads share one pending request, preventing duplicate requests and late-response races; repeated source retries do not multiply polling timers. Full quote payloads/rendering still warrant work. |
| Security and input handling | 8.5 | Core source identity/metric/source-field types and supporting-record shape validated. Previous URL protections retained. Server/callback review remains. |
| Privacy and saved preferences | 9 | Partial data no longer removes unresolved saved comparisons. Unavailable selections remain identifiable/removable; preferences are preserved through retry. |
| CSV and image exports | 8.5 | Prior acceptance retained; remaining combinations remain open. |
| Metadata, search visibility and sharing | 8 | Prior acceptance retained. |
| Maintainability and test coverage | 8.5 | Public-source fetching extracted into one module; focused failure/concurrency tests added. All 69 tests and syntax/asset-version checks pass. |
| Documentation and operations | 8.5 | Up from 8: actual controlled recovery documented and a source-failure runbook added; source file restored, filters reset, no extra server restarted. Broader release/fault review remains. |

### Browser evidence

- Temporarily withheld only the local supplementary IPO file. The page identified that source by name, retained live Zerodha quotes, all four compared companies and a working history chart.
- Restored the same file, selected Retry data, and verified the notice hidden, history loaded and all four selections retained.
- Both sorting directions passed monotonicity checks for rank, name, market cap, source price, daily change, relative trend and sector (100 rendered rows per check).
- Pagination verified 101–200 / 5,683, 100 rows, first rank 101. Browser Back restored that page after opening a company. Banking selection then displayed 1–100 / 115 and Reset restored the default view.

### Automated evidence

Six new tests cover optional-source loss, either/both core-source loss, bad source schemas, single polling initialization, malformed-history retry and concurrent request coalescing. The existing startup retry test exercises the extracted loader. Full suite: 69 passing tests, all 18 browser scripts and root server modules syntax checked, asset content versions verified.

Goal remains active. Primary flows and saved preferences now reach 9; the remaining aspects do not yet pass the full completion audit.

## Iteration 7 — calculated parameters, faster histories and market-wide trends

Previous turn: progress (duplicate parameter control and snapshot-label cleanup). All work remains local; GitHub updates remain paused.

| Aspect | Score / 10 | Current evidence / remaining acceptance |
|---|---:|---|
| Core flows, navigation and search | 9 | Multiple independent parameter columns verified before permanent Market cap; Revenue + P/S survive reload. Independent removal and default reset covered. Existing primary-flow acceptance retained. |
| Visual hierarchy, alignment and sizing | 8.5 | Rank/move is 72px; clean snapshot status and duplicate default parameter controls removed. Added columns use intentional table scrolling without document overflow. More states remain. |
| Responsive layouts | 8.5 | Prior phone route acceptance retained; current added-column view has no document overflow. Full added-column mobile acceptance remains. |
| Charts and interactions | 8.5 | Four comparison lines complete; 5Y has year-only markers. Real Zerodha ranking trends use a shared 30-calendar-day axis, short IPO histories remain proportional, single-day IPO is a point. Provider/error/export combinations remain. |
| Data identity and valuation correctness | 8.5 | Executable parameter audit adds 564 approximate P/S and 564 separately labelled pretax margins without misusing pretax earnings as net profit. Inputs, dates and recalculation tested. 30 unresolved legacy identities remain. |
| Data freshness and coverage | 8 | 4,574 usable Zerodha histories from 4,728 checked out of 5,040 matched companies at the recorded runtime observation. Background work continues; 154 checked histories unavailable. Share/financial gaps remain. |
| Reliability and recovery | 8.5 | History queue deduplicates and prioritizes requests; persists private cache across restart. Server restarted successfully with authenticated provider and three connections. Broader provider failure matrix remains. |
| Accessibility | 8.5 | Remove-column controls have names; existing keyboard chart acceptance retained. Complete dynamic-column keyboard/screen-reader review remains. |
| Performance | 8.5 | Timeline preloads and shared paced scheduler implemented. Warm four-company 5Y change measured 278ms; prior single-company switches 281–292ms and first visible line 405ms. These are local cache/session observations, not cold-provider guarantees. Full-payload/render work remains. |
| Security and input handling | 8.5 | Explicit realpath boundary rejects sibling traversal and symlink escapes, independent of root trailing slash. Global no-referrer added; private cache modes retained. Full callback/server adversarial review remains. |
| Privacy and saved preferences | 9 | Column selections persist locally; private history cache stays under .local. Prior preference acceptance retained. |
| CSV and image exports | 8.5 | Annual/dark improvements retained; incomplete history charts cannot export. Broad export matrix remains. |
| Metadata, search visibility and sharing | 8 | Hash-route sharing/crawler limits remain. |
| Maintainability and test coverage | 8.5 | 84 passing tests, 20 browser scripts and root server module syntax checks, asset version checks. New isolated queue, trends, metric and public-file modules. Coupled rendering remains. |
| Documentation and operations | 8.5 | PARAMETER_AUDIT.md covers every parameter; API and test documentation updated to actual cache/queue contracts and verified counts. Wider operational acceptance remains. |

Checks on 2 November 2026: fresh parameter audit, full automated suite, running-server status and no-referrer response, four-line comparison completion, cached 5Y switch, persisted Revenue/P/S order, 72px rank width and current preview screenshot. Server remains loopback-only. Market closed status is red; Snapshot shows the quote date without a provider suffix. Goal remains active: the current evidence does not establish 9 on every aspect.

## Iteration 8 — consistent brand and keyboard-safe ranking columns

Previous turn: progress (shared header/favicon asset, verified loaded). Current work remains local.

Reproduced the keyboard defect before editing: Enter on Revenue or its sort header left document.activeElement at BODY. Column rebuilds now restore the equivalent control, preserve horizontal scroll, and choose a surviving removal control or permanent Market cap sort after deleting a column. Restored header controls are revealed beside the sticky Company column instead of being hidden underneath it. Added a persistent polite status region for explicit add/remove/sort actions; streaming prices are not announced through this region. Removal buttons have a 28px target, increased to 36px on coarse-pointer devices.

Browser acceptance: Revenue add retains parameter focus; P/S sort retains focus and exposes descending aria-sort; deleting P/S focuses Revenue removal; deleting the last extra column focuses Market cap sort. On the phone-sized preview, page width equals viewport width (386 CSS px), while the 1,144px table scrolls within its 361px container. After removal, the focused control begins at 220.65px, beyond the sticky Company's 212.55px edge. Temporary viewport override reset, test columns removed and default cap order restored. Both logo locations reference the same favicon.svg asset.

| Aspect | Score / 10 | Assessment |
|---|---:|---|
| Core flows, navigation and search | 9 | Prior acceptance plus keyboard-safe multi-column controls. |
| Visual hierarchy, alignment and sizing | 8.5 | Brand consistency and usable removal targets improved; broader state review remains. |
| Responsive layouts | 8.5 | Multiple columns verified without phone page overflow; full feature matrix remains. |
| Charts and interactions | 8.5 | Prior evidence retained; provider/error/export matrix remains. |
| Data identity and valuation correctness | 8.5 | Prior evidence retained; unresolved identities/corporate actions remain. |
| Data freshness and coverage | 8 | Financial and verified-share coverage gaps remain. |
| Reliability and recovery | 8.5 | Interaction rebuilds preserve the user's place; broader fault acceptance remains. |
| Accessibility | 8.5 | Confirmed focus-loss bug fixed and tested; wider chart/table/dialog semantics still need acceptance before 9. |
| Performance | 8.5 | Previous history improvements retained. |
| Security and input handling | 8.5 | Previous public-file boundary improvements retained. |
| Privacy and saved preferences | 9 | Prior evidence retained; temporary test selections cleaned up. |
| CSV and image exports | 8.5 | Broad export matrix remains. |
| Metadata, search visibility and sharing | 8 | Hash-route sharing limits remain. |
| Maintainability and test coverage | 8.5 | 86 tests pass, including two new focus/scroll/removal regression cases; all module syntax and asset checks pass. |
| Documentation and operations | 8.5 | Current defect, measured acceptance and limitations recorded. |

Scores are unchanged because these fixes address part of the remaining acceptance work, not all aspects. Goal remains active.

## Iteration 9 — identity corrections, consistent totals and two-row market ticker

Previous iteration: progress (keyboard-safe column interactions). GitHub publishing remains paused.

Verified five further symbol/name changes from official exchange/issuer notices: ICICIPRULI→ICICILIFE, WELSPUNIND→WELSPUNLIV, TIDEWATER→VEEDOL, HSIL→AGI and HIL→BIRLANU. Each mapping requires the expected directory ISIN and effective date. Current symbols are canonical; source tickers, old searches, saved selections and bookmarks remain supported. Integration audit confirms one row per mapped identity with financials retained. Existing LTM mapping also uses canonical symbols consistently. Unresolved legacy entries fell from 30 to 25; no fuzzy-name matches were added.

Headline market cap now uses distinct verified ISINs with finite positive valuations, matching the market-map universe. Companies tracked counts 5,653 verified identities; 25 unresolved source rows remain searchable but do not inflate aggregate totals. Reference audit now has 5,678 rows and 569 calculated P/S/pretax-margin pairs. This remains a coverage-limited financial dataset.

The new market ticker has a separate equal-spacing index row above a scrolling stock row. Index order starts Nifty 50, Sensex. Seven actual index quotes are supplied separately by the local Zerodha backend; index binary packets use their own 28/32-byte layout and point units. All 50 stock constituents come from the official NSE Indices CSV, matched by ISIN. Stocks shuffle once per load; quote updates do not reshuffle or restart motion. Mouse/touch dragging, hover/window-focus pause, explicit pause/resume, and static reduced-motion scrolling are implemented. Missing prices remain unavailable. The top-right status now shows the date without the word Snapshot, per user direction.

| Aspect | Score / 10 | Remaining evidence needed |
|---|---:|---|
| Core flows, navigation and search | 9 | Prior primary acceptance retained; new mappings have automated/integration evidence. |
| Visual hierarchy, alignment and sizing | 8.5 | New two-row ticker needs rendered desktop/mobile review. |
| Responsive layouts | 8.5 | Prior acceptance retained; new ticker layout remains visually unverified. |
| Charts and interactions | 8.5 | Prior history/export/error matrix remains open. |
| Data identity and valuation correctness | 8.5 | Five duplicate identities fixed and headline totals aligned; 25 unresolved records/corporate actions remain. |
| Data freshness and coverage | 8 | New indices and corrected matches improve utility; large financial/share gaps remain. |
| Reliability and recovery | 8.5 | Provider index isolation and validated constituent refresh added; full fault acceptance remains. |
| Accessibility | 8.5 | Motion controls and hidden/inert ticker clone implemented; real keyboard/pointer/reduced-motion acceptance remains. |
| Performance | 8.5 | Ticker reuses existing polling, patches values and retains its animation; rendered profiling remains. |
| Security and input handling | 8.5 | Prior boundaries retained; no credentials exposed by index payload. |
| Privacy and saved preferences | 9 | Alias migration deduplicates saved selections; prior acceptance retained. |
| CSV and image exports | 8.5 | Prior acceptance retained. |
| Metadata, search visibility and sharing | 8 | Hash-route sharing limits remain. |
| Maintainability and test coverage | 8.5 | 93 tests pass; 21 browser scripts and root modules pass syntax and asset-version checks. |
| Documentation and operations | 8.5 | Constituent refresh command, API units, current audit counts and inspection limitations documented. |

Visual verification is currently unavailable: the new browser tool reports local browser access disabled, and the catalogued browser SKILL.md is missing from its installed package. Preview opening was requested through the app panel tool and returned queued. The local server was confirmed stopped before being started; actual API responses confirmed all seven indices. No visual score was raised on the basis of those API checks. Goal remains active.

Official sources:
- https://nsearchives.nseindia.com/content/circulars/FAOP77013.pdf
- https://nsearchives.nseindia.com/content/circulars/CML59625.pdf
- https://nsearchives.nseindia.com/corporate/TIDEWATER_03102024181030_CML64320.pdf
- https://archives.nseindia.com/content/circulars/CML52200.pdf
- https://cms.birlanu.com/public/media/2025/04/07/se-cl-name-change-communication-dt-04042025signed.pdf
- https://www.niftyindices.com/IndexConstituent/ind_nifty50list.csv
- https://kite.trade/docs/connect/v3/websocket/

## Iteration 10 — local API isolation and one-time login acceptance

Previous turn: progress (two-row ticker, shuffled stock order and actual index API coverage). No public deployment performed.

Added exact loopback Host/port validation and browser-origin/Fetch Metadata checks before local API work. Other websites and same-site different-port apps cannot start history preloads or broker login requests through browser subresources. Top-level broker callbacks retain a narrow exception followed by state/cookie validation. HEAD requests cannot mutate login/preload state. Pending login states are bounded to 32, expire after ten minutes and are consumed once. Session files now replace atomically with exclusive mode-0600 temporary files, including when the prior destination is a symlink.

Automated acceptance now includes 99 passing tests: successful fake-token checksum exchange, no secret in public payloads, expiry/replay, bounded state storage, restrictive atomic session replacement, and request-origin/callback policy. The test credential values never contact the real provider. The date-label test no longer assumes the execution day is 2 November.

Running-server checks after graceful restart: direct/same-origin market 200; cross-site market/preload and same-site other-port history 403; HEAD login 405; top-level forged callback 400; iframe and fetch callbacks 403. Raw HTTP was used for navigation headers because Node fetch forces its own fetch-mode header. The authenticated session remained connected, supplying seven index quotes and 7,239 equity quotes. No real broker login was initiated for these checks.

| Aspect | Score / 10 | Current assessment |
|---|---:|---|
| Core flows, navigation and search | 9 | Prior acceptance retained. |
| Visual hierarchy, alignment and sizing | 8.5 | Two-row ticker still needs rendered acceptance. |
| Responsive layouts | 8.5 | New ticker visual matrix pending. |
| Charts and interactions | 8.5 | Prior provider/export matrix pending. |
| Data identity and valuation correctness | 8.5 | 25 unresolved legacy rows and corporate-action acceptance remain. |
| Data freshness and coverage | 8 | Financial/share coverage gaps remain. |
| Reliability and recovery | 8.5 | Existing provider connection survived restart; broader fault matrix pending. |
| Accessibility | 8.5 | New ticker pointer/keyboard/reduced-motion visual acceptance pending. |
| Performance | 8.5 | Broad rendering/payload profiling remains. |
| Security and input handling | 9 | Up from 8.5 for the intended private loopback workflow: callback/replay/file/origin/server boundaries now tested and runtime-checked. This does not certify public multi-user hosting or arbitrary local process isolation. |
| Privacy and saved preferences | 9 | Prior acceptance retained; public payload credential exclusion verified. |
| CSV and image exports | 8.5 | Remaining export matrix pending. |
| Metadata, search visibility and sharing | 8 | Hash-route sharing limitation remains. |
| Maintainability and test coverage | 8.5 | 99 tests; 21 client scripts and root modules checked. Rendering coupling remains. |
| Documentation and operations | 8.5 | Security assumptions, acceptance responses and current API contract documented. |

Browser inspection was retried and still reports local browser use disabled. Other independent work remains possible; goal stays active. No visual rating was raised without a rendered check.

## Iteration 11 — compact ticker, header cleanup and smoother chart changes

Previous turn: progress (local API/login boundaries checked). User steering completed locally: coverage text moved beneath the header logo; separate context strip removed; bar-chart zero/maximum caption removed; ticker pause button removed; ticker stock prices follow USD/INR while indices stay in points; stock spacing and minimum value widths reduced. Hover/focus/drag pause still works in the implementation. Constituent shuffle and separate index order remain unchanged.

Historical chart range buttons now remain mounted while new data loads, avoiding focus loss and repeated control rebuilds. Existing charts ease to 60% opacity while waiting; complete real SVGs crossfade over 320ms when new data arrives. The outgoing SVG is inaccessible/non-interactive and removed after the animation. The initial line reveal lasts 480ms without vertical displacement. Live quote redraws skip repeated chart entry animations. Reduced-motion mode avoids the added motion. This changes presentation only; historical points, common baselines, axes and tooltip calculations are retained.

Automated evidence: 101 passing tests, 21 browser scripts/root module syntax and asset-version checks. New tests verify transient artwork cleanup and reduced-motion boundaries; ticker formatting test now verifies USD/INR conversion and invariant index points. Local HTTP responses serve the updated header, ticker and chart scripts. No restart was necessary for these client assets. No visual acceptance claim: browser access was rechecked and still reports disabled.

| Aspect | Score / 10 | Current assessment |
|---|---:|---|
| Core flows, navigation and search | 9 | Prior acceptance retained; timeline controls now remain mounted. |
| Visual hierarchy, alignment and sizing | 8.5 | User-requested cleanup implemented; rendered header/ticker check pending. |
| Responsive layouts | 8.5 | Compact ticker styles implemented; new layout visual matrix pending. |
| Charts and interactions | 8.5 | Motion and control stability improved; perceived smoothness and broader export/error checks pending. |
| Data identity and valuation correctness | 8.5 | Prior identity/corporate-action gaps remain. |
| Data freshness and coverage | 8 | Prior financial/share coverage gaps remain. |
| Reliability and recovery | 8.5 | No provider/queue contract changed; broader fault acceptance remains. |
| Accessibility | 8.5 | Reduced-motion and outgoing artwork isolation tested; rendered keyboard/pointer checks pending. |
| Performance | 8.5 | Repeated entry animation removed from quote redraws; payload profiling work deferred while implementing user chart/UI requests. |
| Security and input handling | 9 | Prior private-loopback boundary acceptance retained. |
| Privacy and saved preferences | 9 | Prior acceptance retained. |
| CSV and image exports | 8.5 | Outgoing artwork appended after actual SVG; export selects current real SVG. Downloaded-image matrix still pending. |
| Metadata, search visibility and sharing | 8 | Hash-route sharing limit remains. |
| Maintainability and test coverage | 8.5 | 101 checks; shared motion helper and explicit tests added. Rendering coupling remains. |
| Documentation and operations | 8.5 | Current controls, units, evidence and limitations documented. |

Goal remains active; publication remains paused. Scores were not raised on the basis of unviewed animations or layouts.

## Iteration 12 — incremental quote delivery with full-set recovery

Previous iteration: progress (requested layout/ticker changes and chart motion). All work remains local.

Measured the original five-second market refresh at 591,222 gzip bytes for 7,239 company quotes and seven indices. Added opt-in revision-based updates. After one full load, unchanged refreshes measured 509 actual response bytes and 9–12ms locally across three checks. The client retained all 7,239 company quotes and seven indices throughout. Initial full transfer remains necessary; a busy market will transfer more changed records. The reduction applies to this endpoint, not every site request.

The server keeps one latest revision per instrument, without an unbounded event log. Record removal, provider change and restart create a new epoch and full replacement. The client validates and atomically merges updates; malformed/out-of-sequence/count-mismatched data resets its cursor to request a full set. Received-at-only updates do not resend prices; real trade/exchange times and every other quote field remain significant. UI change detection now notices previous-close/average-price updates even when price/volume stay constant. A reconnected feed with zero received quotes cannot label stale stored prices Live. Ticker lookups now use an ISIN map and unchanged text is not rewritten.

Evidence: 108 passing tests; 22 browser scripts/root modules and asset versions checked. Actual readFeed full→changed-only→unchanged integration retains the complete dataset. Live server transfer/reconstruction audit saved privately and summarised in PERFORMANCE_AUDIT.md. No visual score is inferred from network measurements.

| Aspect | Score / 10 | Current assessment |
|---|---:|---|
| Core flows, navigation and search | 9 | Complete quote sets remain the view contract. |
| Visual hierarchy, alignment and sizing | 8.5 | Revised header/ticker rendered acceptance pending. |
| Responsive layouts | 8.5 | Revised ticker mobile acceptance pending. |
| Charts and interactions | 8.5 | Perceived motion and broader export/error matrix pending. |
| Data identity and valuation correctness | 8.5 | Quote fields retain meaning; unresolved identities remain. |
| Data freshness and coverage | 8 | Corrected empty-feed Live boundary; financial/share coverage gaps remain. |
| Reliability and recovery | 8.5 | Delta resync/removal/restart tests pass; broader visual/provider-failure matrix pending. |
| Accessibility | 8.5 | Prior motion/focus fixes retained; real new-layout acceptance pending. |
| Performance | 8.5 | Major transfer bottleneck removed with measured evidence; real rendering/mobile profiling still needed for 9. |
| Security and input handling | 9 | No-store, loopback isolation and secret boundaries retained. |
| Privacy and saved preferences | 9 | Quote reconstruction is memory-only. |
| CSV and image exports | 8.5 | Full arrays remain available; downloaded-image acceptance remains. |
| Metadata, search visibility and sharing | 8 | Hash-route sharing remains. |
| Maintainability and test coverage | 8.5 | New delivery modules isolated and tested; coupled view rendering remains. |
| Documentation and operations | 8.5 | Protocol, measurements, recovery and limits documented. |

Goal remains active; GitHub publication remains paused. Current evidence still does not establish 9 on every aspect.

### Iteration 13 — atomic comparison chart updates
All selected comparison histories now render together after the batch settles, rather than adding lines as individual requests finish. Existing charts remain visible during loading, with one transition to the completed selection. Regression checks cover out-of-order responses, failed histories and obsolete timeline requests. Full suite: 114 passing. Browser visual verification is still unavailable. GitHub publication remains paused.

Scores remain unchanged pending broader acceptance: navigation/core 9; security (private loopback scope) 9; privacy/preferences 9; data coverage/freshness 8; metadata/sharing 8; design, responsive layout, charts, identity/valuation, reliability, accessibility, performance, exports, maintainability and operations/docs 8.5 each. Clean public entry-page work is not yet accepted through live-server/browser checks and receives no score increase.

### Iteration 14 — direct company pages and sharing metadata

Completed local generation and server acceptance of 5,653 verified company entry pages, plus section entry documents. Each company document provides escaped identity content, its own title/description and a canonical company URL before application scripts run. The sitemap contains 5,658 public URLs. Watchlists are noindex and excluded. Historical hash links remain supported; unbuilt newly discovered companies retain hash URLs. Asset roots stay stable during clean-path navigation. Unknown paths return 404; trailing-slash redirects preserve queries. No financial snapshot values or private broker cache is embedded in generated HTML.

Evidence: 114 automated checks pass, generation freshness verified, and live local HTTP acceptance recorded in .local/public-pages-audit.json. Reliance, M&M, ICICI Life, compare, watchlist and rankings returned the expected documents/assets. Deployment, architecture, API, user and test documentation updated. Real browser back-navigation, mobile rendering and social-preview acceptance remain unverified; no publication or search-engine indexing claim is made.

| Aspect | Score / 10 | Remaining evidence or work |
|---|---:|---|
| Core flows, navigation and search | 9 | Preserve prior accepted flows; real clean-path back-navigation check pending. |
| Visual hierarchy, alignment and sizing | 8.5 | Current header/ticker visual acceptance. |
| Responsive layouts | 8.5 | Current mobile layout acceptance. |
| Charts and interactions | 8.5 | Real perceived motion and export/error acceptance. |
| Data identity and valuation correctness | 8.5 | Resolve remaining identities and incomplete shares. |
| Data freshness and coverage | 8 | Financial/share data coverage gaps. |
| Reliability and recovery | 8.5 | Broader provider-failure/browser acceptance. |
| Accessibility | 8.5 | Current rendered keyboard/screen-reader acceptance. |
| Performance | 8.5 | Current rendering/mobile profiling. |
| Security and input handling | 9 | Scoped to private loopback use. |
| Privacy and saved preferences | 9 | Existing local-only preference boundaries retained. |
| CSV and image exports | 8.5 | Downloaded image visual acceptance. |
| Metadata, search visibility and sharing | 8.5 | Direct documents and metadata verified over HTTP; browser/social-preview acceptance remains. |
| Maintainability and test coverage | 8.5 | Coupled view rendering remains. |
| Documentation and operations | 8.5 | Release/browser acceptance remains. |

Previous turn classified as progress: comparison batch rendering and deferred-response regression tests changed authoritative source and passed checks. This iteration also makes concrete source/runtime/documentation progress. Goal remains active; GitHub publishing remains paused.

### Iteration 15 — accessible chart observations and gesture recovery

Added a collapsed View chart data alternative to comparison and individual-stock interactive line charts. Opening it lazily builds a table for each plotted series using its actual observation labels and formatter; no synthetic rows or hidden interpolation is introduced. Tables use captions, scoped column/row headers, safe textContent identity/value insertion, bounded scrolling and named keyboard-focusable regions. Collapsed tables incur no observation DOM cost.

Keyboard focus now immediately exposes the current observation, and refocusing after pointer use restores that behavior. Interactive SVGs identify themselves as chart groups rather than static images. Cancelling a pointer gesture clears pinned, anchor and pointer state so subsequent movement works normally. The existing compact drag comparison and reduced-motion crossfade behavior remain.

Evidence: 116 checks passing, including lazy table semantics/source-values/text safety, keyboard entry/Home/Escape/blur/refocus, cancelled drag recovery and existing reduced-motion/batch-animation regressions. Browser asset versions and generated public pages refreshed. Real browser/screen-reader/mobile acceptance remains unavailable; automated DOM models do not establish assistive-technology usability.

| Aspect | Score / 10 |
|---|---:|
| Core flows, navigation and search | 9 |
| Visual hierarchy, alignment and sizing | 8.5 |
| Responsive layouts | 8.5 |
| Charts and interactions | 8.5 |
| Data identity and valuation correctness | 8.5 |
| Data freshness and coverage | 8 |
| Reliability and recovery | 8.5 |
| Accessibility | 8.5 |
| Performance | 8.5 |
| Security and input handling (private loopback scope) | 9 |
| Privacy and saved preferences | 9 |
| CSV and image exports | 8.5 |
| Metadata, search visibility and sharing | 8.5 |
| Maintainability and test coverage | 8.5 |
| Documentation and operations | 8.5 |

Previous goal turn classified as progress: generated entry pages were accepted over HTTP and their build/release behavior documented. This iteration changes source and adds behavioral regression evidence. No aspect is raised solely on automated test count. Goal remains active; publishing remains paused.

### Iteration 16 — remove header coverage subtitle

Removed the flag/Indian equities/NSE & BSE coverage line beneath the logo, as requested, including unused subtitle styling. Regenerated all company and section entry pages from the updated header. 116 checks pass. Scores remain unchanged from iteration 15: navigation/security/privacy 9; data freshness/coverage 8; all other recorded aspects 8.5. No visual acceptance or score increase is inferred from this small removal. Feed-refresh recovery investigation identified a generic-feed empty-table failure path; implementation remains outstanding. GitHub publishing remains paused. Previous iteration was progress (chart source alternatives and gesture recovery); this iteration changes authoritative shared header output.

### Iteration 17 — retain prices through refresh outages

A failed market HTTP request now reports disconnected/refreshFailed, preserves known provider configuration and prior authentication, and sets socket connections to zero rather than misclassifying the installation as unconfigured. The poller leaves the current generic-feed company dataset and rendered prices intact on that failure result; the next valid response updates normally. Broker authentication is not inferred to have expired merely because local transport failed. Existing Kite prices remain retained and cannot retain a Live indicator on this failure response.

Trade freshness now ignores invalid timestamps and requires a non-negative age below two minutes. Future timestamps cannot trigger Live; valid recent timestamps still work alongside invalid rows. Existing market-open/authenticated/received/socket checks remain.

Evidence: 119 passing automated checks. New behavioral tests drive the actual polling callback through failure and recovery, assert retained prices/no failed redraw, verify preserved configuration/authentication with zero sockets, and test future/invalid timestamp boundaries. Local HTTP acceptance confirms current app.js/kite-ui.js and the requested header subtitle removal are served by the running preview. No provider outage was induced and browser rendering remains unverified.

| Aspect | Score / 10 |
|---|---:|
| Core flows, navigation and search | 9 |
| Visual hierarchy, alignment and sizing | 8.5 |
| Responsive layouts | 8.5 |
| Charts and interactions | 8.5 |
| Data identity and valuation correctness | 8.5 |
| Data freshness and coverage | 8 |
| Reliability and recovery | 8.5 |
| Accessibility | 8.5 |
| Performance | 8.5 |
| Security and input handling (private loopback scope) | 9 |
| Privacy and saved preferences | 9 |
| CSV and image exports | 8.5 |
| Metadata, search visibility and sharing | 8.5 |
| Maintainability and test coverage | 8.5 |
| Documentation and operations | 8.5 |

Ratings remain conservative: real browser/provider-failure acceptance and coverage improvements remain necessary. Previous iteration classified as progress (requested shared-header removal and regeneration). This iteration resolves the previously identified refresh recovery defect. Goal remains active; GitHub publication remains paused.

### Iteration 18 — metric discovery and chart shortcut navigation

Reordered the ranking metric controls around the expected research workflow (product judgment, not measured usage analytics). Primary connected controls now read Market cap, P/E ratio, Revenue, Earnings, Dividend yield and Volume. Offline controls use Operating margin in place of Volume. More metrics prioritises remaining valuation ratios/EPS, margins, trading activity, then debt/cash/assets, shares and employees. Price/day change/cost-to-borrow remain excluded from additions. Selected column order, calculations, permanent market cap and comparison row order remain unchanged.

Chart shortcuts now move keyboard focus to the destination card before scrolling, use instant scrolling under reduced motion and avoid adding permanent Tab stops. Existing click prevention already kept shortcuts/skip links local on clean paths. Added behavioral focus/scroll/reduced-motion tests, refreshed assets and rebuilt public entries. 120 checks pass. Browser visual acceptance remains pending.

Scores: core navigation 9; security (local scope) 9; privacy/preferences 9; freshness/coverage 8; visual design, responsive layouts, charts, identity/valuation, recovery, accessibility, performance, exports, metadata/sharing, maintainability and documentation/operations each 8.5. No unverified score increases. Prior iteration classified as progress (refresh failure retention and timestamp correctness); current iteration changes navigation and requested ranking controls. Goal active; GitHub publication paused.

### Iteration 19 — nonblocking supporting data and stock-price label

Company financials/directory can now render before delayed supporting share-count/IPO files finish. Supporting requests still start concurrently and preserve their validation/failure isolation; pending fields remain unavailable until received. A temporary supporting-data loading notice clears on completion. Final hydration applies all records and starts the feed once. Existing-data retries retain the prior all-at-once path rather than clearing known supporting records. If both critical sources fail, the recoverable failure view remains. No fabricated supporting observations are introduced.

Renamed Source price to Stock price in rankings, comparison and the sorting announcement, per the user's request. Ranking price uses this same general heading when closing-price reports exist; detailed provenance remains in values/source details.

Evidence: 123 checks pass. Deferred-source tests prove usable core output precedes optional completion, records arrive intact, empty critical results never trigger early output, and actual bootstrap renders early/final states with preserved saved selections and a single feed initialization. This proves removal of the dependency wait, not a measured browser startup duration. Browser profiling remains pending.

Scores unchanged: core navigation/security/private preferences 9; data freshness/coverage 8; visual hierarchy, responsive layout, charts, valuation identity, reliability, accessibility, performance, exports, metadata/sharing, maintainability and operations/docs each 8.5. Previous iteration classified as progress (metric ordering and chart shortcut behavior). Goal remains active; GitHub publishing paused.

### Iteration 20 — tighter ticker separators

Reduced horizontal stock-ticker item padding from 10px to 6px per side on desktop and 8px to 5px on mobile, narrowing the breaks between neighbouring stocks. Text sizes and value spacing remain intact. Refreshed asset versions/generated entries; 123 checks pass. Visual acceptance remains pending. Scores unchanged: navigation/security/privacy 9; data coverage/freshness 8; remaining recorded aspects 8.5. Previous turn classified as progress (nonblocking supporting sources and stock-price naming); current turn implements the requested ticker spacing. Goal active; GitHub publishing paused.

### Iteration 21 — ticker typography, clickable stocks/indices, index comparisons and weekly long ranges

Increased stock ticker labels/prices/change typography and index typography. Stock item widths are measured once with the previous font sizes and locked before using larger text, preserving the previous compact footprint rather than imposing a wider strip. Stock and index items are semantic links inside list items. Pointer capture begins only after a drag threshold; an actual drag suppresses its following pointer click, while normal and keyboard clicks remain available. Duplicated scrolling content remains inert.

Added index chart routes for the seven ticker indices, using existing timeline/hover/drag interaction and image download behavior. Point units are retained in labels, values, differences and standalone chart geometry irrespective of USD/INR. Index chart pages offer add/remove comparison; the comparison picker includes indices and companies up to the existing four-item limit. Index rows do not gain company shares, financials, valuation, market-cap ranking or coverage membership. The broker history route now resolves allowlisted registered indices, caches separately identified point histories, and warms index timelines in the existing paced queue.

5Y/MAX price/index charts select the last shared observation of each IST calendar week, keeping calendar-year axis rules. Mixed comparisons share observation dates and normalization. Annual market-cap source charts retain annual observations; no weekly observations are invented. Insufficient weekly histories explain the shorter-range alternative.

Evidence: 129 checks pass. Actual authenticated local requests returned 20 1M observations for all seven indices. Real 5Y Nifty 50/Sensex histories each returned 1,240 daily candles and produced 262 aligned weekly observations; year labels remained 2022–2026. Live local backend restarted with the new routes. Rendering, measured typography fit, mobile click/drag and downloaded image acceptance remain unverified; no visual score increase is inferred.

The accompanying local data-quality profile reconfirmed 5,678 rows/5,653 matched identities, 3,216 reference market-cap values and 3,194 verified share counts. All 3,195 share-source records had valid calendar dates; none conflicted on share count for the same ISIN/effective date. No missing company financials/share counts were fabricated, and the known BSE-only source gap remains.

| Aspect | Score / 10 |
|---|---:|
| Core flows, navigation and search | 9 |
| Visual hierarchy, alignment and sizing | 8.5 |
| Responsive layouts | 8.5 |
| Charts and interactions | 8.5 |
| Data identity and valuation correctness | 8.5 |
| Data freshness and coverage | 8 |
| Reliability and recovery | 8.5 |
| Accessibility | 8.5 |
| Performance | 8.5 |
| Security and input handling (private loopback scope) | 9 |
| Privacy and saved preferences | 9 |
| CSV and image exports | 8.5 |
| Metadata, search visibility and sharing | 8.5 |
| Maintainability and test coverage | 8.5 |
| Documentation and operations | 8.5 |

Prior iteration was progress (ticker spacing). Current work implements the user's successive ticker/index/comparison/weekly sampling requests with source and runtime evidence. Goal remains active; GitHub publication remains paused.

### Iteration 22 — comparison row consistency and malformed index recovery

Removed the duplicated price row from comparison and labelled the single row Stock price / index level. Index-only comparisons now show level/day change instead of an entire empty company financial table. Mixed comparisons retain company fields and label index-only inapplicability accessibly. Both live cell refresh and pulse row mapping use the same comparison metric list as initial rendering, preventing level/day-change values from being assigned to the wrong row after filtering.

Malformed percent-encoded index bookmarks now decode safely in the refresh path, matching the existing guarded route handling. They cannot throw from the index refresh wrapper and interrupt polling.

Evidence: 131 checks pass. Regression tests assert one price row, index-only row selection, mixed-index inapplicability, actual live refresh row mapping, and non-throwing malformed-route decoding. Shared assets regenerated. Browser visual acceptance remains pending; no visual rating increased.

Scores: navigation/core 9; security (private loopback scope) 9; privacy/preferences 9; data coverage/freshness 8; visual design, responsive layout, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, exports, metadata/sharing, maintainability and documentation/operations each 8.5. Goal remains active; GitHub publication paused. Previous turn classified as progress (ticker/index/weekly features and actual provider checks); current turn fixes observed comparison and route defects.

### Iteration 23 — consistent estimated-valuation presentation

The shared metric renderer now annotates price-scaled market caps with ≈ and their calculation basis. Comparisons and related company financial cards previously used raw formatting, so an estimated valuation could appear exact outside the rankings. Company overview/related card output now uses the same renderer, and ranking annotation delegates value markup to it. Valid exact caps and missing values retain their existing presentation. No underlying valuation, share-count or price is changed.

Evidence: 132 checks pass. Regression coverage verifies estimated/exact/missing caps, preserved other derived-ratio markers and escaped calculation-basis text. Assets and generated entry pages refreshed. Current tool discovery returned no browser-control tool and no browser SKILL.md was present in the installed browser package; rendered inspection remains unavailable. No workaround browser was launched.

Scores remain navigation/core 9, security (private loopback scope) 9, privacy/preferences 9, data freshness/coverage 8, and visual hierarchy, responsive layout, charts, identity/valuation, recovery, accessibility, performance, exports, metadata/sharing, maintainability and operations/docs 8.5 each. The consistency defect is fixed, but broader data and rendered acceptance remain outstanding. Previous iteration classified as progress (comparison table/route recovery); current iteration changes shared valuation presentation and adds behavioral evidence. Goal active; GitHub publication paused.

### Iteration 24 — batched ticker geometry

Reworked ticker width preservation to insert all old-typography measurement probes first, read their geometry together, then remove/apply widths together. This removes the former interleaved layout read/write cycle for each stock. Duplicate scrolling copies share one measurement per stock. Already-sized tickers perform no new probes, reads or width writes during quote updates. Typography and locked footprint behavior are preserved.

Evidence: 133 checks pass. A behavioral layout-operation regression verifies all appends precede all reads, reads precede removal/application, duplicates receive the same width from one probe, and the next pass performs no additional work. This establishes the operation ordering, not a measured browser frame-time improvement. Browser profiling/visual acceptance remains unavailable.

Scores unchanged: navigation/core 9; private-loopback security 9; privacy/preferences 9; data freshness/coverage 8; visual design, responsive layouts, charts, identity/valuation, reliability, accessibility, performance, exports, metadata/sharing, maintainability and documentation/operations each 8.5. Performance stays 8.5 until actual rendered/mobile profiling supports 9. Previous turn classified as progress (consistent estimated cap presentation); current turn changes ticker geometry work and supplies regression evidence. Goal active; GitHub updates paused.

### Iteration 25 — static chart exports and bounded PNG recovery

Exported SVGs now use static image semantics, preserve the chart label/point units and strip keyboard instructions, focus targets and live-region references copied from interactive charts. Existing hover-overlay removal and full-opacity line export are retained through an isolated cloneChartForExport helper; the live SVG is unchanged.

Image downloads expose a Preparing state with aria-busy and restore the button text/state on every completion path. PNG image decoding now has a 15-second bound, with handler/timer/object-URL cleanup on success, failure and timeout. A failed download click still schedules download-URL cleanup. PNG failures offer SVG; SVG failures request retry rather than circularly recommending SVG again. Loading timelines remain blocked from exporting stale chart artwork.

Evidence: 138 checks pass. Five new behavioral regressions cover static SVG label/style/control separation, PNG success, decode/null-blob failure, stalled decoding timeout, SVG-click cleanup and the loading guard. Actual image decoding, downloaded files and appearance remain unverified through the browser, so exports stays 8.5 rather than inferring visual acceptance from mocks.

| Aspect | Score / 10 |
|---|---:|
| Core flows, navigation and search | 9 |
| Visual hierarchy, alignment and sizing | 8.5 |
| Responsive layouts | 8.5 |
| Charts and interactions | 8.5 |
| Data identity and valuation correctness | 8.5 |
| Data freshness and coverage | 8 |
| Reliability and recovery | 8.5 |
| Accessibility | 8.5 |
| Performance | 8.5 |
| Security and input handling (private loopback scope) | 9 |
| Privacy and saved preferences | 9 |
| CSV and image exports | 8.5 |
| Metadata, search visibility and sharing | 8.5 |
| Maintainability and test coverage | 8.5 |
| Documentation and operations | 8.5 |

Previous iteration classified as progress (batched ticker geometry). Current iteration changes export semantics and recovery with behavioral evidence. Goal remains active; GitHub updates paused.

### Iteration 26 — current operating documentation and executable reference checks

Audited the documentation against current source, package/workflow and available evidence. Corrected outdated statements that ranking trends are illustrative, that Node is unavailable, that only seven test files exist, and that there is no page-generation step. Updated setup, source/units, README, architecture/module map, product scope, live-data evidence, user guidance, control-room status, handoff and remaining roadmap. Current test-report wording distinguishes older browser acceptance from new unverified UI work.

Corrected privacy wording: opening histories/trends and warming comparison timelines sends instrument identifiers to the local backend/provider; saved browser lists are not an uploaded account profile. GitHub pause, local-vs-static capability boundaries, per-source coverage limits and the requirement not to expose the private broker server are explicit. The documentation index now links the authoritative scorecard, parameter and performance audits; the older feature register is identified as a baseline.

Evidence: bundled Node v24.22.1 confirmed; 140 checks pass, including asset/page freshness, script syntax and regressions. Two new reusable checks resolve local documentation links and validate documented npm scripts/Node entry files against the checkout/package. Semantic statements were reconciled by reading current source; link/command tests alone are not claimed to verify their meaning. No secret values were read or included. No new publication or current visual acceptance is claimed.

Documentation and operations increases from 8.5 to 9 for the private local workflow: current launch/recovery commands, source/runtime boundaries, release pause, evidence/limits and next-session instructions are usable and consistent. Public live operations remain a separately documented, unimplemented scope rather than a claim of production readiness.

| Aspect | Score / 10 |
|---|---:|
| Core flows, navigation and search | 9 |
| Visual hierarchy, alignment and sizing | 8.5 |
| Responsive layouts | 8.5 |
| Charts and interactions | 8.5 |
| Data identity and valuation correctness | 8.5 |
| Data freshness and coverage | 8 |
| Reliability and recovery | 8.5 |
| Accessibility | 8.5 |
| Performance | 8.5 |
| Security and input handling (private loopback scope) | 9 |
| Privacy and saved preferences | 9 |
| CSV and image exports | 8.5 |
| Metadata, search visibility and sharing | 8.5 |
| Maintainability and test coverage | 8.5 |
| Documentation and operations | 9 |

Previous iteration classified as progress (static export/recovery behavior); this iteration corrects authoritative operating documents and adds durable verification. Goal remains active; GitHub publication paused.

### Iteration 27 — bounded comparison discovery and restored preview (3 November 2026)

Added comparison name/ticker/alias search with at most 40 native select options at a time, instead of constructing options for the full multi-thousand company directory. Exact matches rank first; selected instruments are excluded, all matches remain reachable through search, and count/no-match/four-selection states are explained. Search updates only the picker, preserving the chart. Selection validation rejects unknown/duplicate IDs; adding/removing returns focus to search. Native search/select controls retain keyboard behavior; narrow layout stacks them.

Evidence: 141 checks pass. A 5,000-company regression verifies the option bound, access to the last company, exact symbol priority, alias/index lookup, selected exclusion and no-match behavior. Current browser automation became available in this turn. The local listener was confirmed absent, then the current server was started and the requested rankings preview opened visibly. A current desktop screenshot was saved to /tmp/india-stock-view-preview.png. This verifies preview delivery, not the full responsive/chart/export matrix. Comparison search visual acceptance remains pending.

Scores unchanged from iteration 26: navigation/core, local security, privacy/preferences and documentation/operations 9; data freshness/coverage 8; visual hierarchy, responsive layouts, charts, valuation/identity, recovery, accessibility, performance, exports, metadata/sharing and maintainability 8.5 each. Broader visual acceptance can now proceed through the restored supported tool. Previous iteration was progress (operating docs and executable reference checks); current iteration changes comparison discovery and restores the requested preview. Goal active; GitHub updates paused.

### Iteration 28 — rendered comparison fixes and live ticker requests (3 November 2026)

Current supported browser inspection resumed. Desktop inspection found comparison selections stretched beside the taller search controls; selections now occupy their own wrapping group. The four buttons measured equal 38px heights at phone and desktop sizes. The comparison page had no document-level horizontal overflow at a 386px CSS phone viewport or a 1,024px CSS desktop viewport. Search inspection found Nifty50 failed to match NIFTY 50; compact spelling now resolves to the same index, with source regression coverage. Existing saved selections were retained and temporary viewport overrides were reset.

Ticker inspection found all 50 stock symbols clipped after larger typography. Symbols now sit above their price/change within the prior measured item widths and unchanged 44px desktop/40px mobile strip heights. Per the user's follow-ups, stock symbols use 10px, prices 11px and change 10px; indices use compact 9/11/9px text. Price-to-change spacing is 3px with unused numeric minimum widths removed. Old-footprint probes explicitly retain the old row geometry/minimum widths. A current desktop DOM measurement confirmed zero of 50 clipped symbols, 3px value gaps and the retained ~44px row height. Final new ticker typography still needs a fresh mobile pass.

Ticker quotes now consume the complete fresh five-second market payload before company-row application, using a small current-constituent ISIN cache with NSE preference. Stock/index movement markers follow native price differences, not the day's percentage colour or currency conversion. Brief 1.1-second green/red price glows use paint-only animation, respect reduced motion and do not restart marquee movement. Initial values, duplicate payload application and source/identity changes do not invent price moves. Failed refreshes retain existing ticker quotes. No extra polling loop was introduced.

Evidence: 144 checks pass. New regressions cover direct fresh payload prices while company state is older, native up/down versus opposite signed day changes, missing change provenance, duplicate/FX/failure behavior, directional animation/reduced motion and exactly one 5,000ms poll interval. Real visible-browser observations 67 seconds apart showed 26 of 50 prices changed and all 50 price-pulse version markers advanced. This verifies real updating, not a guarantee every instrument trades each five seconds. The restored four-line 1M comparison chart was also observed with actual historical data. Screenshots: /tmp/isv-compare-mobile-2026-11-03.png (comparison controls before final ticker revision), /tmp/isv-ticker-2026-11-03.png (current desktop).

Scores remain navigation/core, local security, privacy/preferences and documentation/operations 9; data coverage/freshness 8; visual hierarchy, responsive layouts, charts, identity/valuation, reliability, accessibility, performance, exports, metadata/sharing and maintainability 8.5 each. Actual rendered evidence advances the audit, but does not establish the whole-site manual matrix or missing source coverage. Previous iteration was progress (bounded comparison discovery and restored preview); current iteration fixes observed layout/search/ticker defects and implements the user's ticker requests. Goal active; GitHub updates paused.


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

### Iteration 36 — measured performance pass and independently dated comparisons (3 November 2026)

Applied the relevant performance Short recommendations after reviewing its complete caption checklist; see PERFORMANCE_REVIEW.md for all 31 applicability decisions. Local trend-sort median improved from 783.02 to 46.54 ms on a 5,500-row synthetic-trend fixture; repeated public gzip work improved from 10.93 to 0.81 ms. These are component benchmarks, not whole-page percentages. Added ordered deferred scripts, on-demand chart exports, bounded public encoding reuse, content-verified immutable asset caching, composition-aware search scheduling, local licensed variable fonts, loading placeholders and opt-in private diagnostics. Early browser diagnostics show layout instability and no slow-phone/network acceptance yet, so performance remains 8.5.

Centered ticker details and reduced both row heights. Comparison lines now preserve their own histories and begin at their own first dates on the shared axis; missing early values stay blank. Month/year axes use calendar time, and weekly selection is independent per series. Browser MAX comparison showed NIFTY IT unavailable at an earlier stock observation, rather than an invented baseline. Expanded company history warming to all metric routes; retained full OHLCV data in lazy tables; shorter daily ranges reuse the full series. MAX requests history from 1990 and reports actual availability, rather than truncating to a rolling 20 years. Reliance browser chart showed 7 January 2000–3 November 2026 with 1,401 weekly points. Revenue page retains its reported current value and explicitly explains the need for a financial-history source.

154 automated checks passed before final documentation/browser acceptance. Ratings unchanged: navigation/core, responsive layouts, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Goal remains active; GitHub updates paused.

### Iteration 37 — stable initial loading layout (3 November 2026)

Previous turn: progress (measured performance improvements, independent comparison dates and expanded history). Added bounded DOM-source details to opt-in layout-shift diagnostics, then traced actual browser loads. Rankings' main jump came from a normal-flow supporting-data notice appearing and disappearing; the initially visible footer also moved offscreen after hydration. Supporting-only status now floats without displacing the workspace (source failure warnings remain normal visible notices). Initial HTML marks content busy immediately and reserves viewport space until usable core data arrives; final content releases the reserve. Phone heading and empty summary card heights match their loaded geometry.

Same default browser: observed cumulative loading layout-shift total fell from 0.5434 before to 0.0013 after. Phone requested 390×844 (386px content): first correction yielded 0.0638; final heading/card adjustment yielded 0.0172 and core data at 136ms. These are local observations of cumulative shift entries, not population Core Web Vitals or constrained-network scores. Phone document width equals scroll width (386px). Inspected /tmp/isv-stable-loading-phone.png, restored default viewport and rankings. Evidence .local/loading-layout-audit.json. Bootstrap regression now verifies the supporting-status class is applied during hydration and cleared afterward. 154 checks pass.

Ratings unchanged pending broader acceptance: navigation/core, responsive layouts, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, charts/interactions, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Performance is materially improved, but real slow-device/network checks and route-wide loading/recovery measurements remain. Goal active; GitHub paused.

### Iteration 38 — chart observation accuracy and company metric-tab continuity (3 November 2026)

Previous turn: progress (verified loading stability). Corrected price-domain padding that could show a negative price axis on long histories; percentage-return comparisons still retain negative domains. Hover and selection now require a real observation at the selected shared-axis position. An observation from a different date is no longer silently displayed beneath the shared date label; missing observations produce a dash. Regression covers an internal date gap as well as unavailable early endpoints.

Repeated all eight timelines with actual provider data for Reliance and a four-line comparison (Reliance, Bharti Airtel, HDFC Bank, NIFTY IT). All 16 completed without chart errors. Confirmed intraday IST markers, date-only 5D, calendar-month boundaries for 6M/YTD/1Y and year markers plus independently sampled weekly points for 5Y/MAX. MAX price domain starts at $0.00; comparison remains signed. Latest MAX counts are 1,401 / 1,241 / 1,241 / 1,606 observations with independently placed starts. 1D has 72 equity and 75 index observations, preserved rather than intersected. Evidence .local/chart-timeline-audit-iteration38.json. One stock 1D axis snapshot includes the outgoing animation layer; comparison snapshots explicitly exclude it.

User reported metric-tab navigation jumps. Same-company navigation now retains page/strip offsets and focus. Route-entry captures the offset before fragment navigation; More metrics does the same. Changing company still opens at the top; existing saved ranking restoration remains. Actual direct mouse click at a visible Revenue tab retained scrollY 362.871px exactly and selected Revenue. Locator clicks may reposition the viewport before their generated click, so final acceptance used a direct mouse action at the observed visible tab coordinates. Removed temporary route diagnostics after validation. Screenshot /tmp/isv-company-tabs-preserve-position.png. Regression simulates the browser having reset to zero before the route handler and proves restoration from the captured offset plus new-company reset. All 156 checks pass.

Charts/interactions rises to 9 based on the refreshed complete company/mixed-index range matrix, observation/domain corrections and prior verified market-map/scatter/sector/drag/export/mobile behavior. This does not raise the separate data-coverage or accessibility ratings. Current scores: navigation/core, responsive layouts, charts/interactions, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Goal active; GitHub paused.

### Iteration 39 — historical response validation and retry cache ownership (3 November 2026)

Previous turn: progress (chart matrix/domain/observation corrections and company metric-tab continuity). Inspected the actual historical request boundary and found that only the outer points array was validated: a null record could throw later during frame drawing, outside the request failure handler. The request now rejects malformed record shapes, timestamps, nonpositive/non-numeric prices, invalid optional OHLC values and negative/non-numeric volume. Empty/one-observation arrays remain valid inputs for the existing explicit insufficient-history state. Shared geometry also handles null records defensively.

Validated returned provider, requested range, security ISIN/index identity and native unit before a history is cached or plotted. A wrong instrument or USD-labelled response cannot be presented as the selected INR equity, and index points remain separate. An old failed request's expiry timer previously could remove a newer successful retry; release callbacks now remove only the exact request they own. Tests cover malformed records followed by valid retry, old expiry after successful replacement, and instrument/provider/range/currency mismatches. Existing atomic batch/failure UI behavior is retained. 159 automated checks pass.

Executed the actual browser-history request function against the running local server using an isolated Node VM with a fetch adapter (no browser/UI automation): Reliance ISIN INE002A01018, INR, 1M, 21 records; NIFTY IT, POINTS, 1M, 21 records both pass the strengthened validator. No provider session/credentials changed, and no visual UI change or fresh screenshot is claimed. Reliability stays 8.5 until broader live outage/reconnect acceptance; narrow boundary tests do not prove all failure modes.

Current scores unchanged: navigation/core, responsive layouts, charts/interactions, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Goal active; GitHub paused.

### Iteration 40 — keyboard route continuity and browser Back (3 November 2026)

Previous turn: progress (historical response validation). Found that opening a company removed the focused ranking button and left focus at the document body. Route navigation now focuses the destination company heading (programmatic tabindex -1) without forcing a second scroll. Returning to saved Rankings restores the originating row control alongside page/filter/table offsets, with a heading fallback if the original control no longer exists. Data-company controls participate in the existing focus snapshot. Capture occurs before fragment navigation, including entry from a root URL with no hash.

Real browser keyboard acceptance exposed a separate history issue: Back changed the URL to Rankings while retaining the company view. Added popstate handling with a displayed-route guard so the subsequent hashchange cannot render twice. Browser retest: Enter on Reliance ranking button -> focus H1 Reliance Industries; Back -> real ranking table and focus BUTTON data-company=1. Reports now exposes aria-current=page; real Enter test retained focus on Reports and showed six report links. Export actions have a named group role. Existing same-company metric scroll/focus behavior remains separate from new-route heading focus. Same-hash links no longer leave stale scroll hints.

161 checks pass, including company-heading/return-row focus, root-fragment scroll capture and popstate/hashchange deduplication. Visually inspected /tmp/isv-keyboard-company-reports.png. Temporary browser tab used for acceptance; existing previews/settings left intact. Accessibility remains 8.5: this resolves navigation issues but is not a full assistive-technology audit. Ratings otherwise unchanged: navigation/core, responsive layouts, charts/interactions, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Goal active; GitHub paused.

### Iteration 41 — prevent hydration-driven ranking movement (3 November 2026)

Previous turn: progress (keyboard focus/history correction). Found that renderRows persisted rank history during early core-data rendering, before official supporting records arrived. That could turn hydration changes into apparent saved-rank movement. Extracted currentRankingState as the persistence boundary. Shared rank builder can return a provisional current ranking with no previous comparison; provisional states are never persisted. The previous complete history is also preserved whenever any source reports a load failure. Rows and global ranks remain usable while movement is withheld. Version 3 history key establishes a clean baseline rather than comparing against potentially polluted version 2 states.

Behavioral regression executes the actual persistence boundary through complete -> partial reorder -> complete hydration -> source failure -> genuine complete reorder. It proves provisional states never write, original complete comparison survives, hydration alone does not create an arrow, and a later complete rank change does. 162 checks pass. No visual layout change/browser screenshot claimed.

Re-ran actual local coverage audit: 5,554 rows / 5,529 directory ISINs; 3,184 official share-count matches; 2,343 rows still lack cap inputs, including 2,324 BSE-only cases; 25 financial snapshot identities remain unresolved and excluded from current ranks. Coverage cannot be rated 9 on this evidence. Current source gaps remain explicit; no synthetic values added. See .local/coverage-audit.json.

Scores unchanged: navigation/core, responsive layouts, charts/interactions, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Goal active; GitHub paused.

### Iteration 42 — current BSE source discovery and preload retry recovery (3 November 2026)

Previous turn: progress (provisional rank-history correction). Investigated the largest remaining coverage gap using current official BSE static sources. Discovered and archived securities-list API/field definitions, runtime API base and shareholding summary routes. The official active-equity data endpoint returned 403 both directly and with normal website headers; no valid dated dataset obtained, no repeated bulk requests or substituted values. Evidence .local/bse-source-audit.json; source analysis and ingestion conditions in BSE_SOURCE_REVIEW.md. This narrows the next data action to obtaining a valid official report/response; static JavaScript definitions cannot justify filling missing caps.

Completed independent recovery work: timeline warming previously treated any fulfilled fetch, including HTTP error responses, as success and kept a ten-minute cooldown. It now requires a successful response with a valid positive queue acknowledgement. Failure releases only its own cooldown entry, so a later attempt can retry without affecting foreground history loading. Regression proves HTTP failure -> invalid zero acknowledgement -> successful acknowledgement -> duplicate suppression. 163 checks pass. No visual UI change or new screenshot claimed.

Scores unchanged: navigation/core, responsive layouts, charts/interactions, local security, privacy/preferences, exports and documentation/operations 9; data freshness/coverage 8; visual hierarchy, identity/valuation, reliability/recovery, accessibility, performance, metadata/sharing and maintainability/tests 8.5. Goal active; GitHub paused. BSE retrieval restriction is one specific source limitation; other quality work remains available, so the overall goal is not blocked.


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
