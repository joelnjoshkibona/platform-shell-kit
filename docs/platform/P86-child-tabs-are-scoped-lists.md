# P86 · Child tabs are the child's scoped list

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (delegations). Extends P39 (scoped lists) on the API side.

## Decision

- A details tab that shows other records is the child module's own list (P39), fed by `GET /{parent}/{uuid}/{child}/list` and the child's create, edit and delete routes under the same prefix.
- The API scopes every one of them to the parent (the parent is fetched first; the child's parent field is set by the server) and gates them with the child's own permissions.
- The parent field is locked in the child's form (P39).
- The child module declares the tab it adds to a parent's page, in its own files, and owns every file of it: its
  manifest's `tab_on` (`"tab_on": { "Tasks": { "key": "notes", "via": "task_id", "tab": "Notes" } }`) gives the routes on
  its own controller, and an extra tab with `child: { via, column }` in its `module.ts` (P80) puts its list, given the
  parent, on the parent's page. The parent declares nothing and is never touched: a module's `module.ts` imports only
  its own pages (P80), so it could not name the child's list anyway.
- On the tab the child's list has its own search, no heading, and leaves out the column that names the parent.

## Why

The generator's delegations worked but wrote into the child module's folder, so a module did not own its files.

## Extension point

`tab_on` in the child's `module.json`, and `extraTabs` with `child` in its `module.ts`.

Amended 2026-11-19 (built in Bootbox): the parent's `children` became the child's `tab_on`, because the parent's
`module.ts` would have had to import the child's page.
