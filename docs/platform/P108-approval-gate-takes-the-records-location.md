# P108 · The approval gate takes the record's location (and a note)

Status: **decided** (kit 1.26.0). Proposed by a product (kit 1.25.0), tested in its copy of `parts_appr.js` and ported here with P107.

## Why

An approval route can be scoped to locations (P18: "Forms owned by a branch or zone are checked before they go live"), so the gate must know which location the record belongs to. `approvalGate(action, subject)` and `G.approvalNeeded(action, formId)` found that location by looking the subject up in **`FORMS`**, the example's table, and the New request dialog picked its record from the example's forms. Any other record (a product's proforma, owned by its selling store) had no way to say where it belongs, so location-scoped routes could not apply to it.

## Decision

- **The subject brings its own location:** `approvalGate(action, { kind, id, label, meta?, loc, note? }, run)`.
  - `loc` is the record's owning location; the route is chosen with it (P18) and its approvers are resolved at it and above (P15).
  - `note` (optional) prefills the request's note. A product passes the discount's reason.
- `G.approvalNeeded(action, loc)` takes the location, not a record id.
- **New request** (the manual dialog in Approvals) asks the action where its record is picked from: `ACTIONS[action].pick = { module, kind, label, find(id) → { label, loc }, open?(id) }`. `module` is the record's select source (the `ApiSelect` module), `find` gives the chosen record's label and owning location, and `open` makes "About" on the request page a link.
- **The approvals engine looks up no product table.**
- **In the app**, the server picks the route from the record it is asked to change: the module's own record resolves its location, never the client.

## Extension point

`approvalGate` / `G.approvalNeeded` and `ACTIONS[action].pick` in `parts_appr.js` (prototype); the module's location resolver on the server (app).

## The example

The example's calls pass the form's location (`loc: form.loc`, `G.approvalNeeded(action, form.loc)`); its three actions pick a form (`pick` set in `parts_example.js`). The example behaves the same.

## Tests (kit check)

- A workflow scoped to locations applies to a record that has an owning location and not to one without; one for every record applies to both.
- The gate opens "This needs approval" with the note it was given, and the request is made at the record's location.
- New request picks the record from the action's `pick` source and makes the request at that record's location.
- `parts_appr.js` does not reference `FORMS`.

`tools/prototype-shots/decisions.test.js` runs the first three in the browser; `tools/kit-check.py` checks the last.
