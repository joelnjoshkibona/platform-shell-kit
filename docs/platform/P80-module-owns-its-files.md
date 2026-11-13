# P80 · A module owns its files

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL), adopted for every product after a product's build. Extends P37.

## Decision

- One folder per module on every side, under the same name:

```
api/app/Modules/{Tier}/{Group}/{Module}/        web/src/modules/{module}/
  module.json                                     module.ts      defineModule
  {Module}Controller.php                          routes.ts
  {Module}Model.php · {Module}Factory.php          pages/         List · Details · Overview
  Routes/api.php                                  components/    Form · DetailsPanel · Preview · {Action}Dialog
  Migrations/ · Seeders/ (permissions, menu)      composables/   shared by desktop and phone
  Services/{Module}{Op}Service.php
  Actions/{Module}{Action}Service.php             locales/en.json · sw.json
  Policies/ · Providers/   (optional)             tests/         unit and e2e, TypeScript
  Tests/

mobile/resources/spa/src/modules/{module}/      the phone app's own module folder (P93): module.ts · screens/ · sheets/
                                                composables/ · locales/ · tests/  — only for the modules the phone shows

Inside each app's src/ (web and mobile): app/ (not a module: start-up, loader, languages, session, the frame,
 and on the phone its behaviour) · components/ · modules/
```
- Tiers: **Kernel** (the platform's plumbing: auth, logs, queue, settings), **Core** (every product: users, roles, locations, media, menus, approvals), **Custom** (the product's own). Group is a folder inside the tier.
- The phone app is its own app (P93): its modules live in `mobile/resources/spa/src/modules/{module}/`, under the same names, only for the modules it shows. It shares nothing with `web/` but `packages/shared`. (1.12.1 had put phone screens inside the web modules; P93 replaced that.)
- Inside each app's `src/` there are three folders: `app/`, `components/`, `modules/`.
- Nothing about a module lives outside its folder. File names say what they do (`TasksCreateService`, `TasksDetailsPanel`, `TasksMoveDialog`).

## Why

A developer opens one folder and finds everything about one thing. The generator proved it on many products; its weak spots were the files that sat outside the folders (a central menu file, a picker trait, a registry), which P81 removes.

## Extension point

`docs/architecture/MODULES.md` has the full trees and what each file holds.
