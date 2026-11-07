<!-- TEMPLATE from the platform shell kit. Fomu's CLAUDE.md is the worked example: keep the platform parts, replace the product parts, delete this line. -->

# {{PRODUCT_NAME}}: agent guide

{{PRODUCT_NAME}} (placeholder name) is a multi-tenant, Google Forms-like form builder: organisations build choice-only forms, share them publicly or privately, run timed attempts with integrity rules, verify respondents by email OTP, and read results. It runs on the Cobley platform core (users, locations, roles, menus, approvals), scoped per organisation.

Everything here was designed and agreed before code. **Your job is to build it exactly as designed, not to redesign it.**

## Read these first (in this order)

1. `docs/BUILD_PLAN.md`: phases, scope per phase, acceptance criteria. Work one phase at a time.
   Then `docs/IMPLEMENTATION_PLAN.md` (the phases as numbered steps), `docs/PROGRESS.md` (where each step stands) and `docs/guide/index.html` (the build guide). These three are deliverables like the code (P91, P92).
2. `docs/product/PRODUCT.md`: what the product does and why.
3. `docs/design/SCREENS.md`: every screen with its route, states, permissions and screenshots.
4. `docs/frontend/FRONTEND_RULES.md`: behaviour rules (Locked / Constrained-creative / Free) and the review checklist.
5. `docs/frontend/COMPONENTS.md` + `docs/frontend/components_api.json`: the component library (specs, props, emits, slots, do/don't).
6. `docs/architecture/ERD.md`: every table, constraint, status lifecycle, async job, and the **decision log D1–D45** at the end.
7. `docs/design/prototype/`: the clickable prototype. **It is the visual source of truth.**

## Sources of truth

| Question | Answer lives in | Wins over |
| --- | --- | --- |
| How does it look (layout, spacing, colour, motion, copy)? | Prototype + `docs/design/screenshots/` | Everything else, including Cobley's old frontend |
| How does it behave? | `FRONTEND_RULES.md`, then the decision log | Your own preferences |
| What data exists and how is it constrained? | `ERD.md` (generated from `docs/architecture/erd_data.py`) | Cobley's schema where they differ |
| How is the code laid out and wired (modules, manifests, services, actions, links)? | `docs/architecture/MODULES.md` (kit P80–P90) | The Cobley backend's older layout |
| How does the backend work (lists, selects, drafts, media, approvals)? | `api/` (Cobley backend) + `docs/reference/cobley-docs/` | — |
| How was it built, step by step? | `docs/guide/` (chapters → `index.html`), `docs/IMPLEMENTATION_PLAN.md`, `docs/PROGRESS.md` | — |

If two sources disagree, stop and ask in the PR (or as an issue). Don't pick one quietly. A new behaviour needs a new decision (`D46`, `D47`, …) added to `erd_data.py`, then regenerate with `cd docs/architecture && python3 build.py`.

## Repository layout

```
api/     Laravel (laravel/framework ^13) — the Cobley backend, the base we build on (D45)
  app/Modules/{Kernel|Core|Custom}/{Group}/{Module}/   one folder per module (P80): module.json, controller, model, routes, migrations, seeders, services, actions, tests
web/     Vue 3 + Vite + strict TypeScript + Tailwind + shadcn-vue SPA (created in Phase 0)
  src/modules/{module}/   module.ts (defineModule), routes, pages, components, composables, locales, tests
phone/   the phone app, if the product has one: src/modules/{module}/ for the modules it shows
docs/    product, design (prototype, screenshots, screens), frontend rules, components, architecture,
         guide/ (chapters + index.html), BUILD_PLAN.md, IMPLEMENTATION_PLAN.md, PROGRESS.md
tools/prototype-shots/   screenshots of the prototype + side-by-side compare with the app
tools/guide/             build.py (chapters → index.html), check.sh (P92), build.args
```

## Working rules

- **One phase per PR**, branch `phase-N-short-name`. Don't start the next phase until the PR is merged.
- **Match the prototype pixel-for-pixel in intent:**
  - the same components, spacing scale, radius, type sizes, icons (Lucide), copy, empty states, loading states, and light/dark tokens;
  - read the prototype source for exact classes: `docs/design/prototype/src/parts_*.js` are the readable parts, and `index.html` is the assembled build;
  - port its Tailwind classes; don't re-imagine them.
- **Build only from the component library.** If a screen needs something new:
  - add it to `COMPONENTS.md` / `components_api.json` first, in the same PR, with a reason;
  - never hand-roll a one-off inside a page.
- **Every screen is checked at 360/390, 768 and 1280px, in light and dark.**
  - There must be zero console errors or warnings and no horizontal page scroll.
  - Tap targets are at least 40px on phones.
- **Visual parity is proven, not claimed.** For every screen a phase touches:
  - add a Playwright visual test in `web/tests/visual/` that saves screenshots using the same file names as `docs/design/screenshots/index.json` (e.g. `roles__desktop-light.png`);
  - run `cd tools/prototype-shots && npm i && npm run css && node compare.js --app ../../web/tests/visual/__screenshots__ --out out/compare.html`;
  - attach the result (or a summary with the worst differences) to the PR.
- **Modules (P80–P90, `docs/architecture/MODULES.md`):**
  - a module owns its folder on every side; never add a module by editing a central file: its manifest (`module.json`, `module.ts`) is found by the loaders;
  - one service per operation (`{Module}{Op}Service`), resolved from the container; models take only validated data plus server fields;
  - an action is one manifest entry (service, route, `{Module}.{action}`, button);
  - every related record is a `RecordLink`; a child tab is the child's own scoped list;
  - lists follow the list contract; responses follow P88 (`version`, 409, `errors`);
  - strict TypeScript; the convention tests must pass.
- **Plan, tracker and guide (P91, P92):** every pull request that changes `api/`, `web/` or `phone/` also, in the same PR:
  - names its step in `docs/IMPLEMENTATION_PLAN.md` and corrects the step if the work differed;
  - updates its row in `docs/PROGRESS.md` (status, PR, date, how it was verified);
  - adds or updates the chapter in `docs/guide/chapters/` that explains it for a beginner (why, files, commands, checks), and rebuilds `docs/guide/index.html` with `python3 tools/guide/build.py`;
  - runs `tools/guide/check.sh` (CI runs it too).
- **Backend:**
  - its list/select/drafts/media/approvals contracts, and the endpoint shapes in `FRONTEND_RULES.md` → "Backend contract";
  - every tenant table carries `organization_id` and every query is scoped by it;
  - Pest tests for services, permissions and scoping.
- **Strings:**
  - every user-facing string goes through `t()`, with English and Swahili keys added together;
  - the prototype copy is the English text.
- **The prototype has a few things that are not part of the product, so don't build them:**
  - the bottom-left **"Screens"** pill;
  - the **"Prototype states"** developer panel;
  - the phone-frame toggle;
  - seeded demo data, beyond using it as realistic seeders.
- **Secrets:**
  - never commit `.env` files, keys or credentials;
  - `.env.example` files only.
- **When you are unsure, ask** (in the PR, or as an issue). Don't guess. The owner decides through numbered decisions.

## Commands

```bash
# API
cd api && composer install && cp .env.example .env && php artisan key:generate
php artisan db:migrate-multiple --seed && php artisan serve
./vendor/bin/pest

# Web (after Phase 0)
cd web && npm i && npm run dev
npm run test:visual    # Playwright visual tests → web/tests/visual/__screenshots__

# Prototype screenshots / comparison
cd tools/prototype-shots && npm i && npm run shots    # regenerate docs/design/screenshots
node compare.js --app ../../web/tests/visual/__screenshots__

# Build guide after editing docs/guide/chapters, IMPLEMENTATION_PLAN.md or PROGRESS.md
python3 tools/guide/build.py && tools/guide/check.sh

# ERD after editing docs/architecture/erd_data.py
cd docs/architecture && python3 build.py
```
