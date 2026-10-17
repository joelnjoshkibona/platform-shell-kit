# P51 · No connection

Status: **decided** (kit 1.7.0). Proposed by DevBiz (D194) after the phone app test, built and tested there first.

## Why

The shell had no idea of the network. With the phone's data off, a list said "No customers match" and its tiles said
"TZS 0 owed": every failed request looked like an empty answer. On a shop's phone that is worse than an error: the
cashier believes it.

## Decision

- **One signal.** The API client reports every request: answered (any status, errors included) or not answered at
  all (no network, server out of reach). A request the app cancelled itself does not count. One unanswered request
  means the connection is lost; any answer means it is back.
- **A page that never loaded** (no answer since it opened; a new path starts a page, a filter change does not) shows
  **No connection** in place of its content: WifiOff in a muted circle, "No connection", "Check the phone's data or
  Wi-Fi. This page opens by itself when the connection is back.", and Try again (outline). The empty-state card's
  size (EmptyState `lg`), so it reads as a state of the page, not an error in it. The workspace that could not load
  its menus shows the same instead of "Could not load your workspace".
- **A page that had loaded** keeps what it shows, because it was true when it came, under a one-line banner at the top
  of the content: WifiOff, "No connection. What you see may be out of date, and nothing can be saved until it is
  back.", Try again (text button).
- **Coming back.** While lost, the app asks every 10 seconds, when the device reports it is online, and on Try again.
  On the first answer the banner goes and a page that never loaded opens again (remounted, so it loads as new).
- **Writes are not queued.** A save offline fails with the form's own error; the banner says why. Offline work is a
  separate decision if a product needs it.

## Components

`ConnectionNotice` (`variant`: `page` | `banner`), state from `lib/connection.ts` (`connection.lost`,
`connection.pageFailed`, `connection.reloads`, `check()`), wired once by `installConnection(router)` and the API
client's `onNetwork` hook. Full-screen pages outside the shell (the DevBiz till) place the same two variants
themselves.

## Kit work

- Prototype: the two states on a module list page (phone and desktop), with a Prototype states toggle.
- Screenshots: `connection--page`, `connection--banner` (and each product's own full-screen pages, like DevBiz's
  `till--no-connection`).
- FRONTEND_RULES: the rule above; COMPONENTS: `ConnectionNotice`.
