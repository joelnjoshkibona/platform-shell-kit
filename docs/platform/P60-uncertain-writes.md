# P60 · Uncertain writes

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: Cobley (the rule), Agrovet, Jumla (gap); DevBiz.

## Decision

A write that may or may not have reached the server is never repeated by the app. The form stays, the button is disabled while it runs, and after a timeout or a lost connection the message says "Check recent <records> before trying again". Writes that move money or stock (sale, payment, delivery, expense, transfer) carry an Idempotency-Key; the server answers a repeated key with the first result, so a deliberate retry cannot double.

## Rules

- No automatic replay of a POST, ever.
- Double-tap guard: the action is disabled while it runs.
- Idempotency-Key (a UUID made when the form opens) on money and stock writes; the API stores key → result for 24 hours and returns it again.
- After an uncertain failure: keep the form, say "Check recent sales before you try again."

## Why

Cobley wrote the right rule; Agrovet and Jumla have only a submitting flag and no timeout, so a timed-out sale could be sent twice.

## Where

Product (P93): `mobile/resources/spa/src/app/` → writes, API middleware for the key. Test: stop the server mid-save, retry, one record.
