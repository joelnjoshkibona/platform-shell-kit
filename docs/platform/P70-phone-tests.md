# P70 · Phone tests

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: New; Cobley's host-contract test, DevBiz harness.

## Decision

Every phone movement has a check, and the checks run on a real web view. A checklist per movement is run before each release; a harness drives the emulator and a real phone over the debug socket. Unit tests cover the pure logic of src/phone.

## Rules

- Checklist: one line per movement (cold start, resume, kill, signal lost/back, 401, lock, permission asked/denied, scan, print, call sheet, keyboard, update, back).
- Harness: Playwright over CDP against the emulator, and the same on a real phone.
- Unit tests: network, lifecycle, backstack, writes (idempotency), lock timer.
- Host-contract test: plugins exist, native events post OK.

## Why

No app has a mobile test run; only Cobley has a host-contract test, born from two real bugs.

## Where

Docs: docs/mobile/DEVICE_TESTING.md; tools/phone-test (later).
