# Deployment and release

Updated 1 November 2026.

## Static website

.github/workflows/pages.yml publishes dist on pushes to main or manual workflow dispatch. In GitHub repository Settings → Pages, choose GitHub Actions. The job checks the main browser script and runs the test suite, then uploads only dist and deploys it to Pages.

There is no build output generation: dist is the authored application. Keep private material outside it. The static artifact contains the bundled data and browser features; it cannot execute Node, broker login exchange, server-side refreshes or market sockets. Reference updates become public only when their changed dist files are included in a deployed revision.

The workflow's existence does not prove the latest deployment succeeded. Inspect the actual workflow run and deployed revision, then smoke-test the public URL. No publication was performed in this documentation task.

## Server-backed hosting

The supplied server binds loopback and only accepts local Host names. Its broker session is shared process state and there is no application-user authentication. Public live hosting therefore needs an explicit design for access control, session/account isolation or a provider-approved shared display feed, secure transport, secret management, persistent private storage, monitoring and data permissions. Do not simply expose the local process to the internet.

## Release checklist

- Run syntax checks and npm test on the intended Node runtime.
- Resolve the applicable manual checks in TEST_REPORT.md and chart review.
- Review dataset dates, coverage, units, identities and source attribution.
- Check that dist contains no credentials, callback captures or private state.
- Confirm the workflow publishes only the intended files and revision.
- Verify rankings, company deep links, downloads and mobile layouts on the deployed site.
- Record the revision, URL, test evidence and remaining limits in the handoff.

## Recovery

For a static regression, restore a known-good source revision and redeploy it through the same workflow. Preserve needed source data provenance. For a local feed problem, stop/restart the service and reconnect through the provider flow; back up private state before any deliberate reset. Never delete .local as a generic troubleshooting step because it can contain session and discovery state.
