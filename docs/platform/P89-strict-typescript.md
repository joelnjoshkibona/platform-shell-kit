# P89 · Strict TypeScript for app code

Status: **decided** (kit 1.12.0). Shelui Tasks D36. Extends P37 (the web app was already TypeScript).

## Decision

- The web app, the phone app and `packages/shared`: `strict`, `noImplicitAny`, strict templates, a `vue-tsc --noEmit` step in CI (not only inside `build`), typed manifests, routes, locales and API types, tests in TypeScript.
- The clickable prototypes stay build-free JavaScript so they open from a file.
- PHP: typed properties, parameters and return types.

## Why

The generator's web app was TypeScript with the checks switched off, and a broken component reference went through. Strict types make module keys, permissions and API shapes checked, not remembered.

## Extension point

`tsconfig` and the CI step (Phase 0).
