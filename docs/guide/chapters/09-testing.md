# Testing

A change is finished when it is **proven**, not when it is written.

| What | Where | Run |
| --- | --- | --- |
| API services, permissions, scoping | `api/app/Modules/**/Tests/` | `./vendor/bin/pest` |
| Conventions (P90) | `api/tests/Conventions/`, `web/tests/conventions/` | part of the above, and `npm test` |
| Web units (composables, helpers) | `web/src/modules/*/tests/*.spec.ts` | `npm test` |
| Types | the whole web and phone code | `npm run typecheck` (`vue-tsc --noEmit`) |
| Looks like the prototype | `web/tests/visual/` | `npm run test:visual`, then `tools/prototype-shots/compare.js` |
| Phone movements | the phone test harness | the checklist in `docs/mobile/DEVICE_TESTING.md` |

## The convention tests

They keep the rules true as the product grows: every manifest is valid and the API and web agree; every module has a menu entry and a label field; every reference points at a real module; every form has drafts; no module imports another module's pages or services; services write only validated data; list endpoints don't run a query per row.

> **Watch out**: A failing convention test is never "fixed" by loosening the test. It means the code broke a platform rule; fix the code, or propose a new P.
