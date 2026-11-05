# Security and privacy notes

Updated 2 November 2026. Implementation notes, not a legal policy or security certification.

## Private server data

.env holds provider credentials. .local may contain a Kite access-token session and operational state. Both are ignored by Git and must stay outside dist and public artifacts. Kite writes its session file with mode 0600. Do not print private configuration or authenticated connection URLs into screenshots/logs. Rotate credentials with the provider if they are exposed.

The local server binds loopback, limits Host names and restricts HTTP methods. The Kite login uses a random ten-minute state with an HttpOnly, SameSite=Lax cookie. These measures do not supply application-user authentication or production tenant isolation. The broker session is shared server state; this is a private local workflow.

## Browser data

Watchlist/comparison/preferences and imported close reports are stored locally in the browser. There is no project account service for cross-device synchronization. Remove individual watchlist entries with the star and comparison entries with the × button. Clearing browser site data removes these records and preferences. The methodology page explains this behavior. A blocked or full browser store falls back safely and reports when a preference cannot be saved. Saved preference lists are not uploaded as account profiles. Opening stock/index charts or requesting trends sends the requested instrument identifiers to the local backend, which can request their history from the configured provider and keep a private history cache. Selected comparison instruments are also sent to the local preload endpoint to warm supported timelines. Do not describe the product as offline-only: source images, FX requests and configured provider features can make network requests.

Remote data/logo providers receive ordinary requests made to their services. Their current policies and data rights require separate review before a production privacy notice is published. This file does not assert consent, licensing or retention terms for those providers.

## Operational boundaries

The implemented integration requests market data/history, not trade execution. Do not add broader permissions merely to fix a data error. Never include secrets in browser JavaScript, JSON fixtures, documentation, exported images or support reports. Release only reviewed public data; source-code publication does not authorize redistribution of third-party market feeds.

## Local browser request isolation

The API checks exact loopback Host spelling/port, Origin, Referer and Fetch Metadata. Browser requests from other origins or same-site different-port applications are rejected before provider work begins. Same-origin requests and direct local tools without browser-origin headers remain supported. Static public assets retain their existing availability. These headers protect the browser boundary; they do not authenticate arbitrary local programs, which can forge headers.

The only cross-site API navigation exception is a top-level document return to the broker callback. It still requires the matching state cookie and unexpired, one-time pending state. Callback fetches/images/iframes are rejected. HEAD requests cannot initiate a login, finish a callback or queue a preload. Pending login states expire after ten minutes and are capped at 32.

New sessions are written to an exclusive temporary file with mode 0600 and atomically renamed over the session path. This replaces an existing symlink rather than writing through it. Failed temporary-file cleanup is handled without printing session content. Tests use isolated fake credentials and no actual broker login.

Acceptance on 2 November 2026: same-origin/direct market reads 200; cross-site market/preload and same-site different-port history 403; HEAD login 405; forged top-level callback 400; iframe/fetch callback 403. Existing authenticated quotes and all seven index quotes retained after restart. Login/checksum, replay/expiry, cache/public payload and private file boundaries are covered by automated tests. This supports the local-workflow security rating; public multi-user hosting still requires a separately designed authentication and deployment boundary.
