# P81 · One manifest per module, found by glob

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (`module.json`, `{Module}ModuleConfig`), with the central files removed.

## Decision

- API `module.json`: `key`, `tier`, `group`, `enabled`, `label` (the field a picker and a link show), `references` (`{ "project_id": { "module": "Projects", "label": "name" } }`), `permissions` beyond CRUD, `actions`, `children` (child tabs, P86), `menu`.
- Web and phone `module.ts`: `export default defineModule({ key, path, routes, detailsPanel, preview, permission, backParent, menu, actions, locales })`. Typed: `ModuleKey` is the union of every registered key, so `RecordLink module="Projcts"` fails the type check.
- No central registry, `modules.json`, menu seed file or picker trait to edit.
- A test fails when the API and web manifests disagree on a key, a permission or a reference (P90).

## Why

The generator kept a module's identity in six places (three registry files, `modules.json`, a menu row, a picker method) and guessed relations from table names; a wrong guess was a silently grey link or a 500 in a picker.

## Extension point

`defineModule` in the prototype's `parts_links.js` is the same registry, drawn.
