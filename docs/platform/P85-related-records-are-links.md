# P85 · Related records are links from one registry

Status: **decided** (kit 1.12.0). From PROJECT_GENERATOR (`PHP/PROJECT_GENERATOR_PROJECT/PROJECT_GENERATOR`, SYSTEM_SHELL) (`RelatedRecordLink`, `registerModule`). Amends P39 and the related-record preview rule. A plain click amended by **P111** (kit 1.26.0).

## Decision

- Anything that points at another record (list cell, overview field, child row, activity line) is a `RecordLink module id label`, never plain text or a raw id. Overview pages included.
- The registry is the modules' manifests (P81). The prototype's `LINK_DETAIL`, `LINK_PATHS` and `BACK_PARENT` are now filled by `defineModule`.
- The API returns a related record as `{ uuid, label, sub, deleted }` through one eager load per list (soft-deleted targets included).
- It renders as a real link to the full page. ~~A plain click opens the target's own preview in a side sheet (a bottom sheet on the phone) with View full page, which keeps `?tab=` and stamps `?back=`.~~ **Amended by P111**: a plain click opens the record's details page in the record dialog (P101), on Overview or the link's tab; the side sheet with View full page (keeps `?tab=`, stamps `?back=`) stays for a module with no `page`, and the phone app keeps its bottom sheet. A modifier or middle click opens a new tab.
- Without `{Module}.view` it is plain text with a tooltip saying why. The server still checks.
- Empty: a muted "–". Soft-deleted: the label with a Deleted badge; the preview opens read-only. Missing: "That record no longer exists".

## Why

The generator had the mechanism (a registry built from the modules, one component, the target's own panel), the kit had the rule and the addresses. Together: every related record is one tap from its preview and one more from its page, on every screen, without a hand-kept map.

## Extension point

`defineModule` and `RecordLink` in the prototype (`parts_links.js`, `parts_comp.js`).
