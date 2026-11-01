# Feature quality register

Updated 1 November 2026. Evidence register adapted from Orbit. No new numeric scores are assigned without a fresh acceptance pass. Existing chart aspect scores remain in CHART_QUALITY_REVIEW.md.

| Feature | Current evidence | Remaining acceptance |
|---|---|---|
| Rankings, identity and search | Implemented; identity/ranking regressions in suite | Broad company sample, pagination and missing-value UI |
| Company pages and annual history | Implemented; selected history coverage documented | All supported/unsupported tabs and routes |
| Currency and valuation | Unit/identity/share-count regressions | Rendered currency switching across every view |
| Watchlists and comparisons | Browser persistence implemented | Reload, removal, unavailable security and storage failure |
| Market map and scatter | Chart tests plus prior browser evidence | Latest mobile map and image export verification |
| Price charts and overlays | Prior browser interactions documented | Reduced-motion runtime and full accessibility pass |
| Official close import | Parser/schema/identity regression file | Real representative NSE/BSE files and restore UI |
| Market hours badge | Calendar logic implemented | Holiday/special-session source maintenance |
| Directory discovery | Daily refresh and first-seen tests | Source outage/restart and current complete coverage audit |
| IPO date classification | Official/supplemental parser tests | Matched-company spot checks and conflicting dates |
| Official share counts | Validation and valuation tests | BSE-only coverage and corporate-action maintenance |
| Kite integration | Adapter, login/history and parser tests | Actual entitled account, expired session and reconnect |
| GFD integration | Normalization/order tests | Actual account authentication and catalogue fragmentation |
| Static deployment | Pages workflow exists | Current published revision and website smoke test |
| Public live server | Local-only implementation | Separate production design and acceptance |

A feature is ready only when its normal path, missing/error states, persistence and relevant layouts are verified at the intended scope. Prior screenshots do not prove the latest code. No new browser/device checks were performed during this documentation pass.
