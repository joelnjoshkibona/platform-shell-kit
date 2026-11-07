# P58 · Phone lifecycle

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: Cobley, Agrovet, Jumla (none handles it); DevBiz.

## Decision

The app reacts to the phone moving. To the background: pause polls, save the open draft and the cart, start the lock timer (P65). To the foreground: refresh what is on screen, recheck the session, the update (P67) and the network (P59), and say "Updated just now". Process killed: reopen where the person was, with the cart and any draft back.

## Rules

- Background: stop polling (the 60 s bell included); write the cart and the open form to the device, keyed by account and API origin.
- Foreground: refresh the visible page; recheck the session and the update; show the freshness stamp.
- Killed: reopen on the last route with the cart and draft restored (toast "Back where you were").
- Coming back from the system (installer, Settings, share, call): re-read state; never rely on a timer (JS timers freeze while the installer is up).

## Why

All three apps ignore pause and resume (the log shows "No listeners for event" dozens of times); the polls ran in the background and a killed process lost an unsaved cart.

## Where

Prototype: app--resumed, app--reopened, Freshness stamp. Product (P93): `mobile/resources/spa/src/app/` → lifecycle.
