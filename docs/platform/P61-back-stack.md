# P61 · Back stack

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: Amends P52; four phone apps compared.

## Decision

Back closes the top layer, in this order: scan view, lock-free sheets and dialogs, menus, the sidebar, a picker; then it goes back through the history; on the first screen it asks twice to leave (P52). On a forced screen (update required, session ended, lock) Back does nothing. Auth redirects replace the history entry, so Back never returns to a stale page.

## Rules

- Order: scan view → action sheet → dialog or sheet → menu or sidebar → picker → history → first screen (press again).
- Forced screens (P53 required, P57, P65): Back is swallowed.
- Auth redirects use replace.
- Hash history gives the web view its Back stack; the app adds one guard entry under the first page.

## Why

In two of the apps full-screen pickers, the sidebar and even the mandatory update dialog could be left with Back.

## Where

Prototype: app--back-twice. Product (P93): `mobile/resources/spa/src/app/` → backstack (replaces phoneBack).
