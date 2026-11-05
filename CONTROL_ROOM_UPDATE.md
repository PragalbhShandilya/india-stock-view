# IndiaStockView — control room update

Updated 2 November 2026. Local work continues; the all-aspects ≥9/10 goal is not achieved.

| Area | Current evidence |
|---|---|
| Website | Rankings, multi-metric columns, company entry pages, stock/index charts, comparisons, market map and watchlists |
| Publication | GitHub updates/publication explicitly paused; do not infer the public site matches local changes |
| Runtime | Node v24.22.1 bundled with this workspace verified; local preview uses port 4174 |
| Provider | Local Zerodha responses verified for all seven 1M index histories and two 5Y index histories; session/freshness must be checked when used |
| Coverage | Reference audit: 5,653 matched identities and 25 unresolved rows; share/financial coverage incomplete, particularly BSE-only inputs |
| Verification | Run npm run check; latest dated test counts and limits are in TEST_REPORT.md and WEBSITE_QUALITY_REVIEW.md |
| Browser | Supported computer/browser tool available again on 3 November; rankings preview opened visibly. Broader visual/mobile/export acceptance remains open |
| Security | Loopback-only broker server, guarded browser API origin, private sessions; no public multi-user hosting claim |

Next work: resolve the remaining data and rendered acceptance gaps, preserve exact/estimated/missing valuation distinctions, and keep new features consistent across stock/index, currency and accessibility paths. No rating should rise merely because the test count increases. The current scorecard owns all aspect ratings.
