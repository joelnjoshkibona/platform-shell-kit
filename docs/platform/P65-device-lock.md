# P65 · Device lock

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: New; Cobley, Agrovet, Jumla (none locks).

## Decision

An organisation setting, off by default, that locks the app after the owner's time away (default 5 minutes) and when the process was killed. Fingerprint first, PIN second; five wrong PINs sign out. The lock is only for being away: an installer, a share sheet or a call in progress do not lock. Sign out is always on the lock screen and wipes the phone (P57).

## Rules

- Setting: Lock the app: off / 1 / 5 / 15 minutes (organisation level, owner changes it).
- Fingerprint through the Android biometric prompt; PIN 4 digits, hashed in the secure store.
- Away timer starts on background; not while the system is in front for our request.
- Five wrong PINs sign out.

## Why

None of the apps locks and all keep the session in plain storage; a shared shop phone shows the last person's data.

## Where

Prototype: Lock screen, app--locked. Product: src/phone/lock.
