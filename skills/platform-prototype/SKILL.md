---
name: "platform-prototype"
description: "Use when starting, extending or handing off any admin product on the Cobley platform core (new product, new module, prototype, phone app, handoff): inherit the platform shell kit instead of re-deciding the shell, and keep the plan, tracker and build guide."
---

# Platform prototype

Every admin product on the platform (Laravel API + Vue 3 + shadcn-vue + strict TypeScript, multi-tenant, locations, roles, approvals, an optional NativePHP phone app) inherits the **platform shell kit**: https://github.com/joelnjoshkibona/platform-shell-kit (public). The shell, the code structure and the deliverables are already decided. Fomu (joelnjoshkibona/fomu) is the first product on it and the worked example; Shelui Tasks is the first built on kit 1.12.

> This file lives in the kit at `skills/platform-prototype/SKILL.md`. When the kit changes, update it there and upload it to the claude.ai skills.

## Step 1: load the kit before anything else

Fetch these raw files first (base: `https://raw.githubusercontent.com/joelnjoshkibona/platform-shell-kit/main/`):

1. `README.md` (what the kit is, where a module plugs in)
2. `docs/PLATFORM_DECISIONS.md` (P1–P97, the locked decisions; specs in `docs/platform/`)
3. `docs/FRONTEND_RULES.md` (behaviour rules + review checklist)
4. `docs/COMPONENTS.md` and `docs/components_api.json` (the component library)
5. `docs/SCREENS.core.md` (core screens, routes, permissions)
6. `docs/architecture/MODULES.md` (how a product's code is laid out, found and wired: P80–P90)
7. `docs/guide/index.html` (the kit's build guide: how a product is built, for a beginner)
8. For a phone app: `docs/mobile/PHONE_MODEL.md` and `prototype-phone/README.md`
9. `prototype/src/kit.json` (kit version). If a product already exists, compare with the version it recorded and tell the user what changed in the kit since.

In a Claude Code session with the repo attached, read the same files from the clone and copy `prototype/` from it. In a plain chat, fetch the files by URL; for the prototype source fetch `prototype/src/parts_*.js`, `builder.html`, `assemble.py`, `product.js` as needed.

## Step 2: never re-open what is decided

Do **not** ask about, propose alternatives for, or redesign any of these. They are P-decisions and the user does not want to discuss them again:

- sign-in (email/phone/username + password, TOTP 2FA, trusted device), organisation picker and switcher
- sidebar, top bar, contextual + global search, page curtain, Refresh everywhere, View as
- tokens, light/dark/system themes, Geist, radius, spacing, icons (Lucide), motion, responsiveness, the component library
- list pages (KPIs, quick tabs, toolbar, filters, URL state, priority columns), details pages (Back, breadcrumb, header, tabs in ?tab=, Overview first, History last, delete check + YES gate)
- forms (drafts, pickers, rich text, date picker, save bar + leave guard)
- core modules: Dashboard, Users, Roles, Permissions, Locations, Settings, Menu Management, Media, Approvals, notifications, and the system screens (P97: Logs, Queue, Scheduled tasks, Trash, Notifications, Permissions)
- permissions named `Module.action`, menus gated by `Module.list`, server-side access matching the menu
- the phone app's behaviour (P51–P79, P93): its own app crafted for a phone (Hodie's shape) and its own prototype, quiet header, session, lifecycle, connectivity, uncertain writes, Back, safe areas and keyboard, permissions, lock, push, updates, app log
- **code structure (P80–P90)**: a module owns its folder on every side; one manifest per module found by glob (`module.json`, `defineModule`); modules load themselves; one service per operation, container instances, validated data only; actions declared once; related records are `RecordLink`s from the module registry; child tabs are the child's scoped list; the generator's list contract; the API shape (`version`, 409, `errors`); strict TypeScript; a test per convention
- **deliverables (P91, P92, P98)**: prototype, implementation plan, progress tracker, build guide and user guide (`docs/help/`, marked pictures from `tools/help`), updated with every change
- monorepo `api/` + `web/` + `packages/shared/` (+ `mobile/`, the phone app as its own app in Hodie's shape, P93), each app's `src/` split into `app/`, `components/`, `modules/`, phased build with one PR per phase, visual parity proven with screenshots

If the user asks for a change to one of these, say it is a platform decision, show the P number, and ask (with the Ask tool) whether they want to change the platform for every product. If yes, the change is a new P in the kit repo (decision + prototype + rules + components + the kit's guide updated together, `kit.json` bumped), not a product-only change.

## Step 3: ask only product questions

Use the Ask tool for decisions. Ask only about the product: name, tagline, accent colour, which core modules it keeps (default: all), the product's own modules (records, flows, screens), its data model, who uses it, what goes behind approvals, and whether it has a phone app and what its first slice is. Keep the user's standing habits: plan before execution, terse decision-keyed answers, decisions applied to every artifact.

## Step 4: build the product prototype from the kit

- One artifact for the whole web prototype, assembled from the kit: `product.js` carries the branding; the product's modules are new `parts_<module>.js` files. Register each record type with `defineModule({ key, route, path, label, plural, perm, get, set, linkId, find, preview, backParent })` and show every related record with `RecordLink`. Use the other extension points in the kit README (menu, permissions, roles, routes, search groups, dashboard, settings tabs, workflows). Remove Fomu's example modules unless the product is Fomu. Product patches to the shell go in `assemble.py` with `rep()`, never in the kit's parts.
- A phone app is drawn separately from the kit's `prototype-phone/` (phone-only, 360–430 wide).
- Every new screen follows the kit patterns and is built only from the component library. A new component is added to the library (COMPONENTS.md + components_api.json) first.
- Check every screen at 1280px light and 390px dark at least: no console errors, no horizontal scroll, works in both themes. Look at the screenshots, don't only trust the run.
- Keep a product decision log `D1, D2, …`; reference P-numbers instead of re-deciding. Record the kit version in the product's `kit.json`. Keep the product's ERD (core tables from `docs/architecture/CORE_ERD.md`, real foreign keys).
- Start the deliverables during design: `docs/IMPLEMENTATION_PLAN.md` (a Phase D with the design steps done), `docs/PROGRESS.md`, and `docs/guide/` (chapters on how it was designed and how each prototype was built), from the kit's `templates/`.

## Step 5: handoff pack

When the user wants to hand the product to Claude Code (or asks for the repo pack), produce:

```
CLAUDE.md                         from templates/CLAUDE.md
docs/BUILD_PLAN.md                from templates/BUILD_PLAN.md (phases 0–2 and the last two are platform; product phases in between)
docs/IMPLEMENTATION_PLAN.md       from templates/IMPLEMENTATION_PLAN.md: every phase as numbered steps (goal, files, commands, check, guide chapter)
docs/PROGRESS.md                  from templates/PROGRESS.md: one row per step
docs/guide/chapters/*.md          from templates/guide/: the build guide, for a beginner; index.html built by tools/guide/build.py
docs/HANDOFF_PROMPT.md            from templates/HANDOFF_PROMPT.md
docs/product/PRODUCT.md           from templates/PRODUCT.md, plus DECISIONS.md (the D-log)
docs/design/SCREENS.md            from templates/SCREENS.md (core screens + product screens)
docs/design/prototype/            the product prototype + src/ (and prototype-phone/ for a phone app)
docs/design/screenshots/          generated with tools/prototype-shots
docs/frontend/                    FRONTEND_RULES.md, COMPONENTS.md, components_api.json (from the kit, plus product additions)
docs/architecture/                the ERD with the D-log, MODULES.md (from the kit)
docs/help/                        the user guide (P98): the kit's core articles + the product's, pictures and index.html from tools/help/build.js
tools/prototype-shots/, tools/guide/, tools/help/   from the kit (tools/guide/build.args holds the product's guide title and pages)
api/                              the Cobley backend, trimmed in Phase 0, modules under app/Modules/{Kernel|Core|Custom}/
web/, packages/shared/            created in Phase 0, modules under web/src/modules/
mobile/                           the phone app (P93): its own NativePHP app from templates/mobile, modules under mobile/resources/spa/src/modules/
```

Fill every `{{PRODUCT_NAME}}` / `{{product_slug}}`. Never commit secrets. Push only to a repo the user has created and attached.

## Always

- The kit prototype decides the look; `FRONTEND_RULES.md` and the P-log decide behaviour; `MODULES.md` decides the code layout; the product's D-log decides product behaviour. If two disagree, ask.
- Every change to the code also updates its plan step, its tracker row and its guide chapter, and rebuilds the guide (`tools/guide/check.sh` must pass).
- Say which kit version you loaded at the start of the work.
