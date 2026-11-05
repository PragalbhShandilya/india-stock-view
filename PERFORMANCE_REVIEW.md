# Performance review — 3 November 2026

Reference: [BreakingBreach’s performance Short](https://www.youtube.com/shorts/8JsFi_ZOvio). Reviewed the visible description and full spoken checklist through YouTube captions. Changes are local only; GitHub publication remains paused.

## Measured changes

Reproducible command: `node scripts/performance-audit.mjs after`. Before/after evidence is in `.local/performance-before.json` and `.local/performance-after.json`. These are Node microbenchmarks, not browser loading scores or real-device Core Web Vitals. The sorting fixture uses 5,500 actual directory names with synthetic 21-observation price series.

| Operation | Before median | After median |
|---|---:|---:|
| Full-universe trend sort | 783.02 ms | 46.54 ms |
| Repeated compression of official share-count data | 10.93 ms | 0.81 ms |

The comparator now computes each eligible stock’s sort value once. Public compressed representations use a 32-entry/16-MiB bounded content-keyed cache; private quotes/history/session responses remain `no-store`. Content-matching versioned JS/CSS responses can be cached as immutable; wrong/old hashes fall back to revalidation. Fonts are local WOFF2 variable subsets with OFL licenses. Ordered deferred scripts download concurrently; export implementation is imported only on chart routes. Search bursts are coalesced over 100 ms, respecting composition and removed views. Export installation ignores text-only mutations and coalesces relevant changes into one frame. Unchanged trend SVG cells retain their existing DOM. Logo decoding is asynchronous with reserved dimensions.

Loading placeholders reserve space and honor reduced motion. Opt-in `?performance=1` records page-local paint, layout-shift sum, long-task and interaction diagnostics in `#performance-metrics[data-report]`. No telemetry is sent or saved. These are diagnostics, not a certified Lighthouse/INP/CLS score. Initial browser samples exposed substantial layout movement, so performance remains 8.5/10; do not claim a 9 or a whole-site percentage improvement. Slow hardware and constrained-network acceptance remain outstanding.

## Applicability of all 31 recommendations

| # | Area | Application to this website |
|---|---|---|
| 1 | Loading feedback | Added factual placeholders; retained existing chart during timeline fetches. |
| 2 | Raster transfer | No large owned photos. Keep vector logos sharp; small external transparent logo assets remain in source format. Local fonts use WOFF2. |
| 3 | Request reuse | Existing feed/history deduplication; shorter daily histories now derive from full-history cache. |
| 4 | Typing cost | Added composition-aware 100-ms input scheduling. |
| 5 | Result bounds | Retained 100-row ranking pages and capped comparison picker. Whole universe still loads for global ranks and aggregate charts. |
| 6 | Edge hosting | Existing GitHub Pages delivery retained. No hosting change while publication is paused. |
| 7 | Deferred work | Existing rate-limited history queue prioritizes visible requests; full-history warming runs in background. |
| 8 | Repeated lookups | Market-cap annotations now use one rank map; trend sort derives each value once. |
| 9 | Transfer encoding | Existing gzip retained, public encodings reused, historical responses now compressed too. |
| 10 | Shared cache service | No Redis needed for a single local process; bounded memory and existing disk history cache serve this role. |
| 11 | Dependency weight | No npm runtime dependencies added. Export code moved off non-chart startup. |
| 12 | Upstream waits | Existing finite source/feed/history timeouts retained. |
| 13 | AI output | Not applicable: no AI generation in the product. |
| 14 | Immediate actions | Watchlist, comparison and display preferences already update locally without a server round trip. |
| 15 | Offscreen assets | Existing lazy logo loading retained; asynchronous decode and dimensions added. |
| 16 | Independent work | Existing source/comparison parallelism retained; script downloads now overlap without changing execution order. |
| 17 | Query indexes | No database. In-memory ISIN/token/rank maps are the relevant equivalent. |
| 18 | Tracing | Opt-in local performance diagnostics added. External tracing infrastructure is unnecessary for this local deployment. |
| 19 | Data locality | No remote application database to relocate. Broker endpoints remain the upstream source. |
| 20 | Initial HTML | Existing generated company/category documents retained; rankings hydrate from current data. |
| 21 | Vendor JavaScript | No analytics/vendor runtime scripts required; external font stylesheet removed. |
| 22 | Feature loading | Chart exports imported on demand and reused thereafter. |
| 23 | Large DOM lists | Pagination and bounded native picker already limit DOM; retain semantic tables rather than adding virtualization. |
| 24 | Payload scope | Existing quote deltas and visible-page trend paths retained; full daily history reused for shorter views. |
| 25 | Database sessions | Not applicable: no database connections. |
| 26 | Redraw scope | Avoid unchanged sparkline writes and unrelated export scans; retain atomic comparison-line rendering. |
| 27 | Browser reuse | Verified content versions receive immutable caching; mutable source files revalidate. |
| 28 | Server replicas | Not applicable to private loopback broker backend; no speculative multi-server setup. |
| 29 | Typography requests | Existing two font families self-hosted with variable weight ranges and licenses. |
| 30 | Field measurements | Local opt-in diagnostics added without user tracking; no population-level real-user dataset claimed. |
| 31 | Constrained devices | Prior responsive checks retained. Real slow-phone/network performance acceptance is still unverified. |

## Follow-up requests completed during this iteration

Ticker stock slots are centered; desktop stock/index rows measure about 34/42 px, versus 44/52 px previously. Mobile rules are 32/40 px.

Comparison histories now retain independent starting dates and use each series’ own first observation as its zero baseline. The shared axis includes all observation dates; long-range placement uses elapsed calendar time so year spacing remains correct. Hover/selection before a series exists displays unavailable, with no extrapolation. Weekly selection occurs independently per instrument.

Opening any matched company page warms all eight market-history timelines. Full daily retrieval begins in 1990 and displays only the actual returned provider observations; availability differs per instrument. Reliance MAX was browser-verified from January 2000. Complete open/high/low/close/volume fields are retained and available in the lazy chart-data table. Financial metric pages explain that Zerodha candle data cannot provide revenue, earnings or balance-sheet histories, and link directly to available price history. Existing reported annual cap history remains separate. Historical market cap cannot be reconstructed exactly using today’s share count across capital changes.

Official API scope: [Zerodha historical candle documentation](https://kite.trade/docs/connect/v3/historical/).
