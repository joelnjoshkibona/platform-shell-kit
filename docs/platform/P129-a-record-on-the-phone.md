# P129 · A record on the phone: its page and its actions

Status: **decided** (kit 1.48.0). Amends P84, P101, P102, P123 and P126. Owner 2026-11-21, closing step 7's deferred
phone gaps (actions first; child tabs and lines follow on the same page): an action made without signal waits to send,
and a record has a page of its own on the phone.

## Decision

### 1. The record page

Tapping a row opens the record's page (`/{module}/:uuid`): its name and status pill, its facts (the website Overview's
lines, P101), its actions, and **Edit** (the existing sheet; Delete stays in the sheet). Back returns to the list where
it was.

### 2. Its actions (P84 on the phone)

- The phone module's `module.ts` declares the same action keys as `module.json`, with what the phone needs to draw and
  run them: label (and Swahili), icon, button (`header` or `more`), confirm, danger, approval, the status it moves to,
  and its fields (each with its kind, label and, for a pick, the module or the options). No action needs a file of its own.
- Header actions are buttons on the page; the others are in a **More** sheet. Each is shown only to a person with
  `{Module}.{action}`.
- `confirm` asks first; `danger` asks first, with the button red. An action with fields opens an **action sheet**
  with those fields, drawn with the phone's own fields (P124: DateField, RecordPick, OptionPick, text).

### 3. In each data mode (P102)

- **Connected:** the action is sent at once (`POST /{module}/{uuid}/{action}`). One that needs approval opens the
  approval gate, as on the website.
- **Sync:** the action is **queued like an edit** (a change of kind `action` with its name, input and the record's
  version). The phone shows at once what the action declares (the status it moves to, the fields it sets); it counts
  in **Waiting to send** under its module (P126). **Sync now** sends it; the server runs the action's own service with
  the same permission, scope and version check as the website's call. A stale version is a **conflict**, a refusal is
  **refused**, both settled as edits are (P102). An action that needs **approval** is never queued: without signal its
  button says it needs signal.
- **Phone mode** (no server): an action that declares a status (and its fields) is applied on the phone; any other
  action needs the server and says so.

### 4. Generated modules

The phone skeleton (P123) writes the record page with slots (`header`, `facts`) and `module.ts`'s `actions`; a
generator fills them from the spec. `generator_contract` **5**. `--catch-up` gives a phone module made before 5 its page
and its actions slot.

## Checks

- A row opens its page; Edit opens the sheet; actions show only with their permission.
- Connected: an action runs and the page shows the record as the server returns it.
- Sync, without signal: an action shows at once, waits under its module, is sent by Sync now and the server holds the
  result; a stale one is a conflict; an approval action is not offered offline.
- Phone mode: a status action is applied; another says it needs the server.
