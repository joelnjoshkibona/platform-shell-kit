# P84 · Actions are declared once

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (`actions`, `bulk_actions`, `make:action`).

## Decision

- An action is one entry in the module's manifest: the service (`{Module}{Action}Service`), the route (`POST /{module}/{uuid}/{action}`), the permission (`{Module}.{action}`), where its button sits (header, More menu, bulk bar) and what it opens (dialog, page, wizard).
- The web and phone UI read the entry to place the button and gate it; nothing is wired twice.
- Bulk actions: `POST /{module}/bulk-action` with `ids[]` or the list's current filter, gated by `{Module}.bulkAction` and the action's own permission.

### The entry (amended 2026-11-19, built in Bootbox)

```json
"actions": {
  "close":    { "label": "Close", "icon": "CircleCheck", "button": "header", "confirm": true, "bulk": true,
                "approval": true, "effect": "The task is closed." },
  "reassign": { "label": "Reassign", "icon": "UserRoundCog", "button": "more", "fields": true }
}
```

- `button`: `header` (beside Edit) or `more` (the More menu). `danger` styles it and asks to type YES.
- `confirm`: a plain "Are you sure" before it runs. `fields`: the action opens its own dialog (`{Module}{Action}Dialog.vue`),
  which validates against the service's `rules()`.
- `bulk`: it is also on the list's bulk bar, through `/{module}/bulk-action` (no fields there; a row it cannot apply to is
  skipped with the reason, P99).
- `approval`: it is approval-gated (P107) without a class of its own: the platform's adapter finds the record within
  the person's reach, takes its location (P108) and label, shows `effect`, and runs the same service once approved. The
  direct route refuses (409) while a workflow applies, so the gate cannot be stepped round.
- The route `POST /{module}/{uuid}/{action}` goes to one platform controller: the record is found within reach (404
  otherwise), the service runs in a transaction, the fresh record comes back. The permissions are seeded from the
  entries.
- The service is `Services/{Module}{Action}Service.php` (where the bulk runner finds it), extending the platform's `ModuleAction`: `rules()` and
  `handle($record, $data)`. It is the developer's: a generator writes it once and never again (P123).
- `from` (amended 2026-11-22, generator contract 8): the workflow statuses an action applies from, `"from": ["draft"]`.
  Outside them the platform refuses it with the reason (a bulk run skips the row with it) and the record's page, on the
  web and the phone, does not offer it. Without `from` an action applies in every status. Found rebuilding the V1 demo:
  an approved expense could be submitted again, and a draft marked paid.
- Wizards and page actions are not in the entry yet.

## Why

"Service + route + permission + button" is one contract that a reader and a reviewer can check in one place.

## Extension point

`actions` in `module.json` (the server's contract) and `module.ts` (the buttons: the same keys, plus the dialog component).
