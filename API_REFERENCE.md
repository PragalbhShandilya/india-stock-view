# Local API reference

Updated 1 November 2026. Base URL: http://127.0.0.1:4174. These routes belong to server.mjs, not GitHub Pages.

The server accepts GET/HEAD and rejects other methods with 405. It requires a localhost/127.0.0.1 Host. JSON market, listing and history responses use no-store. Do not assume HEAD has dedicated body-free handling on every API branch.

| Route | Contract |
|---|---|
| /api/market | JSON containing status, quotes, listings; Kite takes precedence if configured |
| /api/listings | Directory refresh state, discovery events, counts, cadence and notice-monitoring note |
| /instruments.json | Current in-memory master including local refreshes |
| /api/kite/login | 302 to provider login and short-lived HttpOnly state cookie; 503 if unconfigured |
| /api/kite/callback | Validates state/cookie, exchanges request token, then 303 to /#rankings; 400/401 on failure |
| /api/kite/history?token=TOKEN&range=1M | Provider, currency, range, interval, points; 401 for login_required or 503 on other errors |
| / | dist/index.html |
| Other asset paths | Files beneath dist; 404 if absent |

## Market payload

status always identifies the selected provider and configuration/state. quotes is an array; listings supplies the directory relevant to that provider. status.directoryListings reports the broader master size. GFD fields include received, catalogueReceived, updatedAt and coverage. Kite also includes authenticated, subscribed, eligible, unsubscribed, connections and instrumentDate. Provider-specific fields are not interchangeable.

Normalized quotes identify exchange and symbol, price, day change and available OHLC/volume/trade times. Kite supplies instrumentToken/ISIN where matched. Null fields are unavailable. Prices are INR on these feeds; consumers must not treat them as reference USD prices. An empty quote array is valid when unconfigured, waiting or not authenticated.

## History

Supported ranges: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX. The instrument token must be in the server registry. Successful results contain timestamped observations in points; the adapter chooses an interval based on range and caches results for one minute. History requests are serialized in the adapter. Unsupported ranges or instruments return an error, not invented observations.

## Integration limits

No application-user authentication, public CORS contract, public rate limiting or tenant isolation is provided. The login session and market state are process-wide. Do not expose these routes directly as a multi-user production API.
