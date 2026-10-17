# Platform shell kit

The admin-app shell every product on the Cobley core inherits: tokens, components, sidebar, navbar, search, page curtain, lists, details pages, forms and pickers, drafts, Users, Roles, Locations, Settings, Menus, Media, Dashboard, approvals and notifications. All of it is already decided (`docs/PLATFORM_DECISIONS.md`, P1–P48) and already built as a clickable prototype.

A new product **starts from this kit and adds only its own modules.** It never re-decides the shell.

## What's here

| Path | What |
| --- | --- |
| `prototype/index.html` | The runnable prototype (open in a browser). The visual source of truth for the shell |
| `prototype/src/product.js` | **The one file a product edits for branding:** name, tagline, icon, domain, city, storage key |
| `prototype/src/parts_*.js`, `builder.html`, `assemble.py` | The shell's source, by area. `python3 prototype/src/assemble.py` rebuilds `index.html` and `docs/COMPONENTS.md` |
| `docs/PLATFORM_DECISIONS.md` | P1–P48: the locked decisions, each with the decision it came from (P38 withdrawn) |
| `docs/FRONTEND_RULES.md` | Behaviour rules: Locked / Constrained-creative / Free, plus the review checklist |
| `docs/COMPONENTS.md`, `docs/components_api.json` | The component library: specs, props, emits, slots, do/don't |
| `docs/SCREENS.core.md` | The core screens, their routes, permissions and screenshots |
| `docs/architecture/CORE_ERD.md` | Core tables (identity, locations, approvals, notifications), constraints, lifecycles, jobs |
| `screenshots/` | Baseline screenshots of every core screen: desktop/phone × light/dark, plus key states |
| `templates/` | CLAUDE.md, BUILD_PLAN.md, HANDOFF_PROMPT.md, PRODUCT.md, SCREENS.md for a product's repo, with `{{PRODUCT_NAME}}` placeholders |
| `tools/prototype-shots/` | Regenerates screenshots; builds a side-by-side compare page against a real app |

The prototype still carries **Fomu's modules (Forms, Templates, Builder, Results, Respondent) as a worked example** of a product module. They show how a module plugs into the shell; a product replaces them with its own.

## How a product uses the kit

1. **Prototype:** copy `prototype/` into the product's design folder. Edit `product.js`. Add the product's modules as new `parts_<module>.js` files, register them in `assemble.py` where the example modules are, and remove the example modules. Rebuild. The shell, the core screens and the components stay as they are.
2. **Decisions:** the product keeps its own log `D1, D2, …` for product decisions. It references P-numbers for anything the shell already decided. If the shell itself must change, that is a new P in this kit, not a D in the product.
3. **Handoff:** fill the templates in `templates/` and put them with the prototype, screenshots, rules, components and the product's ERD into the product repo, the way `joelnjoshkibona/fomu` is laid out.

## Where a module plugs in

| Extension point | File | What the example (Fomu) does there |
| --- | --- | --- |
| Sidebar menu items + permissions | `parts_shell.js` → `MENU` | Forms, Templates (+ core items) |
| Permission catalogue | `parts_shell.js` → `PERMS` | `Forms.*`, `Responses.*`, `Templates.*` |
| Role defaults | `parts_shell.js` → `ROLES` | which permissions each main role gets |
| Pages per route | `parts_shell.js` → `ShellView` template | `FormsList`, `TemplatesPage` |
| Routes outside the shell (full-screen views) | `assemble.py` → `App` | `BuilderView`, `ResponsesView`, `RespondentView` |
| Global search groups | `parts_list.js` → `GROUPS` | forms, responses, templates |
| Dashboard KPIs and charts | `parts_list.js` → `DashboardPage` | forms and responses |
| Demo data per organisation | `parts_shell.js` → `ORGS` / `FORMS` | the three demo organisations |
| Records owned by a location | `parts_loc.js` → `formsAt`, `formVisible` | forms per location |
| Actions behind approvals | `parts_appr.js` → `ACTIONS` + `approvalGate` | publish, export, reset |
| Sign-in panel and mark (P48) | `product.js` → `signin`, `logo`; art component registered in `comps` | Fomu's headline, points and `FomuSignInArt` |
| Settings tabs (P42) | `parts_shell.js` → `SETTINGS_TABS` | Fomu's Results tab (chart defaults) |
| Recent activity (P45) | `parts_loc.js` → `ACTIVITY` per organisation + `logActivity` | form, people and location events per demo organisation |
| Screens pill (prototype-only) | `assemble.py` → `ScreensPill` | lists the product's screens |
| Linkable details routes (P39) | `parts_links.js` → `LINK_DETAIL` | roles, locations, requests; add one entry per details route |
| Lists that show rows (P39, P40) | `parts_listcard.js` → `ListCard` + `ListRows` (priority columns) + `useList({ scope, query })` + `registerUrlList` | Roles, Users, Approvals, Locations, Location › Users tab |

## Rules of the kit

- The shell is **locked**. Change it only with a new P-decision here, then update the prototype, rules and components in the same commit, and bump `kit_version` in `prototype/src/kit.json` (see Versioning).
- Products **pull** kit changes; nothing flows the other way without a P. A product may test a proposed P first (spec in its `docs/platform/P<nn>-*.md`), then port it here as one pull request.
- No secrets, no product data beyond demo seeds. The repo is public.

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
