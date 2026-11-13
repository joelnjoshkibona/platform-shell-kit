# P88 · API shape

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) responses, improved.

## Decision

- URLs as the kit and the generator have them: `/{module}/list`, `/create`, `/create/splash`, `/{uuid}/view`, `/{uuid}/edit`, `/{uuid}/edit/splash`, `/{uuid}/delete/check`, `/{uuid}/delete`, `/{uuid}/activity`, `/{uuid}/{action}`, `/bulk-action`; child routes per P86.
- The HTTP status is the outcome; the body's `code` always equals it.
- 422 carries `errors: { field: [messages] }`.
- Every write sends the `version` it started from; a stale one gets 409 with the current record, and the screen shows who changed it.
- Related records use the P85 shape. API types are generated once and used by the web and phone apps.

## Why

Keep what every generated app and the kit already speak; fix the places a client had to guess (status in two places, no conflict answer, related records as whole models).

## Extension point

The API types package (Phase 0).
