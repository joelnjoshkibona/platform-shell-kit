# P82 · Modules load themselves

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (`ApplicationServiceProvider`, `router/index.ts`, `i18n.ts`), without the registry files.

## Decision

- API: one module provider finds every `app/Modules/**/module.json`. For each enabled module it loads `Migrations/`, `Routes/api.php` under the `api` prefix with `auth:sanctum` and `permission:{Module}.{op}` on each route, the module's own provider and policies. The system seeder runs each module's seeder, which upserts its permissions and its menu row (existing databases get new rows; nothing is skipped by id).
- Web: `import.meta.glob('./modules/*/module.ts', { eager: true })` registers each module's routes, menu entry, locales, actions and its link entry (P85). The phone-only entry reads the same manifests and registers each module's `phone` screens instead.
- Adding a module is adding a folder. Disabling is `enabled: false`; its routes, menu and pickers go, its tables stay.

## Why

Nothing to forget when adding a module, and nothing silently skipped when an export is misnamed (the generator only logged a warning).

## Extension point

The module provider and the glob loader are built in Phase 0 of every product (`templates/BUILD_PLAN.md`).
