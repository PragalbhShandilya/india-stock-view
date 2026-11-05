# Development tool setup

Updated 2 November 2026.

Use Node 22+; Node 24 is used by the publication workflow. This workspace's bundled executable was verified as v24.22.1 at `/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node`. If Node/npm are absent from PATH, use that executable directly for the equivalent scripts below. No package installation is needed.

Run commands from the project directory. The server reads its ignored .env there. Never print .env or private session contents while troubleshooting.

| Command | Direct Node equivalent / purpose |
|---|---|
| npm start | node server.mjs — loopback preview and local backend |
| npm test | The explicit regression list in package.json; npm run check discovers all root test files |
| npm run version:assets | node scripts/version-assets.mjs — refresh asset versions and existing generated pages |
| npm run build:pages | node build-public-pages.mjs — regenerate clean company/section entry pages |
| npm run check | node scripts/check.mjs — generated-page/asset freshness, all script syntax, all root tests |
| node coverage-audit.mjs | Write private coverage/identity evidence |
| node parameter-audit.mjs | Reproduce local reference-metric availability and calculation audit |
| npm run refresh:reference | node reference-data.mjs — network-backed official references; writes reviewed source output |
| npm run refresh:nifty50 | node refresh-nifty50.mjs — refresh and validate the official 50-company constituent snapshot |

Open http://127.0.0.1:4174/. Frontend edits are served without a bundler; version assets after changes and refresh the page. Restart the owned local process after server/environment changes. Before restarting, identify the actual listening process; a stale session or observation timeout is not proof it stopped. PORT defaults to 4174; changing the origin also requires matching broker redirect settings.

Troubleshooting:

- Asset/page freshness check fails: run version:assets, or build:pages after directory changes, then check again.
- Local API returns 403: use the matching loopback origin. Cross-origin browser API calls are intentionally rejected.
- Quotes/history unavailable: inspect the sources panel and /api/market status without copying credentials; follow LIVE_DATA_SETUP.md. Configuration alone does not prove authentication or current quotes.
- Reference update unavailable: retained verified records remain usable; inspect dates and coverage rather than treating a failed refresh as new data.
- Browser tool unavailable: continue supported source/API tests and record visual acceptance as pending. Do not substitute a different browser-control path or claim mock tests verify rendering.

GitHub updates are paused. Do not push, publish or expose the local broker server as part of routine validation. See DEPLOYMENT.md for release boundaries.
