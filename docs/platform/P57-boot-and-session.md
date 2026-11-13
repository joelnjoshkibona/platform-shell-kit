# P57 · Boot and session

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: four phone apps compared.

## Decision

The app keeps the stored session across restarts. On start it shows the curtain, keeps the person signed in, and validates the session only when there is a network: with no network it opens read-only on the last data (P59). A 401 means the server ended the session (Session ended screen); a missing signal never does. The token lives in secure storage, never in plain browser storage, and no secret ships in the web bundle (it is readable from the APK): each person signs in and gets their own token. Signing out clears the cart, drafts and caches of that phone; a 401 keeps them for the same account.

## Rules

- Boot: curtain, then router; never a flash of the wrong screen.
- Validate with the server when there is a network; no network = stay signed in, read-only on last data.
- 401 → Session ended (Sign in again), what was open is kept for the account. No network → never this screen.
- Token in the secure store (Android Keystore), not localStorage; app backup excludes it.
- Nothing secret in the web bundle: no shared API key (two of the apps shipped one); the user's own token only.
- Sign out wipes the cart, drafts and caches of this phone; the lock (P65) uses the same wipe.

## Why

One app's initializeAuth cleared the session on any /profile failure, so opening with no signal logged the cashier out; two kept the user record in plain localStorage and shipped a shared API key in the bundle, with allowBackup on; none wiped the last person's cart on sign out.

## Where

Prototype: Session ended (app--session-ended). Product (P93): `mobile/resources/spa/src/app/` → session, secureStore.
