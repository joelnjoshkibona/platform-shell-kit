# The life of a module

A **module** is one kind of thing the product manages (Tasks, Tickets, Projects, Users). Every module goes through the same life, in the same order. Following the order is what keeps a product consistent.

## 1. Idea and decision

Someone needs something ("developers need tickets"). It is discussed until the open questions are answered, and each answer becomes a **D decision** (what a ticket is, who raises it, what its statuses are, who sees it).

## 2. Prototype

The module's screens are drawn in the prototype (chapter 3): its list, its details page and tabs, its form, its actions, its empty and error states, on a desktop and on a phone. The screens are clicked through and agreed.

## 3. Data

The module's tables go into the product's ERD: columns, types, which columns point at other tables (**foreign keys**), what happens to children when a parent is deleted, which statuses a record moves through. Real foreign keys are always declared in the database.

## 4. Plan

The module's work is added to `docs/IMPLEMENTATION_PLAN.md` as numbered steps (chapter 10), and a row per step to `docs/PROGRESS.md`.

## 5. The API side

In this order, in `api/app/Modules/{Tier}/{Group}/{Module}/`:

1. `module.json`: the module's manifest (its key, label field, references, permissions, actions, child tabs, menu entry). See `docs/architecture/MODULES.md`.
2. `Migrations/`: the tables, with foreign keys.
3. `{Module}Model.php` and `{Module}Factory.php`.
4. `Services/`: one class per operation (list, view, create, edit, delete, delete check, splash, activity), then `Actions/` for its actions.
5. `Routes/api.php` and `{Module}Controller.php`: one route per operation, each behind its permission.
6. `Seeders/`: the module's permissions and its menu row.
7. `Tests/`: services, permissions, scoping, and the convention tests pass.

Nothing is registered by hand: the module provider finds the folder (P82).

## 6. The web side

In `web/src/modules/{module}/`:

1. `module.ts`: `defineModule({...})`, the same key and permissions as the API's manifest.
2. `routes.ts`, then the pages: the list, the details layout, the overview, the tabs.
3. `components/`: the form dialog, the details panel, the preview (what a link to this module opens when it has no details page; with one, the link opens the page in a dialog, P111), action dialogs.
4. `locales/en.json` and `sw.json`.
5. `tests/`: unit tests and the visual test that compares each screen with the prototype's screenshot.

## 7. The phone side (if the phone shows it)

In `mobile/resources/spa/src/modules/{module}/`: its own `module.ts` (the same key and permissions as the API), its screens and sheets drawn from the phone prototype, its composables, locales and tests. It reuses only `packages/shared` (the API client and types, statuses, formatters), never the web module's pages or components (P93).

## 8. Explain it

The build guide gets the chapter that explains how this module was built (its data, its files, its commands, its checks), the plan step is corrected if the work differed, and the tracker row is marked done with how it was verified (P92). Then the pull request is opened.

## 9. Review and release

The pull request is reviewed against the prototype, the rules checklist and the definition of done, merged, and released (chapter 11).

## Changing a module later

A change goes through the same steps, smaller: a decision (new D or amended), the prototype, the data (a new migration, never an edited old one), the plan step and tracker row, the code on each side, the guide chapter, review, release.

## Switching a module off or retiring it

Set `"enabled": false` in its manifest: its routes, menu entry and pickers disappear, its tables and data stay. Removing it for good is a planned step of its own: a decision, a migration that archives or drops its tables, the folder deleted on every side, the guide chapter updated to say why.
