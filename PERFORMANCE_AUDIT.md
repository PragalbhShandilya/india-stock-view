# Local performance audit

Measured 2 November 2026 with the running loopback service. This is an API-transfer measurement, not a browser frame-rate or mobile rendering benchmark. GitHub publication remains paused.

## Quote refresh

| Measurement | Result |
|---|---:|
| Original full quote JSON | 2,994,674 bytes |
| Original gzip response | 591,222 bytes |
| Original local round trip + parsing measurement | 98 ms |
| New initial full response (gzip) | 594,331 bytes |
| New unchanged refresh response | 509 bytes, uncompressed |
| New unchanged local request/reconstruction time | 9–12 ms across three checks |
| Complete stock records retained in the client | 7,239 |
| Complete index records retained in the client | 7 |

The unchanged refresh is over 99.9% smaller than the original gzip payload. Initial load still sends the full dataset. During trading, transfers depend on the number of instruments whose quote fields changed; the unchanged case is not a busy-market bandwidth guarantee. HTTP headers, other APIs, static files and images are excluded. Detailed measurements are in `.local/quote-transfer-audit.json`.

## Update correctness

The client explicitly requests incremental updates. Existing API consumers can still obtain a full response. Server cursors contain a process epoch and revision, with one latest record/revision per instrument rather than a growing event log. Every changed quote field is tracked except receipt-only metadata (`receivedAt`). Genuine trade/exchange timestamps, previous close, average price and identity fields still trigger an update.

The browser holds the complete set in memory and merges changed records atomically. It rejects malformed, incomplete or out-of-sequence responses and requests a full replacement afterward. Instrument removal, provider changes or a server restart cause a new epoch/full replacement, preventing stale records from lingering. Quotes remain no-store and are not persisted in browser storage by this adapter.

Tests cover unchanged refreshes, multiple changes while a client waits, non-price fields, removals/restarts/provider changes, invalid cursors and record counts, and actual readFeed full→delta→unchanged integration. The ticker now uses an ISIN lookup map and avoids rewriting unchanged displayed values.

## Other evidence and remaining work

Earlier warm history switches measured approximately 278–292 ms locally. History ranges preload with a paced priority queue. Shared pending requests prevent duplicate loads. These observations do not replace current real-browser acceptance of the revised ticker, transitions, exports, mobile rendering or low-end device performance. Browser inspection currently reports disabled access, so the overall performance score remains 8.5 pending those checks.

## Supporting-source startup dependency (iteration 19)

The first usable company view no longer depends on every optional share-count/IPO request settling. Financials and directory are the critical pair; if either is usable, bootstrap can render while supporting files remain pending. It then hydrates once with final validated sources before initializing the feed. Deferred-source and bootstrap tests cover this dependency behavior and saved selections. This is a structural improvement, not a browser speed measurement; critical requests still have their existing timeout and rendering cost remains to be profiled.

## Ticker geometry batching (iteration 24)

The larger-type ticker preserves the former item footprint using hidden old-type measurement probes. Probe creation, geometry reads, cleanup and final width application now occur in separate batches, eliminating per-item read/write alternation. Duplicate scrolling copies reuse each stock measurement and already-fixed items do not remeasure on polling. The operation-order regression passes. No browser frame-time reduction is claimed without current rendering profiling.
