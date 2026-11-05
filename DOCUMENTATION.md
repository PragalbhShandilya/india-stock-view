# IndiaStockView documentation

Updated 2 November 2026. Start here for current setup, data boundaries, quality evidence and local operating instructions.

## Start here

| Document | Purpose |
|---|---|
| [WEBSITE_QUALITY_REVIEW](WEBSITE_QUALITY_REVIEW.md) | Current per-iteration aspect ratings and evidence limits |
| [PERFORMANCE_AUDIT](PERFORMANCE_AUDIT.md) | Measured transfer results and rendering limits |
| [PARAMETER_AUDIT](PARAMETER_AUDIT.md) | Metric definitions, coverage and supported calculations |
| [README](README.md) | Overview, local launch, data caveats and attribution |
| [PROJECT_OVERVIEW](PROJECT_OVERVIEW.md) | Product scope, users, features and boundaries |
| [ARCHITECTURE](ARCHITECTURE.md) | Modules, data flow, persistence and runtime |
| [DATA_SOURCES](DATA_SOURCES.md) | Provenance, identities, units and freshness |
| [LIVE_DATA_SETUP](LIVE_DATA_SETUP.md) | Zerodha and Global Datafeeds configuration |
| [API_REFERENCE](API_REFERENCE.md) | Local server routes and response contracts |
| [TOOL_SETUP](TOOL_SETUP.md) | Development and repeatable commands |
| [DEPLOYMENT](DEPLOYMENT.md) | Static publication and server deployment requirements |
| [USER_GUIDE](USER_GUIDE.md) | Rankings, charts, imports and saved preferences |
| [FEATURE_QUALITY](FEATURE_QUALITY.md) | Feature evidence and remaining acceptance work |
| [TEST_REPORT](TEST_REPORT.md) | Test inventory, evidence and manual verification |
| [CHART_QUALITY_REVIEW](CHART_QUALITY_REVIEW.md) | Existing detailed chart review and provisional scores |
| [SECURITY_AND_PRIVACY](SECURITY_AND_PRIVACY.md) | Credentials, browser data and hosting boundaries |
| [ROADMAP](ROADMAP.md) | Priorities with acceptance conditions |
| [CONTROL_ROOM_UPDATE](CONTROL_ROOM_UPDATE.md) | Current project status and blockers |
| [TODAY_HANDOFF](TODAY_HANDOFF.md) | Resume instructions for the next session |

## Maintenance

Update the relevant feature and source docs when behavior changes. Record actual test dates and commands in TEST_REPORT; keep older evidence distinct from a fresh run. Refresh CONTROL_ROOM_UPDATE and TODAY_HANDOFF at a material milestone. Never include secrets or session-file contents in documentation. App code lives directly in dist; there is no bundler, but generated public entry pages must stay fresh through build:pages or version:assets. GitHub publication remains paused. This documentation is outside dist and is not included in the public Pages artifact.
