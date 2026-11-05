# BSE source investigation — 3 November 2026

The local coverage audit still finds 2,324 BSE-only entries without market-cap inputs. This investigation checked current official source definitions rather than assuming that an older BSE endpoint was still valid.

## Verified findings

- The [official securities page](https://www.bseindia.com/corporates/List_Scrips.html) was readable through a direct HTTP request. The web extraction service returned 403 for that page; those are separate observations.
- The page's published Angular modules identify `ListofScripData_new/w` as the securities-list route, with Equity and Active as supported filters. The table labels its `Mktcap` field in INR crore and includes security codes and ISINs.
- BSE's [public runtime configuration](https://www.bseindia.com/assets/data/appConfig.json) resolves the API base to `https://api.bseindia.com/BseIndiaAPI/api`.
- Published corporate modules also reference `Corp_shpSec_SHPSUMMARY_ng/w`, `Corp_shpSec_shpqtrinfo_ng/w` and the shareholding field `Fld_TotalNoOfShares`. These definitions alone do not establish valid totals or a usable feed.
- One active-equity list request and one request with normal JSON/Referer/browser headers both returned HTTP 403. No payload, complete schema or as-of date was obtained. Requests stopped; no bulk job was launched against the denied endpoint.

Inspectable local evidence: `.local/bse-source-audit.json`, including URLs, downloaded static-source hashes, response status, attempted headers and limitations. Supporting public source modules are archived under `.local/source-audits/`. No credentials were read, sent or changed.

## Conditions before ingestion

A successful official response or official downloaded report is still needed. Verify report date, units, ISIN/security-code match, active ordinary-equity status, duplicate classes and coverage. A market-cap snapshot can be displayed as a dated official market cap only when its date is known. It cannot silently become issued shares by dividing by a price from another date. Shareholding totals require their quarter/as-of date and separate handling of partly-paid shares, DRs and diluted totals.

No market-cap/share records were added from this investigation. Coverage remains incomplete and its rating stays 8/10. The BSE data-feed portal is a separate subscription option; no account, trial or paid service was activated. Existing authorization is to use official end-of-day data without subscriptions.
