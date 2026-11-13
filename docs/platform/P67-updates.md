# P67 · Updates

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: Amends P53; four phone apps compared.

## Decision

The app sends its installed integer version code (read from the package, not a build constant) and compares on it, so a replaced release still updates. The check runs at launch and on return, never reads a cached answer (a query parameter and no-store), and survives the system installer: the download is resumable and checked (SHA-256), a stale or untagged download is cleared, and the forced screen cannot be left with Back.

## Rules

- Compare the installed version code, not the version string.
- No HTTP cache: ?_=<time> from the app, Cache-Control: no-store from the server.
- Resumable download, SHA-256 check, stale download cleared, version-tagged.
- Re-read state on return from the installer or Settings (visibilitychange).
- Required (below minimum): nothing else is reachable and Back does nothing.

## Why

Every copy of the updater was rebuilt by hand; one app at 1.0.1 never saw 1.0.2 because the web view reused the first answer.

## Where

Prototype: P53 states. Product (P93): `mobile/resources/spa/src/app/` → updates.
