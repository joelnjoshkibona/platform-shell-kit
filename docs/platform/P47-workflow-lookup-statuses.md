# P47 · Workflow statuses as lookup tables

Status: **decided when this note merges**, from KilierERP (built and tested in its prototype, 2026-10-16: eleven workflows, the booking spine among them, with a Settings › Statuses card).
Amends **P16**: its first sentence stays (master-data status uses the `statuses` table); its second sentence ("workflow states that drive code stay ENUM columns") is replaced by this note.

## Why

ENUM columns keep code honest (it can only see known values) but put the words people read in the code: renaming "In review" to "With the manager", adding Swahili, or recolouring a state needs a release. Products disagree on wording (KilierERP says "On tour" where the code says `in_delivery`), and the same label drives pills, filter options, quick tabs and lane order in several places, which drift apart. A lookup table keeps the guarantee ENUM gave (code compares a fixed code) and moves the words, colour and order to one place an admin can change.

## Decision

Every workflow people **see and filter by** gets its own lookup table, `<workflow>_statuses`, seeded per organisation.

| Column | Who changes it | Notes |
|---|---|---|
| `id` | – | PK, never shown |
| `organization_id` | – | Seeded per organisation from the kit seeder |
| `code` | **Nobody after seeding** | `snake_case`, `UNIQUE(organization_id, code)`. Transitions, guards, posting rules, tests and reports use the code only. |
| `label` | Admin (Settings › Statuses) | |
| `label_sw` | Admin | Second locale (Swahili); falls back to `label` |
| `tone` | Admin, from a fixed set | `muted · info · wait · warn · live · ok · bad · off`; the theme maps tone to tokens, never a raw colour |
| `sort_order` | Admin | Order of filter options, quick tabs and lane boards |
| `is_terminal` | **Seed only** | No further transitions |
| timestamps | – | |

Records hold `<workflow>_status_id` (FK). No denormalised code copy beside it (R4 in products: derived values are not stored); join, or read the cached lookup.

### Rules

1. **Codes are a contract.** Adding a code is a migration plus a transition in code. Admins cannot add, delete or rename codes; the Settings card shows them read-only and monospace.
2. **Transitions live in code**, keyed by code (`TRANSITIONS.request = { submitted: ['in_review', 'cancelled'], … }`). The table never stores allowed moves.
3. **Labels are display only.** Comparing a label in code fails review (FRONTEND_RULES review checklist).
4. **Tone, not colour.** `ok` = `--success`, `wait` and `warn` = `--warning` (`wait` pulses), `bad` = `--destructive`, `live` = c1 pulsing, `info` = c3, `muted` and `off` = muted. Light and dark both pass because the tokens do.
5. **Cached** once per request (web: once per load) and busted when Settings saves.
6. **Reset to defaults** restores labels, Swahili, tones and order from the seed, never codes.
7. **Unknown code** (a newer server than the client) renders as a muted pill with the raw code; nothing breaks.
8. **Audited**: every label, tone or order change is logged with old and new values.
9. **Scope**: pipeline states nobody relabels stay enums: notification deliveries, device tokens, exports, webhook deliveries. If a product shows one of these to people and wants to rename it, it moves to a lookup then.

### Web

- `StatusPill workflow="request" :code="r.status"`: dot + word from the lookup. The Swahili label is the `title`.
- Filter options, quick-tab labels and lane order read the lookup in `sort_order`.
- Settings › Statuses (its own core tab, after the product's tabs and before Notifications; P42): pick a workflow → reorderable rows (code read-only, label, Swahili, tone) and Reset to defaults. Products add their workflows to the list.

### API

- `GET /api/workflow-statuses?workflow=request` returns the rows in order (cached).
- `PATCH /api/workflow-statuses/{id}` accepts `label`, `label_sw`, `tone`, `sort_order` only (`Settings.manage`); anything else 422.
- Seeder per workflow; a `HasWorkflowStatus` trait gives `status()` (relation), `statusCode()` and scopes `whereStatus('in_review')` that join on code.

## Kit changes in this pull request

| Area | Change |
|---|---|
| `docs/PLATFORM_DECISIONS.md` | P47 row; P16 points to P47 for workflow states |
| `docs/architecture/CORE_ERD.md`, `erd_data.py` | `WORKFLOW_STATUSES` pattern table; `REQUESTS.request_status_id` → `request_statuses`; Fomu's forms, invitations, attempts and responses get `*_status_id` (pipeline states stay enums) |
| `docs/FRONTEND_RULES.md` | Visual rule for workflow status, review checklist item |
| `docs/components_api.json`, `docs/COMPONENTS.md` | StatusPill takes `workflow` + `code` |
| Prototype | `defineWorkflow()` / `statusOf()` / `WF_TONES` in `parts_shell.js`; form statuses (`STAT`) and approval request statuses (`RQ_STATUS`) are now lookups, so every existing pill, filter and tab reads the editable label; `StatusPill`; Settings › Statuses card; design-system demo |
| `prototype/src/kit.json`, `README.md` | 1.3.0, 42 decisions |

## Review checklist additions

- [ ] Rename a status in Settings › Statuses: the pill, filter option and quick tab change together; the record's behaviour does not.
- [ ] Reset to defaults restores words, colours and order; codes never change.
- [ ] No code compares a label.
