# Remaining acceptance for the 9/10 goal

Updated 4 November 2026, iteration 55. These are concrete checks for the original full-site quality objective; they do not replace its scope. Scores are expert assessments, not certified audits. GitHub publication remains paused.

| Area | Current | Evidence still needed before 9 |
|---|---:|---|
| Visual hierarchy/design | 9 | Completed dark phone/tablet ranking, comparison, company, index, methodology, empty-watchlist and missing-company checks in iteration59; fixed index action wrapping. Earlier desktop/route matrix and contrast acceptance retained. Reopen on visual regression. |
| Identity/valuation | 8.5 | Audit representative corporate-action/share-count-date conflicts, ADR/native identity, renamed and delisted identities against dated source records. Show missing/conflicting values stay excluded rather than acquiring ranks. Existing25 unresolved historical identities remain excluded. |
| Freshness/coverage | 8 | Obtain usable dated official BSE-only share/price records; Current quote/cap gaps quantified in iteration67: 4,851/5,533 company quotes matched, 3,090 exact caps, 2 estimates, 2,441 missing caps. Repeat after source improvements. No complete-market claim while material cap-input gaps remain. BSE API403 is evidence of a source restriction, not a reason to invent values. |
| Reliability/recovery | 8.5 | Verify live request timeout, provider authentication loss, empty/error historical responses, reconnect and restart without losing selections or presenting stale prices as live. Existing request-level tests need broader running-site outage/recovery acceptance. |
| Accessibility | 8.5 | Complete keyboard-only route/control traversal with live refresh, chart/data-table alternatives and focus restoration in current code; inspect remaining component contrast/focus states. Record actual assistive-technology checks separately from DOM semantics; do not claim WCAG certification. |
| Performance | 8.5 | Measure running-site initial load, comparison/timeline switches, hover/drag and a longer navigation session with diagnostics, including a constrained device/network where available. Node microbenchmarks do not prove browser frame times. |
| Metadata/sharing | 8.5 | Verify deployed route entry/404/canonical and external share-preview rendering after publication is resumed by the user. Current generated company/index HTML and local HTTP checks are accepted; do not publish just to close this gate. |
| Maintainability/tests | 8.5 | Reduce coupled rendering/global overrides in the history/comparison path with clear ownership, while preserving behavioral integration coverage. Check normal, error, stale response and cleanup boundaries; test count alone is insufficient. |

Already rated9 based on recorded acceptance: navigation/core, chart interactions, responsive layout, local security/input handling, privacy/preferences, exports, documentation/operations. Regressions in any of these reopen the relevant acceptance. The original quality review contains historical evidence, not a waiver for future changes.
