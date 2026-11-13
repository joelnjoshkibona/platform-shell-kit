# P107 · Approval actions carry their own effects

Status: **decided** (kit 1.26.0). Proposed by the first product built on kit 1.25.0, which tested it in its own copy of `parts_appr.js` and ported it here with P108–P112.

## Why

The README lists "Actions behind approvals: `parts_appr.js` → `ACTIONS` + `approvalGate`" as an extension point, but an `ACTIONS` entry only carried a label, an icon and the effect as **text**. What actually happened when a request was decided was written inside the shared approvals engine, for the example's records:

- approved `Forms.publish` → the form goes live;
- approved `Responses.void` → the respondent is reset;
- approved `Responses.export` → an export toast.

A product therefore had to edit the engine to say what its own approval does. A product needed "an approved discount is written into the proforma's lines and the proforma can be sent", and "a rejected discount leaves the proforma unchanged and sendable without it".

## Decision

- **An approval action declares what happens when its request is decided**, next to its label: `ACTIONS[action] = { label, icon, effect, apply?(req), reject?(req) }`.
  - `apply(req)` runs once, when the last step approves the request (an Owner completing a short step included).
  - `reject(req)` runs once, when any step rejects it.
  - Neither runs for a cancelled or withdrawn request.
- **The engine names no product record.** It calls `apply` / `reject` and never looks at a request's subject kind.
- `effect` stays the sentence shown on the request page ("When approved").
- **A product sets `apply` / `reject` from its own code**, next to its records, not in the engine's file.
- **In the app**, the effect is server-side: the module registers a handler for its action (the approval's `approved` / `rejected` event) from its own folder. The web only refreshes the record. The prototype's `apply` / `reject` stand in for that handler.

## Extension point

`ACTIONS` in `parts_appr.js` (label, icon, effect); `ACTIONS[action].apply` / `.reject` set from the product's own parts (prototype). In the app, the module's approval handler registered from its folder (P80–P82).

## The example

The example's three effects moved out of the engine into `ACTIONS['Forms.publish'].apply`, `ACTIONS['Responses.void'].apply` and `ACTIONS['Responses.export'].apply`, set in the example's own `parts_example.js` (loaded after the core parts, like any product module). The example behaves the same.

## Tests (kit check)

- Approving the last step calls `apply` once; a middle step does not.
- Rejecting at any step calls `reject` once; cancelling calls neither.
- The engine's decision code (`decide`, `completeStep`, `applyEffect`) names no product record (no `FORMS`, `Responses`, `form`).

`tools/prototype-shots/decisions.test.js` runs these in the browser; `tools/kit-check.py` checks the last one in the source.
