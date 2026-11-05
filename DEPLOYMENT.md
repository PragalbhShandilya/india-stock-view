# Deployment and release

Updated 5 November 2026. The user authorized publication of the current version to the existing GitHub repository and GitHub Pages.

## Static website

.github/workflows/pages.yml publishes dist on pushes to main or manual workflow dispatch. In GitHub repository Settings → Pages, choose GitHub Actions. The job pins Node 24, checks every browser/server module and runs all root test files through npm run check, then uploads only dist and deploys it to Pages.

The application assets are authored in dist. The build:pages command generates company and section entry documents, a sitemap and robots.txt from the verified company directory. The Pages workflow runs this generation before checks. Keep private material outside it. The static artifact contains the bundled data and browser features; it cannot execute Node, broker login exchange, server-side refreshes or market sockets. Reference updates become public only when their changed dist files are included in a deployed revision.

The workflow's existence does not prove the latest deployment succeeded. Inspect the actual workflow run and deployed revision, then smoke-test the public URL. No publication was performed in this documentation task.

## Server-backed hosting

The supplied server binds loopback and only accepts local Host names. Its broker session is shared process state and there is no application-user authentication. Public live hosting therefore needs an explicit design for access control, session/account isolation or a provider-approved shared display feed, secure transport, secret management, persistent private storage, monitoring and data permissions. Do not simply expose the local process to the internet.

## Release checklist

- After browser asset edits run npm run version:assets; the check rejects stale content versions.
- Run npm run check on the intended Node runtime (syntax plus all root test files).
- Resolve the applicable manual checks in TEST_REPORT.md and chart review.
- Review dataset dates, coverage, units, identities and source attribution.
- Check that dist contains no credentials, callback captures or private state.
- Confirm the workflow publishes only the intended files and revision.
- Verify rankings, company deep links, downloads and mobile layouts on the deployed site.
- Record the revision, URL, test evidence and remaining limits in the handoff.

## Recovery

For a static regression, restore a known-good source revision and redeploy it through the same workflow. Preserve needed source data provenance. For a local feed problem, stop/restart the service and reconnect through the provider flow; back up private state before any deliberate reset. Never delete .local as a generic troubleshooting step because it can contain session and discovery state.

## Sharing and route metadata

The static HTML supplies site-level Open Graph/Twitter text, a canonical public URL and a favicon. Browser navigation updates titles and descriptions for rankings, sectors, charts, comparisons, watchlists, sources and individual companies. Hash routes share a single HTML document: social crawlers that do not execute JavaScript receive the site-level preview, not company-specific metadata. Dedicated crawlable company pages and rich preview artwork remain future work. Metadata changes here are local until publication resumes.


## Local source-failure recovery

The browser loads financials, directory, official shares and IPO/reference supplements independently. A missing supplementary file shows a named-source notice with Retry data; available companies remain usable. Either financials or the directory can keep the site usable. If neither supplies company records, the main view shows a dedicated Retry action. Source retries preserve saved selections and do not create additional polling timers. A comparison identity missing from the available data is retained as an unavailable selection until its source recovers or the user removes it.

Restore or refresh the affected public data file, then use Retry data. Do not delete browser preferences or the private broker session to repair a public-file failure. History has a bounded request and an explicit retry/connect state. Market refreshes share a pending request and retain the existing no-store policy.

## Direct company and section links

Run npm run build:pages after changing the company directory, root HTML or page metadata. npm run version:assets also rebuilds existing generated pages. npm run check rejects stale generation inputs. Local builds prefer .local/master.json; clean publication builds use dist/instruments.json. No private broker session or quote cache is copied into entry pages.

Company pages live under companies/TICKER/ (URL-encode symbols such as &); sections use charts/, compare/, sectors/, about/ and watchlist/. Root and historical hash bookmarks remain supported. Company pages contain identity metadata and neutral initial content, then load the interactive application. The asset base stays fixed when in-app navigation changes the path. A generated-route manifest prevents newly discovered companies from getting unbuilt clean links; they retain hash links until pages are rebuilt.

The server redirects directory links without their trailing slash and preserves query parameters. Unknown company paths return 404. Watchlist pages use noindex and are excluded from the sitemap. The configured public canonical and sitemap origin remains the GitHub Pages URL; local verification does not publish those pages.
