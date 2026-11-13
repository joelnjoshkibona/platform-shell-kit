# P104 · The phone keeps one generic store, with a way out per module; a database viewer for debug builds only

Status: **decided** (kit 1.23.0). Amends P102 ("On the phone: the phone's Laravel holds the modules' own tables and services"). Owner, 2026-11-08, while building P102 in Bootbox. Asked whether a module's own tables had a downside, the owner said "I am thinking we might need to see the sqlite data / debug the sqlite in the android phone that can expose a web client we can navigate on the browser". The owner then chose the generic store with a way out. On the viewer: "This is only in debug, release build will never and should never ship it."

## Decision

### One generic store on the phone

In the **on-the-phone** and **sync** modes (P102), every module's records live in one table on the phone, `local_records`, with one row per record and the record stored as JSON. It answers the same list contract as the API (P87):

- the 14 filter operators;
- `search` over the record's values;
- sort on any field, and pages;
- `{ data, meta }`.

A module made by the generators therefore works on the phone in all three data modes **with no phone-side data code**, and the generators and CI stay single-sided.

### The way out, per module

A module that needs more on the phone adds one class under the module's key (Bootbox: `mobile/app/Local/Modules/{Key}.php`):

- **rules** (`LocalModule`): validation of a save, and a `saving()` hook (a default, a total). The phone generator writes it with the API's starting rules. In sync mode the server checks every change again when it arrives.
- **its own table** (`LocalModuleStore`): the module keeps its own table, with its own migration, and the store hands it list, view, save and delete. This is for phone-only logic or heavy relational queries offline.

### Sync mode details (completing P102)

- The changes feed's cursor is opaque. Each module's cursor is its last `(updated_at, id)`, compared as the database stores them. Syncable tables keep `updated_at` to the microsecond and carry a `version`, which counts up on every save (`HasVersion`).
- A module opts in with `"sync": { "keep": { "days": N } }` in its `module.json`. The phone keeps what changed in the last N days (or everything the person may see).
- Every pushed change runs through the module's own Create, Edit or Delete service, so validation and rules are the server's. A failure is `refused`, with the messages.
- **Keep mine** and **Send again** send the change with a **new key**: the old key's answer (the conflict, the refusal) is what the server remembers for it.
- A change from the server never overwrites a record that still has the person's changes waiting. A record with a change in conflict or refused holds its later changes until the person decides.
- **Throw it away** takes the record back to the server's last copy, which the phone keeps beside the record (`synced`), or removes it if the server never had it.
- The sync run is carried by the app's interface, which has the person's sign-in. The phone's store decides what happens to each record.
- The shell's own answers (organisations, profile and permissions, menus) are remembered on the phone, so a sync-mode app opens without signal.
- On-the-phone mode: no sign-in; the app is "this phone" (one organisation, every permission). Modules that need the server (Approvals, Users) declare the modes they work in and are left out.

### A database viewer, debug builds only

A **debug build** has a read-only database viewer for a computer's browser:

- It is reached at the phone's Wi-Fi address or through `adb forward tcp:8765 tcp:8765`.
- It is guarded by a 6-digit code the app shows (Profile › This phone).
- It shows tables, rows with search and pages, one row with its JSON pretty-printed, and the generic store **by module, with each record's JSON fields as columns**.

**A release build never contains it**, neither its code, nor its routes, nor its words:

- the native plugin is compiled in only when `APP_DEBUG=true`;
- the bundle leaves its files out otherwise;
- its route exists only in debug;
- the interface loads its screen and words only in a debug build, and CI fails if a normal build carries them;
- the release script refuses `APP_DEBUG=true`.

## Data

On the phone:

- `local_records` (module, id, data json, synced json, version, updated_at, deleted_at; primary key module + id);
- `sync_queue` (ulid, module, op, record_id, payload, version, key, tries, status: waiting | conflict | refused, server_record, error, created_at);
- `sync_state` (module `'*'`, cursor, last_synced_at);
- `local_meta` (key, value: the last backup).

On the server: `sync_keys` (user_id + key unique, result, created_at; kept 30 days). Syncable tables add `version`.

## Built

In Bootbox:

- `api/app/Modules/Kernel/System/Sync`;
- `mobile/app/Local`;
- `mobile/resources/spa/src/app/{data,sync}` and `src/modules/sync`;
- `mobile/packages/devserver`.

The guide is `docs/guide/10-phone-app.md`. End to end, every mode is exercised in CI.
