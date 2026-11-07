# P80 · A module owns its files

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL), adopted for every product with Shelui Tasks D33. Extends P37.

## Decision

- One folder per module on every side, under the same name:

```
api/app/Modules/{Tier}/{Group}/{Module}/        web/src/modules/{module}/        phone/src/modules/{module}/
  module.json                                     module.ts                         module.ts   (only modules the phone shows)
  {Module}Controller.php                          routes.ts                         screens/
  {Module}Model.php · {Module}Factory.php          pages/  List · Details · Overview  sheets/
  Routes/api.php                                  components/  Form · DetailsPanel   locales/
  Migrations/ · Seeders/ (permissions, menu)        · Preview · {Action}Dialog       tests/
  Services/{Module}{Op}Service.php                composables/
  Actions/{Module}{Action}Service.php             locales/en.json · sw.json
  Policies/ · Providers/   (optional)             tests/  (unit and e2e, TypeScript)
  Tests/
```
- Tiers: **Kernel** (the platform's plumbing: auth, logs, queue, settings), **Core** (every product: users, roles, locations, media, menus, approvals), **Custom** (the product's own). Group is a folder inside the tier.
- Nothing about a module lives outside its folder. File names say what they do (`TasksCreateService`, `TasksDetailsPanel`, `TasksMoveDialog`).

## Why

A developer opens one folder and finds everything about one thing. The generator proved it on many products; its weak spots were the files that sat outside the folders (a central menu file, a picker trait, a registry), which P81 removes.

## Extension point

`docs/architecture/MODULES.md` has the full trees and what each file holds.
