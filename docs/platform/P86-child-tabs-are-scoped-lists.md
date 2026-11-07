# P86 · Child tabs are the child's scoped list

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (delegations). Extends P39 (scoped lists) on the API side.

## Decision

- A details tab that shows other records is the child module's own list (P39), fed by `GET /{parent}/{uuid}/{child}/list` and the child's create, edit and delete routes under the same prefix.
- The API scopes every one of them to the parent (the parent is fetched first; the child's parent field is set by the server) and gates them with the child's own permissions.
- The parent field is locked in the child's form (P39).
- The parent's manifest declares the tab (`children`); the child module owns every file of it. A parent never writes into a child's folder.

## Why

The generator's delegations worked but wrote into the child module's folder, so a module did not own its files.

## Extension point

`children` in `module.json`.
