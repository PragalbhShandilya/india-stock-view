# Security and privacy notes

Updated 1 November 2026. Implementation notes, not a legal policy or security certification.

## Private server data

.env holds provider credentials. .local may contain a Kite access-token session and operational state. Both are ignored by Git and must stay outside dist and public artifacts. Kite writes its session file with mode 0600. Do not print private configuration or authenticated connection URLs into screenshots/logs. Rotate credentials with the provider if they are exposed.

The local server binds loopback, limits Host names and restricts HTTP methods. The Kite login uses a random ten-minute state with an HttpOnly, SameSite=Lax cookie. These measures do not supply application-user authentication or production tenant isolation. The broker session is shared server state; this is a private local workflow.

## Browser data

Watchlist/comparison/preferences and imported close reports are stored locally in the browser. There is no project account service for cross-device synchronization. Clearing browser site data may remove these records. Do not describe the product as offline-only: source images, FX requests and configured provider features can make network requests.

Remote data/logo providers receive ordinary requests made to their services. Their current policies and data rights require separate review before a production privacy notice is published. This file does not assert consent, licensing or retention terms for those providers.

## Operational boundaries

The implemented integration requests market data/history, not trade execution. Do not add broader permissions merely to fix a data error. Never include secrets in browser JavaScript, JSON fixtures, documentation, exported images or support reports. Release only reviewed public data; source-code publication does not authorize redistribution of third-party market feeds.
