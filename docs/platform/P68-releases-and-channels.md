# P68 · Releases and channels

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: four phone apps compared.

## Decision

Release tooling is dev-only and the signing key lives outside the repo and the app (the bundler zips the working tree). Each channel (local, staging, production) has its own app id, name and icon badge, so builds never overwrite each other. The version code is read from the built APK, not from .env. Plugins are shared packages, never forked per app, and a contract test proves every listed plugin exists.

## Rules

- Key and passwords in ~/.<product>-keys, readable by the owner only; copy kept elsewhere.
- Channels: app id, label and icon badge per environment.
- Version code from aapt on the built file.
- Bundle excludes .env.*, scripts, tests, release tooling.
- Contract test: every plugin in the provider exists and installs.

## Why

One app's dead StatusBar plugin entry broke every login until a contract test was added; another's keystore password sat in a tracked script.

## Where

Template: templates/mobile (release.sh, build-web.sh, make-images.mjs, tests).
