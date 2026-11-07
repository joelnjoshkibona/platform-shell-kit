# packages/shared (P93)

What the web app and the phone app must agree on, and nothing else. Copy `package.json`, `src/` and `tsconfig.json` to the product's
`packages/shared/`, and `workspace.package.json` to the repo root as `package.json`.

| File | What |
| --- | --- |
| `src/api/` | the API client (base URL, token, the P88 response shape: `code`, `errors`, `version` and 409) and the types generated from the API |
| `src/permissions.ts` | permission names (`Tasks.create`, …) as a typed union |
| `src/statuses.ts` | the status workflows (codes, labels, tones) |
| `src/format.ts` | dates, money, record keys (`POS-103`) |
| `src/modules.ts` | the module keys (`ModuleKey`) |

Never put a screen, a component, a layout or a style here: those belong to each app (P93).
