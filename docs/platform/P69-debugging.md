# P69 · Debugging

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: four phone apps compared.

## Decision

The runbook for driving a real web view from the desk is part of the kit (adb forward to the web view's devtools socket, then a scripted session). Web debugging is on in debug builds and off in release builds.

## Rules

- Runbook: find the webview_devtools_remote socket, adb forward, connect over CDP.
- Rules: read the DOM after every action; click by visible text; set input values through the native setter then dispatch input.
- Release builds disable web contents debugging.
- log-app.sh: logcat by app pid plus the on-device Laravel log.

## Why

Three apps wrote the same runbook; all ship release builds that can be inspected.

## Where

Docs: docs/mobile/DEVICE_TESTING.md.
