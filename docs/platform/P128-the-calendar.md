# P128 · The calendar: dated records of every module, on one page

Status: **decided** (kit 1.47.0). Owner 2026-11-21, for the project generator (step 8 round 3): V1 showed projects
(start to due date) and tasks (due date) on a calendar; any product with dated records wants the same.

## Decision

### 1. A module puts its records on the calendar by saying which dates they have

In its `module.json`: `"calendar": { "start": "<column>", "end": "<column>" }` (`end` optional). Both are date or
datetime columns of the module's table. A record with an end shows as a bar from start to end; without one, on its start
day. A record without a start date is not shown.

### 2. One calendar per organisation

`/:org/calendar`, with a sidebar entry for whoever may list at least one module on it.

- Each module on the calendar is a **source** with its name and a colour; a legend shows them, and each can be hidden
  (remembered per person on this device).
- A person sees a module's records only with its `{Module}.list` permission, and only those they could reach in its
  list: the organisation, and the locations they reach for a location-scoped module (the same narrowing as the
  website's pickers).
- A record shows its name (the module's label column) and opens its own page (the record dialog, P111).

### 3. Views

**Month** (a grid, Monday first, P44; a day shows up to three records and "+n more"), **week** (seven columns, bars
across the days they span) and **agenda** (the coming days as a list, the phone's only view). Previous, Today and Next
move by the view's span. The range asked for is at most 100 days.

### 4. The endpoint

`GET /calendar?start=YYYY-MM-DD&end=YYYY-MM-DD` answers
`{ sources: [{ module, label, color }], items: [{ module, uuid, title, start, end }] }` for the person: every source
they may see, and the records overlapping the range (start on or before `end`, and end, or start when there is no end,
on or after `start`).

## Extension point

A module adds itself with the `calendar` key in its `module.json`. A generator writes it from the spec's `calendar`
key (P123: it is one of the manifest keys a generator may write).

## Checks

- A record is shown when its dates overlap the range, as a bar when it has an end; not without a start.
- A module the person may not list is not a source; a location-scoped module shows only the locations they reach.
- A range longer than 100 days is refused (`422`).
- `calendar` naming a column that is not a date or datetime is refused when the module is loaded (a loud error).
