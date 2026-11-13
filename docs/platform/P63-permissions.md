# P63 · Permissions

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: Amends P54; four phone apps compared.

## Decision

A permission is asked at the moment of need, with the reason first and what still works without it. The app never blocks on the answer and a denial never throws. Denied for good: say so and offer Open Settings, plus the fallback. Hardware is declared optional (required=false) so the app installs on every phone.

## Rules

- Just in time: Scan asks for the camera, printing for Bluetooth, the first sign-in for notifications.
- Card: reason, "Without it …", Allow / Not now.
- Denied for good: "<Thing> is off for <Product>", Open Settings; the feature offers its fallback.
- Declared per Android version (Bluetooth: legacy up to 30, BLUETOOTH_CONNECT from 31); hardware features required=false.

## Why

Two apps requested at start and raced the bridge; a third app's printer permission call only re-checked.

## Where

Prototype: app--permission, app--permission-denied. Product (P93): `mobile/resources/spa/src/app/` → permissions.
