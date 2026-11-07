# P90 · Every convention has a test

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (MenusSeedIntegrityTest, FrontendFormsHaveDraftsTest, CoreModulesFrontendOwnershipTest).

## Decision

- Manifests are valid and agree across API and web; every module has a menu entry and a label field; every reference points at a module that exists.
- Every create and edit form has drafts (P26).
- No module imports another module's pages or services: on the API only models, on the web only `RecordLink` and the API.
- Services write only validated data (P83).
- List endpoints run a fixed number of queries whatever the page size (no N+1).

## Why

A rule that is not tested drifts; the generator's own docs and code had drifted where no test held them.

## Extension point

`tests/Conventions` (API) and `tests/conventions` (web), Phase 0.
