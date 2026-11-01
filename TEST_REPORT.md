# Test report and acceptance plan

Updated 1 November 2026.

## Evidence status

This documentation pass inspected source, configuration, workflow and existing review notes. Node and npm were unavailable on the session PATH and the usual /usr/local/bin and /opt/homebrew/bin locations. The automated suite was not rerun. Do not interpret this report as a fresh passing test result.

CHART_QUALITY_REVIEW.md records a prior 37-test pass on 1 November 2026 and prior browser checks, with latest mobile market-map and export checks still pending. That is retained historical evidence, not independently reproduced here. Preview PNG files in the repository are previous artifacts, not new screenshots.

## Automated suite

Run npm test from the project directory with Node 22+.

| File | Principal scope |
|---|---|
| feed.test.mjs | GFD normalization, exchange identity, missing fields and old ticks |
| listings.test.mjs | Directory normalization, parsing and discovery differences |
| exchange-eod.test.mjs | Official report parsing, validation and matching |
| kite.test.mjs | Kite quote/frame/history-related adapter behavior |
| reference-data.test.mjs | Reference parsing, share/identity and valuation rules |
| ipo-calendar.test.mjs | Supplemental calendar parsing and company matching |
| chart-core.test.mjs | Chart mathematics, periods, layout and related invariants |

The Pages workflow also checks dist/app.js syntax before the suite. It does not perform browser visual acceptance or provider login verification.

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
