# Architecture

Updated 1 November 2026. Describes the checked-in implementation.

## Runtime and flow

The browser loads dist/index.html, CSS, JavaScript modules and JSON assets. Node's server.mjs serves the same directory and adds private API routes. package.json requires Node 22+ and has no third-party runtime dependencies or build script.

```mermaid
flowchart LR
  Snapshot[Bundled reference JSON] --> Browser
  Reports[Visitor exchange CSV] --> Browser
  Sources[Instrument and reference sources] --> Server[Local Node server]
  Broker[Kite or GFD] --> Server
  Server --> API[Local API]
  API --> Browser
  Server --> State[Private .local state]
```

Static hosting supplies only the browser side. Background jobs and provider connections exist only while the Node process runs.

## Module map

| Files | Responsibility |
|---|---|
| server.mjs | HTTP serving, route selection, GFD socket and refresh scheduling |
| feed.mjs | GFD quote normalization and ordered quote storage |
| kite.mjs | Login exchange, private session, binary quote parsing, socket groups and history |
| listings.mjs | Directory normalization, daily refresh and first-seen events |
| reference-data.mjs / ipo-calendar.mjs | Official share references and IPO provenance |
| coverage-audit.mjs | Missing-input and identity coverage report |
| dist/app.js | Browser state, routing, rankings and main views |
| dist/company-page.js / kite-ui.js | Company surfaces and broker quote/history views |
| dist/ranking-universe.js / live-valuation.js | Identity matching and valuation inputs |
| dist/chart-core.js / chart-interactions.js / chart-export.js | Scales, interaction and downloads |
| dist/market-map.js / chart-audit.js | Map layout and chart support |
| dist/exchange-eod.js / market-status.js | Official CSV handling and calendar status |
| dist/currency-format.js / fx-reference.js | Currency formatting and reference conversion |

## Persistence

Bundled data is under dist. Browser preferences/imports are local to the browser. The server uses ignored .local state for instrument masters, discovery state, reference-sync status and the private Kite session. Reference jobs can update JSON under dist; review these outputs before a public data release. Read .env only on the server. Never copy .local or .env to a public artifact.

## Scheduling and provider precedence

The directory job checks every minute and attempts the daily refresh after 08:35 IST; a startup refresh may also run. Reference refresh eligibility is checked hourly, with an initial delayed check and a UTC-date guard. Browser refreshes pause for some hidden-tab paths; consult the implementation when changing cadence.

/api/market selects Kite whenever both Kite credentials are configured, otherwise GFD. There is no automatic Kite-to-GFD failover after a login error. GFD transport receives provider updates; browser market polling is every five seconds. Kite subscribes in up to three groups of 3,000 tokens in this implementation and reports unsubscribed instruments. These are implementation limits, not a promise about a subscription's entitlements.

The local server binds 127.0.0.1 and restricts Host to localhost/127.0.0.1. It is not a ready-made public multi-user server.
