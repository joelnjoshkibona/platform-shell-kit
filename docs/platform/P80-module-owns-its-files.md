# P80 · A module owns its files

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL), adopted for every product with Shelui Tasks D33. Extends P37.

## Decision

- One folder per module on every side, under the same name:

```
api/app/Modules/{Tier}/{Group}/{Module}/        web/src/modules/{module}/
  module.json                                     module.ts      defineModule, incl. what the phone offers
  {Module}Controller.php                          routes.ts
  {Module}Model.php · {Module}Factory.php          pages/         List · Details · Overview
  Routes/api.php                                  components/    Form · DetailsPanel · Preview · {Action}Dialog
  Migrations/ · Seeders/ (permissions, menu)      composables/   shared by desktop and phone
  Services/{Module}{Op}Service.php                phone/         screens/ · sheets/ (the phone app's, P51–P79)
  Actions/{Module}{Action}Service.php             locales/en.json · sw.json
  Policies/ · Providers/   (optional)             tests/         unit and e2e, TypeScript
  Tests/

mobile/    the NativePHP shell (templates/mobile): it packages the phone-only build of web/ (VITE_APP=1)
```
- Tiers: **Kernel** (the platform's plumbing: auth, logs, queue, settings), **Core** (every product: users, roles, locations, media, menus, approvals), **Custom** (the product's own). Group is a folder inside the tier.
- The phone app is not a separate project: a module's phone screens sit in its own `phone/` subfolder, the phone-only entry (`web/src/main.phone.ts`, `VITE_APP=1`) builds them without the desktop layout, and `web/src/phone/` holds the phone contract (bridge, network, lifecycle, back stack, …). `mobile/` is only the Android shell. (Amended in 1.12.1; 1.12.0 said `phone/src/modules/`, which did not match `templates/mobile`.)
- Nothing about a module lives outside its folder. File names say what they do (`TasksCreateService`, `TasksDetailsPanel`, `TasksMoveDialog`).

## Why

A developer opens one folder and finds everything about one thing. The generator proved it on many products; its weak spots were the files that sat outside the folders (a central menu file, a picker trait, a registry), which P81 removes.

## Extension point

`docs/architecture/MODULES.md` has the full trees and what each file holds.
