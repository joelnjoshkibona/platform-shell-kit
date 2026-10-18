# P59 · Connectivity

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: Amends P51; Cobley, Agrovet, Jumla (none has it).

## Decision

The app knows the network from the phone (Network status and the online/offline events) as well as from failed calls. No signal: the P51 banner or page, and the freshness stamp says how old the figures are. Every request has a timeout; reads retry with a short backoff and again when the signal returns; writes are never retried by the app (P60).

## Rules

- Source of truth: the phone's network state plus any request that got no answer.
- A page that never loaded: the P51 page; a loaded page: the banner and "Offline · showing data from 3 min ago".
- Timeout on every request (15 s reads, 30 s writes); reads retry with backoff and on the online event.
- Coming back: refresh what is on screen and say so.

## Why

No app uses the Network API; axios has no timeout in Agrovet and Jumla; retry is manual only.

## Where

Prototype: app--signal-lost, app--back-online. Product: src/phone/network, lib/connection.
