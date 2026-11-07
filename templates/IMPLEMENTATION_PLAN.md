<!-- TEMPLATE from the platform shell kit (P92). Keep the shape; replace the steps with the product's; delete this line. -->

# {{PRODUCT_NAME}}: implementation plan

The build plan's phases (`docs/BUILD_PLAN.md`) broken into **numbered steps**. A step is small enough to finish and check in a day or two. Every pull request that changes `api/`, `web/`, `mobile/` or `packages/` names its step, corrects the step here if the work differed, updates its row in `docs/PROGRESS.md` and the guide chapter that explains it (`tools/guide/check.sh` enforces it).

How to write a step:

- **Goal**: one sentence, what works when it is done.
- **Files**: what it creates or changes (paths).
- **Commands**: what to run, in order.
- **Check**: how to prove it (tests, the screen against its screenshot, a manual check with the expected result).
- **Guide**: the chapter in `docs/guide/chapters/` that explains it.
- **Help**: for a step that adds or changes a screen, the articles in `docs/help/articles/` for the tasks done on it (P98).

---

## Phase 0: Foundation

### 0.1 Repository and tooling
- **Goal**: `api/`, `web/`, `packages/shared/` (and `mobile/`) exist, install and start; CI runs on every pull request.
- **Files**: `api/`, `web/package.json`, `web/tsconfig.json` (strict, P89), `.github/workflows/ci.yml`, `tools/guide/`.
- **Commands**: `cd api && composer install && php artisan key:generate`; `cd web && npm i && npm run dev`.
- **Check**: CI is green: Pest, `vue-tsc --noEmit`, lint, unit tests, `tools/guide/check.sh`.
- **Guide**: `chapters/02-setting-up.md`.

### 0.2 Modules load themselves (P80–P82)
- **Goal**: a module is a folder with a manifest; the API's module provider and the web's glob loader find it; `php artisan modules:check` validates manifests.
- **Files**: `api/app/Kernel/Modules/ModuleServiceProvider.php`, `ModulesCheckCommand.php`; `web/src/app/modules.ts` (`defineModule`, `ModuleKey`), `web/src/main.ts`.
- **Commands**: `php artisan modules:check`; `npm run typecheck`.
- **Check**: an empty example module appears in routes, menu and locales without editing any central file; the convention tests (P90) pass.
- **Guide**: `chapters/03-how-modules-load.md`.

### 0.3 Services, lists and links (P83–P88)
- **Goal**: `BaseService`, the list contract, bulk actions, the response shape with `version` and 409, `RecordLink` and its registry.
- **Files**: `api/app/Kernel/Services/BaseService.php`, `ListService.php`; `web/src/app/lists.ts`, `web/src/components/app/RecordLink.vue`.
- **Check**: the reference module (0.4) uses them; tests for validation, 409 and N+1.
- **Guide**: `chapters/04-services-lists-links.md`.

### 0.4 The reference module
- **Goal**: one product module built end to end following the kit guide's tutorial; it is the example the others copy.
- **Guide**: `chapters/10-<module>.md`.

(… then the build plan's phases 1, 2, … each as steps 1.1, 1.2 …)
