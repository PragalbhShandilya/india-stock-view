# Live data setup

Updated 2 November 2026. Actual local Zerodha quotes/history were verified in earlier iterations; all seven index 1M histories and two 5Y index histories were checked on 2 November. This is dated evidence, not a guarantee that a session remains authenticated or that every listing is live. See TEST_REPORT.md for scope.

## Zerodha Kite

1. Obtain a Kite application and appropriate market-data access through the provider.
2. Register the redirect URL shown in .env.example: http://127.0.0.1:4174/api/kite/callback.
3. Put KITE_API_KEY and KITE_API_SECRET in the local ignored .env. Never place secrets in dist.
4. Start the local server from the project directory and use the website's Zerodha connection flow.
5. Complete the provider login in the browser. The server validates a short-lived state cookie, exchanges the request token and stores a private local session.
6. Check /api/market for provider, authenticated, state, received, subscribed, eligible, unsubscribed, connections and updatedAt. Inspect actual trade timestamps and sample securities on both exchanges.

A configured API key does not prove live-data permission. Reconnect if login/session access expires. The application uses market-data and history endpoints; it has no order-placement UI. Do not infer a successful exchange login from a configured status alone.

## Global Datafeeds alternative

Configure GFD_WS_URL with the provider's secure wss endpoint and GFD_API_KEY with the server-side key. The existing adapter targets StreamAllSymbols and requests NSE/BSE catalogues after authentication. Confirm the enabled exchanges and display rights with the provider. No purchase is performed by this project.

When both Kite credential fields are set, /api/market prefers Kite even if it needs login. Remove/leave unset those fields to select the GFD path. There is no automatic fallback between providers.

## Acceptance before calling it live

Verify provider authentication, a real matched quote, exchange identity, price/currency, day change, timestamps, old-tick rejection, disconnection/reconnection and an expired session. Check received counts against the actual subscribed instrument set; catalogue counts and active sockets do not prove full coverage. Validate representative NSE and BSE securities and explicit unavailable states.

The current Node server is local-only. GitHub Pages cannot run this bridge. Public live distribution needs a separate server design and provider-authorized usage; see DEPLOYMENT.md.
