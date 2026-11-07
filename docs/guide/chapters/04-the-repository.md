# The repository

A product is one repository ("monorepo") with the API, the web app, the phone app and the documents side by side.

```
api/                      Laravel: the platform core trimmed to what the product uses, plus its modules
  app/Modules/
    Kernel/               the platform's plumbing (auth, logs, queue, settings)
    Core/                 every product's modules (Users, Roles, Locations, Media, Menus, Approvals…)
    Custom/               this product's modules (Tasks, Tickets, Projects…)
web/                      Vue 3 + TypeScript
  src/modules/{module}/   one folder per module (see chapter 5)
    phone/                its phone app screens, if the phone shows the module
  src/main.phone.ts       the phone app's entry: a phone-only build (VITE_APP=1)
  src/phone/              the phone contract: bridge, network, lifecycle, back stack, lock, …
mobile/                   the phone app's Android shell (NativePHP), if the product has one
docs/
  product/                PRODUCT.md, DECISIONS.md (the D-log)
  design/                 prototype/, prototype-phone/, screenshots/, SCREENS.md
  architecture/           ERD, MODULES.md (from the kit)
  frontend/               FRONTEND_RULES.md, COMPONENTS.md, components_api.json (from the kit)
  guide/                  the build guide: chapters/*.md → index.html
  BUILD_PLAN.md           the phases
  IMPLEMENTATION_PLAN.md  the phases broken into numbered steps
  PROGRESS.md             where each step stands
tools/                    prototype-shots/, guide/
CLAUDE.md                 how an agent works in this repository
```

## One module, one folder (P80)

The most important rule of the code: **everything about one thing lives in one folder, under the same name on every side.** To change how tasks work you open `api/app/Modules/Custom/Work/Tasks/` and `web/src/modules/tasks/`; nothing about tasks is anywhere else. The file names say what they do: `TasksCreateService.php` creates a task, `TasksDetailsPanel.vue` is a task's details panel.

> **Why**: In a large app most time goes into *finding* code. When the folder and the names are predictable, a new developer finds anything in seconds. PROJECT_GENERATOR proved this on many products; the kit made it the rule (P80).
