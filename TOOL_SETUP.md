# Development tool setup

Updated 1 November 2026.

## Local launch

Use Node.js 22 or later with built-in WebSocket support. From the india-stock-view directory:

```sh
node --version
npm start
```

Open http://127.0.0.1:4174/. No dependency installation or asset compilation is required. Edit dist files directly; changes are served without a bundler. Restart the server after server/environment changes.

## Commands

| Command | Purpose |
|---|---|
| npm start | Local website and optional data backend |
| npm test | Seven regression test files |
| node --check server.mjs | Server syntax validation |
| node --check dist/app.js | Main browser script syntax validation |
| node coverage-audit.mjs | Write .local/coverage-audit.json |
| npm run refresh:reference | Network-backed official reference refresh |

The server attempts to load .env from its working directory. Start it from the project directory. Copy .env.example to .env only when configuring a provider; keep values private. PORT defaults to 4174.

## Troubleshooting

- Command not found: install/select Node 22+ in the terminal environment. Node/npm were unavailable on this documentation session's PATH; tests were not rerun here.
- Port already used: stop the previous project process or set PORT; adjust the Kite redirect registration if the origin changes.
- 403 from local server: use 127.0.0.1 or localhost; arbitrary Host names are rejected.
- Live data absent: inspect Data sources and /api/market status, then follow LIVE_DATA_SETUP.md.
- Empty history: verify the listing has a supported Kite instrument token and authenticated data permission.
- Directory refresh fails: retained master data is still usable; inspect the local status rather than treating it as current.

Do not use public issue reports or screenshots to share .env, private session JSON or authenticated callback URLs.
