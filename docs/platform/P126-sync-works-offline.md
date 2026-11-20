# P126 · Sync mode works offline: reference data, a fresh copy, what waits per module

Status: **decided** (kit 1.44.0). Amends P102 and P124. Owner 2026-11-20, after a generated sync module's pickers showed
nothing: "We might need a way to clear and force sync the data from the phone so that it downloads fresh copy of data
from the API's. After that we need to make sure everything else can work offline and sync when user presses sync
somewhere in the app where it shows the total data to sync to the server for each module."

## Decision

### 1. Reference data

In sync mode the phone reads every list from its own store, so the records a sync module points at must be there too.
A sync module names them in its `module.json`: `"sync": { "reference": ["Locations", "Users"] }`.

- The sync feed (`GET /sync/changes`) sends those modules as well, marked `"readonly": true`, **narrowed** to what a
  picker shows: `id`, `uuid`, the label column (its `SELECT_LABEL`, else `name`), `organization_id`/`location_id`/
  `parent_id` where the table has them, `version`. Never e-mails, phone numbers or any other field.
- **Scoped** as the website's picker is (`/select/{module}`): Locations to the person's reachable locations; any other
  module by its record scope and organisation.
- Sent to a person who may list at least one sync module that names it.
- The phone keeps them in its store, never queues a change to one, and refuses to save one; the server refuses a
  pushed change to one ("read-only on the phone").
- Pickers (P124) then work from the store, offline, from the first sync.

### 2. A fresh copy

The Sync page has **Download a fresh copy**. It clears what the phone keeps (records, reference data, cursors) and runs
the first sync again, with its progress, resuming if the signal drops.

- With changes waiting it asks first: **Send them first** (Sync now; the fresh copy follows only when nothing is left
  waiting, in conflict or refused, else it says so), **Throw them away** (asks again, naming how many), **Cancel**.
- Without signal it is disabled, saying it needs signal.

### 3. What waits, per module

The Sync page's **Waiting to send** shows one row per module: its name and how many changes wait ("Tasks · 3",
"Sales · 12"). A row opens to its changes. **Sync now** sends them all. Home's sync line stays as P102 says.

## Extension point

`sync.reference` in `module.json`; a generator writes it from a sync module's foreign keys (and `Locations` for a
location-scoped module) and leaves the rest of `sync` to the scaffolder (P123).
