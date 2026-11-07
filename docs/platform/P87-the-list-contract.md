# P87 · The list contract

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (`ListServiceTrait`, CONVENTIONS §20). Extends P24 and P40 on the API side.

## Decision

- Filters: allowlisted fields, each `{ operator, value }` with `eq, neq, in, nin, gt, gte, lt, lte, between, contains, begins, ends, null, not_null`.
- Sorts: allowlisted fields. Paging: `per_page` up to 100; `paginate=false` for small lookups.
- Default filters apply until the person filters the same field themselves.
- Bulk actions by ids or by the current filter (P84); export of the filtered list; grouped counts for quick tabs.
- `/select/{module}` is the one picker endpoint and shows each module's `label` field from its manifest.

## Why

It is the strongest part of the generator and matches what the kit's list pages already ask for (simple and advanced filters, one request on Apply).

## Extension point

`ListService` base (Phase 0).
