# P124 · Phone form fields: dates and related records are picked from sheets

Status: **decided** (kit 1.42.0). Extends FRONTEND_RULES "No native pickers, anywhere" to the phone; owner 2026-11-20,
for generated phone screens (D7, P123).

## Decision

- **A date** is a field-styled button showing the date in the person's locale ("15 Jan 2030") or the field's
  placeholder. Tapping it opens a sheet with a month grid: the month and year with previous and next, the weekday
  initials, the days (today ringed, the chosen one filled), **Today**, and **Clear** when the field may be empty. Picking
  a day closes the sheet. The value is `YYYY-MM-DD`. Never `<input type=date>`.
- **A related record** (a foreign key) is a field-styled button showing the chosen record's label, or the placeholder.
  Tapping it opens a sheet with a search box and the related module's rows, from its own list through the data
  client (`data.list(module, { q })`), so it works in all three data modes (P104): connected from the API, phone and
  sync from the phone's store. Rows show the module's label column; **Show more** loads the next page; tapping a row
  picks it and closes the sheet; **Clear** when the field may be empty. Never `<select>`.
- Both carry the field's label, its required mark (P26) and the error under them, like every phone field.
- **A choice from a fixed list** (an enum, a workflow status) is a field-styled button showing the chosen option, and
  a sheet listing the options (the chosen one ticked; Clear when the field may be empty). Never `<select>`.
- **Workflow statuses on the phone (P47).** The phone reads a workflow's statuses as the website does, from
  `GET /workflow-statuses?workflow=…`, and keeps the last answer per organisation, so pills, quick tabs and the status
  choice work offline after one read (connected and sync modes). With no server at all (phone mode) it uses the
  defaults the module declares, which the phone module carries. Labels and tones come from there, never from the code
  (P47); `useWorkflow` on the phone has the website's shape (`rows`, `byId`, `byCode`, `label`, `TONES`).

## Why

A native picker looks different on every phone and cannot be styled, translated or tested the same way; a select
of every related record cannot hold a module of thousands, and never works offline from the phone's store.

## Extension point

`components/ui/DateField.vue`, `components/ui/RecordPick.vue`, `components/ui/OptionPick.vue` and
`app/lib/workflowStatuses.ts` in the phone app (`mobile/resources/spa`). The design page shows the pickers.
