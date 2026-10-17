# P54 · Notification permission, explained first

Status: **decided** (kit 1.7.0). The DevBiz owner chose "explain first, then ask".

## Decision

- After the first sign-in in the app, a card **Turn on notifications?** says what will arrive: a decision on a request
  you sent, something waiting for you, an alert you follow (low stock). Quiet hours (P36) still hold them overnight.
- **Turn on** shows Android's own prompt; **Not now** closes the card and does not ask again.
- Notification settings shows **On this phone** with the state and Turn on, so it can be switched on later.
- Products show the card only once push exists (DevBiz: after its Firebase phase); the in-app bell works without it.

## Why

People refuse a bare system prompt they do not understand, and Android may not ask twice.
