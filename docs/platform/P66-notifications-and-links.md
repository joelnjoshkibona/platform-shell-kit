# P66 · Notifications and links

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: Cobley (registration), none for taps.

## Decision

After sign-in the app registers its push token; on a token change it registers again; before sign-out it unregisters. Tapping a notification, or a link, opens the record: signed in it goes straight there, signed out it signs in first and then goes there. The in-app bell stays the fallback and the list of record.

## Rules

- Register after sign-in, re-register on rotation, unregister before sign-out (it needs the token).
- A notification carries a route; tapping opens it (or sign-in, then it).
- Links use the product's scheme and host; the same route table as the web.
- The server deactivates a token a send fails on.

## Why

Cobley registers tokens but a tap only launches the app; Agrovet and Jumla have stubs.

## Where

Product: src/phone/links; needs the Firebase project.
