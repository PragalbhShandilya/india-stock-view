# IndiaStockView — next-session handoff

Saved 1 November 2026.

## Start here

Project root: india-stock-view beneath the IndiaStockView workspace. Read DOCUMENTATION.md for the complete index, README.md for launch/data caveats and CHART_QUALITY_REVIEW.md for pending visual checks. The current implementation includes Kite support, official share references, IPO records and GitHub Pages deployment; older chat descriptions of a GFD-only project are outdated.

## Latest work

Added the Orbit-style documentation set: product overview, architecture, sources, live setup, API, tools, user guide, feature quality, test evidence, security/privacy, deployment, roadmap and control-room update. Existing README and chart review retained, with a documentation link added to README. Application behavior was not changed.

## Resume order

1. Use Node 22+ and run npm test plus syntax checks. This session could not rerun them because Node/npm were unavailable on PATH.
2. Finish latest mobile market-map and export-image acceptance from CHART_QUALITY_REVIEW.md; keep provisional scores until evidence supports changes.
3. Inspect selected provider status without exposing credentials. Kite takes precedence when both Kite environment fields are configured. Verify actual quotes/history and session/reconnect behavior only with authorized access.
4. Run/review the coverage audit as needed; preserve missing share counts and source timestamps.
5. Verify the intended published revision if a release is requested, then update test/control-room records.

Do not copy .env, .local or authenticated URLs to public files. GitHub Pages runs only dist; the supplied server is loopback-only and is not a production multi-user broker service. Existing historical test/browser evidence remains in the chart review; it was not independently repeated by this documentation task.
