# P83 · One service per operation, container instances

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL); a product's build (validated data only; instances).

## Decision

- `{Module}{Op}Service` for List, View, Create, CreateSplash, Edit, EditSplash, Delete, DeleteCheck, Activity; `{Module}{Action}Service` for each action. Each runs `execute → validateData → process` in a transaction. The controller only hands the request to it.
- Services are resolved from Laravel's container, not called statically: a product rebinds a kit Core service in its own provider (`$this->app->bind(UsersCreateService::class, ProductUsersCreateService::class)`) without editing the kit; dependencies sit in the constructor; a test can swap one for a fake; nothing lives between requests in a long-running PHP (the phone runtime, Octane).
- A model takes only what `validateData()` returned plus server fields the service sets itself (creator, organisation, version). Never `$request->all()`. Models keep `$guarded = []`; there is no `$fillable` and no column lookup from the database, so a key that is not a column fails loudly instead of being dropped.

## Why

One predictable file per thing a module does. Instances let products change kit behaviour without forking the kit, which is the drift this kit exists to stop. The validation rules are the one designed list of what reaches a model.

## Extension point

`BaseService` (Phase 0) holds the execute, validate, process and transaction steps.
