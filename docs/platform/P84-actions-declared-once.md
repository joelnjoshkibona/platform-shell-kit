# P84 · Actions are declared once

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (`actions`, `bulk_actions`, `make:action`).

## Decision

- An action is one entry in the module's manifest: the service (`{Module}{Action}Service`), the route (`POST /{module}/{uuid}/{action}`), the permission (`{Module}.{action}`), where its button sits (header, More menu, bulk bar) and what it opens (dialog, page, wizard).
- The web and phone UI read the entry to place the button and gate it; nothing is wired twice.
- Bulk actions: `POST /{module}/bulk-action` with `ids[]` or the list's current filter, gated by `{Module}.bulkAction` and the action's own permission.

## Why

"Service + route + permission + button" is one contract that a reader and a reviewer can check in one place.

## Extension point

`actions` in `module.json` and `module.ts`.
