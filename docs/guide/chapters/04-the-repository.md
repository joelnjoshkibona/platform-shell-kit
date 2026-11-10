# The repository

A product is one repository ("monorepo") with the API, the web app, the phone app and the documents side by side.

```
api/                      Laravel: the platform core trimmed to what the product uses, plus its modules
  app/Modules/
    Kernel/               the platform's plumbing (auth, logs, queue, settings)
    Core/                 every product's modules (Users, Roles, Locations, Media, Menus, Approvals…)
    Custom/               this product's modules (Tasks, Tickets, Projects…)
web/                      the web app: Vue 3 + TypeScript
  src/app/                everything that is not a module: start-up, languages, session, the frame
  src/components/         the component library
  src/modules/{module}/   one folder per module (see chapter 5)
mobile/                   the phone app, its own app (P93), if the product has one
  app/  routes/  database/        its small Laravel: the phone's own work (device, drafts, log, updates)
  resources/spa/src/
    app/  components/             its start-up and phone behaviour, its own pieces
    modules/{module}/             only the modules the phone shows
packages/shared/          what web and mobile share: API client and types, permissions, statuses, formatting
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

The most important rule of the code: **everything about one thing lives in one folder, under the same name on every side.** To change how tasks work you open `api/app/Modules/Custom/Work/Tasks/`, `web/src/modules/tasks/` and, on the phone, `mobile/resources/spa/src/modules/tasks/`; nothing about tasks is anywhere else. The file names say what they do: `TasksCreateService.php` creates a task, `TasksDetailsPanel.vue` is a task's details panel.

> **Why**: In a large app most time goes into *finding* code. When the folder and the names are predictable, a new developer finds anything in seconds. PROJECT_GENERATOR proved this on many products; the kit made it the rule (P80).

## When the API already exists (P105)

Most products use their own `api/`. Some are a new web app for a system whose Laravel API already runs and keeps serving its old screens. Then the web app talks to that API through **an adapter** in product code, `web/src/backend/index.ts`:

```ts
import { defineBackend } from '@/app/backend'
import { existingApi } from './existing'   // headers, sign-in, profile, menu, list and error mapping

export default defineBackend(existingApi)
```

The adapter turns that API's answers into the kit's contracts (the list contract, P87, and `ApiError` with field errors), so modules never know which backend they run on. It also says which shell parts the backend can serve (drafts, media, search, notifications, view-as, access requests); the rest are left out, not shown broken. Kit files stay untouched, so kit updates keep applying. `api/` and `mobile/` stay in the repository as generated, unused.

> **Why**: Rewriting an API that works, or putting a second backend in front of it, doubles what can break. One small adapter keeps one write path and keeps the product on the kit (P105).
