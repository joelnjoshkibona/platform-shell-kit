# Platform shell kit

The admin-app shell every product on the platform inherits: tokens, components, sidebar, navbar, search, page curtain, lists, details pages, forms and pickers, drafts, Users, Roles, Locations, Settings, Menus, Media, Dashboard, approvals and notifications. All of it is already decided (`docs/PLATFORM_DECISIONS.md`, P1–P48) and already built as a clickable prototype.

A new product **starts from this kit and adds only its own modules.** It never re-decides the shell.

## What's here

| Path | What |
| --- | --- |
| `prototype/index.html` | The runnable prototype (open in a browser). The visual source of truth for the shell |
| `prototype/src/product.js` | **The one file a product edits for branding:** name, tagline, icon, domain, city, storage key |
| `prototype/src/parts_*.js`, `builder.html`, `assemble.py` | The shell's source, by area. `python3 prototype/src/assemble.py` rebuilds `index.html` and `docs/COMPONENTS.md` |
| `docs/PLATFORM_DECISIONS.md` | P1–P119: the locked decisions, each with its source (P38 withdrawn); P51–P79 and P119 are the phone app; P80–P90 the code structure; P91–P92 the build guide, plan and tracker; P107–P112 came from building a product on 1.25.0 |
| `docs/architecture/MODULES.md` | How a product's code is laid out, found and wired (P80–P90): module folders, manifests, loading, services, actions, links, child tabs |
| `docs/guide/index.html` | **The build guide**: how a product is built on this kit, from an empty folder, explained for a beginner (P91). Source: `docs/guide/chapters/*.md`, built by `python3 tools/guide/build.py` |
| `docs/help/index.html` | **The user guide** for the people using a product: how to do each task, with marked pictures (P98). Source: `docs/help/articles/`, built by `node tools/help/build.js`. The kit's core articles; products add theirs. |
| `docs/FRONTEND_RULES.md` | Behaviour rules: Locked / Constrained-creative / Free, plus the review checklist |
| `docs/COMPONENTS.md`, `docs/components_api.json` | The component library: specs, props, emits, slots, do/don't |
| `docs/SCREENS.core.md` | The core screens, their routes, permissions and screenshots |
| `docs/architecture/CORE_ERD.md` | Core tables (identity, locations, approvals, notifications), constraints, lifecycles, jobs |
| `screenshots/` | Baseline screenshots of every core screen: desktop/phone × light/dark, plus key states |
| `docs/mobile/` | The mobile kit: `PHONE_MODEL.md` (what a phone is, how it moves), `DEVICE_TESTING.md`, `PLUGINS.md` (the shared Android plugins on v4), `PROPOSAL.md` (the evidence from four apps) |
| `templates/mobile/` | The product's phone app, its own app (P93): its small Laravel for the phone's work, the interface project in `resources/spa/`, build, icon and splash, signed release, tests |
| `templates/shared/` | `packages/shared` (what the web and phone apps share) and the root npm workspace |
| `templates/` | CLAUDE.md, BUILD_PLAN.md, IMPLEMENTATION_PLAN.md, PROGRESS.md, HANDOFF_PROMPT.md, PRODUCT.md, SCREENS.md and `guide/` (the product's build guide chapters) for a product's repo, with `{{PRODUCT_NAME}}` placeholders |
| `skills/platform-prototype/SKILL.md` | The Claude skill that starts, extends and hands off products on the kit. Upload it to the claude.ai skills when it changes |
| `tools/prototype-shots/` | Regenerates screenshots; builds a side-by-side compare page against a real app |

The prototype carries **example modules (Forms, Templates, Builder, Results, Respondent), under the Bootbox name, as a worked example** of a product module. They show how a module plugs into the shell; a product replaces them with its own.

## The starter: Bootbox

The kit is the design and the decisions; **[Bootbox](https://github.com/joelnjoshkibona/bootbox)** is them built (P94): the API (Laravel 13, every Kernel and Core module), the web app (Vue 3.5, strict TypeScript) and the phone app (NativePHP 4, its own app, P93), with `packages/shared` between the two apps. Every module registers itself from its own folder (`module.json` on the API, `module.ts` on the web and the phone; P80–P82). A product starts from it with `python3 tools/new-product/new_product.py` and adds modules with `php artisan bootbox:module` and `npm run make:module`; its guide is `docs/guide/` in Bootbox. Bootbox's `kit.json` names the kit version it follows.

## How a product uses the kit

1. **Prototype:** copy `prototype/` into the product's design folder. Edit `product.js`. Replace `parts_product.js` (the product registry, P110: permissions, role defaults, detail routes) with the product's. Add the product's modules as new `parts_<module>.js` files, register them in `assemble.py` where the example modules are (`parts_example.js`), and remove the example modules. Rebuild. The shell, the core screens and the components stay as they are.
2. **Decisions:** the product keeps its own log `D1, D2, …` for product decisions. It references P-numbers for anything the shell already decided. If the shell itself must change, that is a new P in this kit, not a D in the product.
3. **Build guide, plan and tracker (P91, P92):** every product keeps `docs/guide/` (its build guide, an HTML page built from chapters), `docs/IMPLEMENTATION_PLAN.md` and `docs/PROGRESS.md`, and every change to the code updates them, so anyone can follow the guide and build the product again.
4. **User guide (P98):** every product keeps `docs/help/` (the kit's core articles plus its own). Articles are Markdown with shot specs; `node tools/help/build.js` makes the marked pictures, `docs/help/index.html` and the in-app Help. A pull request that changes a screen changes its articles.
5. **Handoff:** fill the templates in `templates/` and put them with the prototype, screenshots, rules, components and the product's ERD into the product repo, in the layout the platform-prototype skill describes (Step 5).

## Where a module plugs in

| Extension point | File | What the example does there |
| --- | --- | --- |
| Sidebar menu items + permissions | `parts_shell.js` → `MENU` | Forms, Templates (+ core items) |
| Permission catalogue (P110) | `parts_product.js` → `permissions` (the product registry, loaded before the shell; merged into the shell's `PERMS`) | `Forms.*`, `Responses.*`, `Templates.*` |
| Role defaults (P110) | `parts_product.js` → `roles` (merged into the shell's `ROLES`) | which of its permissions each role gets, and how its roles are described |
| Pages per route | `parts_shell.js` → `ShellView` template | `FormsList`, `TemplatesPage` |
| Detail pages inside the shell (P110) | `parts_product.js` → `detailRoutes` (`[{ route, title(G), parent? }]`): the route check, page titles and sidebar highlight | none (the example's own views are full-screen) |
| Routes outside the shell (full-screen views) | `assemble.py` → `App` | `BuilderView`, `ResponsesView`, `RespondentView` |
| Global search groups | `parts_list.js` → `GROUPS` | forms, responses, templates |
| Dashboard KPIs and charts | `parts_list.js` → `DashboardPage` | forms and responses |
| Demo data per organisation | `parts_shell.js` → `ORGS` / `FORMS` | the three demo organisations |
| Records owned by a location | `parts_loc.js` → `formsAt`, `formVisible` | forms per location |
| Actions behind approvals (P107, P108) | `parts_appr.js` → `ACTIONS` (label, icon, effect, `pick`) + `approvalGate(action, { kind, id, label, loc, note? })`; what a decided request does is the action's `apply(req)` / `reject(req)`, set from the module's own parts | publish, export, reset; their effects and form picker in `parts_example.js`, `loc: form.loc` |
| Sign-in panel and mark (P48) | `product.js` → `signin`, `logo`; art component registered in `comps` | the example's headline, points and `ExampleSignInArt` |
| Curtain loader (P114) | `product.js` → `loader: { page, boot }` (inline SVGs, one colour, CSS motion); shown by `ProductLoader` on the page curtain, the boot curtain and the phone splash | none: the example keeps the ring |
| Documents with lines (P115) | `DocLines` (+ `DocFlow`, `DocTrail`) in the module's form and details page; the product passes `itemOf`, `priceOf`, `lotsOf` and registers its item picker as an ApiSelect source (`itemModule`) | the Design system page demos them on an example catalogue (`parts_doclines.js`) |
| Motion (P116) | `parts_motion.js`: `Meter` for any percentage bar, `Num` for a changing number, `Collapse`, `TabPanel`, `useListMotion` (already in `ListRows`), `useDrawIn` for a module's own drawing, `motionInvalid` after a refused submit; `chartMotion()` is applied to every Highcharts chart by `loadHighcharts` | the example's KPIs, bars, sparks, results charts and dashboard |
| Phone backend (P117) | `mobile/resources/spa/src/backend/index.ts` (product code): `defineBackend({...})` maps the product's API (sign-in and code step, reset by code, profile, organisations, menu, lists, errors) and declares capabilities; the default is the kit's API | the phone prototype's Backend switch |
| Phone motion (P118) | `SplashOpen`, `PageTransition`, `DoneMoment` in `mobile/.../app/motion/`; `done({...})` after a write that matters | the phone prototype's Motion group |
| Phone app states and movements (P51–P79) | `parts_appshell.js` → `appState`, `APP`, the phone components; Screens pill › Phone app and Phone movements | the states and movements with the example's name and mark |
| Background health checks (P119) | the phone app's `module.ts` → `health: HealthSource` (`templates/mobile/resources/spa/src/app/health.ts`); `autostartCheck` for the makers' auto-start lists | `prototype-phone` › Profile › Background health: the example's checks and the auto-start card |
| Settings tabs (P42) | `parts_shell.js` → `SETTINGS_TABS` | the example's Results tab (chart defaults) |
| Recent activity (P45) | `parts_loc.js` → `ACTIVITY` per organisation + `logActivity` | form, people and location events per demo organisation |
| Screens pill (prototype-only) | `assemble.py` → `ScreensPill` | lists the product's screens |
| Modules: links, previews, deep links, Back (P39, P49, P81, P85) | `parts_links.js` → `defineModule({ key, route, path, label, plural, perm, get, set, linkId, find, preview, backParent })`; the preview component next to the module | Roles, Locations, Requests (`RolePreview`, `LocationPreview`, `RequestPreview`); `RecordLink module id` anywhere a related record shows; a plain click opens the record's `page` in the record dialog (P111), the preview sheet only without one. `LINK_DETAIL` and `BACK_PARENT` still accept direct entries from older products |
| Forms with settings (P100) | `defineForm(module, { title, size, component, labels, splash })`, `openForm(module, ctx)`, `useDialogFooter()` in `parts_dialog.js` | Locations: New location (parent locked from a location, New branch demo on the design page) |
| Batch mode (P99) | `useBatch(LS, { noun, key, label, usable, actions })` in `parts_listcard.js` | Users (remind, resend, remove), Trash (restore, delete for good) |
| Record dialogs and tabs (P101) | `defineModule({ tabs, page, resolve })` in `parts_links.js`; `openRecordTab()`, `openDialog()` in `parts_dialog.js`; `RecordLink` `tab` | Locations and Roles open a tab in a dialog |
| User guide (P98) | `docs/help/articles/<lang>/<id>.md` (front matter: title, module, screens, who, related; `::: shot` specs) → `node tools/help/build.js` | Six core articles: lists, exports, reports (2), trash, notifications |
| Reports (P96, P109) | `parts_reports.js` → `REPORTS` (id, name, module, desc, rows, fields, views, `quick`, `sorts`); `loadHighcharts()` | Sales lines, Sales by cashier (quick tabs by payment, three sorts) |
| Background work (P95) | `parts_jobs.js` → `startJobRun({ kind, title, format, params, rows, columns, preview, file, download })`; `ListShare`'s Export uses it | the Location page's Users export; Logs export |
| Lists that show rows (P39, P40) | `parts_listcard.js` → `ListCard` + `ListRows` (priority columns) + `useList({ scope, query })` + `registerUrlList` | Roles, Users, Approvals, Locations, Location › Users tab |

## Rules of the kit

- The shell is **locked**. Change it only with a new P-decision here, then update the prototype, rules and components in the same commit, and bump `kit_version` in `prototype/src/kit.json` (see Versioning).
- A kit change also updates the kit's build guide (`docs/guide/chapters/`, rebuilt with `python3 tools/guide/build.py`) wherever it changes how a product is built (P91).
- Products **pull** kit changes; nothing flows the other way without a P. A product may test a proposed P first (spec in its `docs/platform/P<nn>-*.md`), then port it here as one pull request.
- No secrets, no product data beyond demo seeds. The repo is public.
- **Speak in kit terms.** Decisions, rules, guides, specs, templates and tools describe a need generically ("a product wanted its own picture of its work on the curtain"); they never name a product built on the kit. What a product found, asked for or decided stays in that product's own D-log. The worked example is Bootbox. `tools/product-names.txt` lists the names that must not appear, and `tools/kit-check.py` fails on them.

## Versioning

`prototype/src/kit.json` carries `kit_version` (MAJOR.MINOR.PATCH) and `platform_decisions` (the highest P number). Every pull request that is merged moves the version once, in the pull request itself:

| Bump | When | Example |
|---|---|---|
| **Major** (2.0.0) | A P removes or renames something products build against (an extension point, a component prop, a core table or route), so pulling the kit means changing product code | a new list API replacing `useList` |
| **Minor** (1.4.0) | A P is added or amended. One bump per pull request, however many P's it carries | P47 workflow statuses |
| **Patch** (1.3.1) | Fixes with no decision change: prototype bugs, docs, screenshots, tools | this section |

- Two pull requests in flight both bump from the same version; the one merged second rebases and takes the next number, the same way it renumbers its P.
- Products pin all three in their own `kit.json`: `kit_version`, `kit_commit` (the merge commit they pulled) and `platform_decisions`.
- **Withdrawing** a number that was never decided (a reserved P) is a patch: its row says `Withdrawn:` and why, and notes about it elsewhere may go. Withdrawing a decided P is at least minor.
- Check before opening a pull request: `python3 tools/kit-check.py --base origin/main`. It fails when `platform_decisions` is not the highest P, or when the bump is smaller than the changes need.
- **1.3.0** is P42–P47, merged on 17 Oct 2026 in #7–#9 without separate bumps. The rule applies from 1.3.1.
