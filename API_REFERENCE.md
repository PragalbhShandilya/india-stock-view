# Local API reference

Updated 2 November 2026. Base URL: http://127.0.0.1:4174. These routes belong to server.mjs, not GitHub Pages.

The server accepts GET/HEAD and rejects other methods with 405. It requires an exact localhost/127.0.0.1 Host with a valid optional port. Browser API requests also require the same origin; cross-site/same-site-other-origin requests are rejected before provider work. Top-level broker callback navigations are the only cross-site exception and still require state/cookie validation. HEAD returns 405 on login, callback and preload routes to avoid side effects. JSON market, listing and history responses use no-store. Do not assume HEAD has dedicated body-free handling on every API branch.

| Route | Contract |
|---|---|
| /api/market | JSON containing status, quotes, listings; Kite takes precedence if configured |
| /api/market?quotes=1 | Complete quotes/status, omitting the Kite directory; backward-compatible full response |
| /api/market?quotes=1&changes=1&since=CURSOR | Opt-in full/delta quote and index response with stream cursor; used by five-second client polling |
| /api/listings | Directory refresh state, discovery events, counts, cadence and notice-monitoring note |
| /instruments.json | Current in-memory master including local refreshes |
| /api/kite/login | 302 to provider login and short-lived HttpOnly state cookie; 503 if unconfigured |
| /api/kite/callback | Validates state/cookie, exchanges request token, then 303 to /#rankings; 400/401 on failure |
| /api/trends?isins=ISIN,ISIN | Rolling 30-calendar-day history status, requested records (up to 200 ISINs), and available return summaries |
| /api/kite/preload?isins=ISIN,ISIN | Queues supported timelines for up to four company ISINs; responds before history finishes |
| /api/kite/history?token=TOKEN&range=1M | Provider, currency, range, interval, points; 401 for login_required or 503 on other errors |
| / | dist/index.html |
| Other asset paths | Files beneath dist; 404 if absent |

## Market payload

status always identifies the selected provider and configuration/state. quotes is an array; indices separately supplies supported index quotes in points (never company records); listings supplies the directory relevant to that provider. status.directoryListings reports the broader master size. GFD fields include received, catalogueReceived, updatedAt and coverage. Kite also includes authenticated, subscribed, eligible, unsubscribed, connections and instrumentDate. Provider-specific fields are not interchangeable.

Normalized quotes identify exchange and symbol, price, day change and available OHLC/volume/trade times. Kite supplies instrumentToken/ISIN where matched. Null fields are unavailable. Prices are INR on these feeds; consumers must not treat them as reference USD prices. An empty quote array is valid when unconfigured, waiting or not authenticated.

## History

Supported ranges: 1D, 5D, 30D (ranking trends), 1M, 6M, YTD, 1Y, 5Y, MAX. The instrument token must be in the server registry. Successful results contain timestamped observations in points; the adapter chooses an interval based on range and caches 1D/5D/30D results for one minute and other ranges for ten minutes, with an IST-day boundary. Company histories also persist privately across restarts. Pending requests coalesce. A shared scheduler spaces request starts by at least 350 ms, allows two in flight and prioritizes foreground charts over background preloads/trends. ISIN matching protects against changed instrument tokens. Unsupported ranges or instruments return an error, not invented observations.

## Integration limits

No application-user authentication, public CORS contract, public rate limiting or tenant isolation is provided. The login session and market state are process-wide. Do not expose these routes directly as a multi-user production API.

## Transfer and cache behavior

Market responses remain `no-store`; they never receive an ETag. Large responses negotiate gzip. Public static assets and the instrument master use representation-specific ETags with `no-cache` revalidation; matching conditional requests return 304 with no body. Compressed and uncompressed representations have distinct tags. HEAD has body-free handling for these shared-response branches.

The browser polls every five seconds with changes=1. Its first response is full; later responses contain only changed quote/index records. The stream object supplies mode, cursor, base and complete-set quote/index counts. The client reconstructs the complete set in memory and verifies sequence/counts before exposing it to views. Removal, provider change or server restart returns a full replacement. Omit changes=1 for a complete backward-compatible response. All account/market responses remain no-store. This is polling, not a browser WebSocket endpoint.

## Public asset boundary

Static requests must resolve inside the real dist directory, including after symbolic-link resolution. Traversal and symlink escapes return 403; invalid paths return 400. All responses use no-referrer and nosniff headers. The server remains bound to loopback.

## Public entry documents

GET/HEAD /companies/TICKER/ and /charts/, /compare/, /sectors/, /watchlist/, /about/ serve generated index documents. Directory paths without a final slash redirect with 308, preserving the query. /sitemap.xml lists public entries; /robots.txt identifies that sitemap. These are static resources, not broker API endpoints. Rebuild entries after directory changes (see DEPLOYMENT.md).

The browser distinguishes a failed market HTTP refresh from an unconfigured provider: it creates a local disconnected/refreshFailed result, preserves known configuration/authentication, clears reported live connections and keeps the last displayed prices until a valid response arrives. This flag is a client recovery result, not an API endpoint field guarantee. Successful server responses remain authoritative for authentication and quote replacement.

## Index history and warming

/api/kite/history?index=NSE%3ANIFTY%2050&range=1M resolves an index from the current allowlisted Zerodha index registry. Sensex uses BSE:SENSEX. Responses identify index and currency POINTS; points[].price contains the index level. Indices remain separate from company/equity listings. Unknown index identities cannot resolve an instrument. The optional index query is also used for index-only history when no current quote exists.

/api/kite/preload accepts comma-separated indices alongside isins, capped at four of each and resolved against the registry. It queues the existing supported timelines in the background under the same paced history queue. Historical provider requests still use daily candles for long windows; 5Y/MAX display sampling selects the last shared trading observation per IST week after timestamp intersection. Other timelines retain their source observation frequency.
