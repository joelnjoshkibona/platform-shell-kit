# P102 · The phone app's data modes: connected, on the phone, sync

Status: **decided** (kit 1.21.0); the phone's store amended by **P104** (kit 1.23.0). Amends P93 (the phone's own Laravel may hold the product's data in two of the modes) and P60 (for sync mode only). The owner, 2026-11-07: "I am not sure how we will have a starter for mobile since we have an offline version and an API version. We can also have a sync version"; "I think we need to make the platform kit as generic as possible so that it fits all our needs whenever they come across"; then all three modes, in `docs/proposals/P99-P102.md` (approved).

## Decision

**One phone app with the same frame (P93), three data modes.** A product picks one when it is made (`APP_DATA_MODE=connected|phone|sync` in `mobile/.env`, asked by `tools/new-product`). A module may override it in its `module.ts`: for example, a connected product with a sync-mode field log.

| Mode | Where the truth is | Without signal | Example |
| --- | --- | --- | --- |
| **connected** | the API | read-only: the last data, with its age (P57, P59); a write is never repeated (P60) | most products |
| **on the phone** | the phone's own Laravel and SQLite | everything works; there is no server | a phone-only app |
| **sync** | the API, with a working copy on the phone | everything works; changes wait in a queue and are sent when the signal returns | field data, stock counts |

### One data layer

`src/app/data.ts` in the phone app has the same five calls in every mode: `list(module, query)`, `view(module, id)`, `save(module, record, version)`, `delete(module, id)` and `action(module, name, ids, input)`. It has three implementations:

- `remote`: the API;
- `local`: the phone's Laravel, through `/api/local/*`;
- `sync`: local, plus the queue.

All three speak the list contract (P87). Screens and modules never know which mode is on, so a list page looks and filters the same way in every mode.

### Sync

- **IDs are ULIDs made on the phone**, so a record exists before the server hears of it.
- **The queue** of changes waiting to be sent is a table in the phone's SQLite (`sync_queue`). It survives the app being closed or killed (P58).
- **Changes go in order**, each with a key the server remembers (`sync_keys`, 30 days), so sending one twice does nothing the second time. **P60 is amended for this mode only**: a queued change *is* sent again, safely. In connected mode P60 stays as it is. A record's attachments go after the record.
- **From the server**: `GET /sync/changes?since=<cursor>` returns what changed, in pages, deletions included, for the person's organisation and locations.
- **What is kept on the phone** is set per module ("Sales and payments: your shop, last 90 days"), so the phone holds what the person works with, not the whole database.
- **Conflicts**: every record carries `version`. If the server's copy changed, `POST /sync/push` answers that change with **409 and the server's copy**. The phone shows **mine and theirs side by side**, with the differing fields in bold. **Keep mine** sends it again on the new version; **Use theirs** drops mine. Until the person chooses, mine waits as a draft. Nothing is overwritten silently.
- **Permissions are checked again** by the server when each change arrives. A refused change appears under **Couldn't be sent**, with why, plus **Send again** or **Throw it away** (which asks first).
- **People see it**:
  - Home's sync line: "Last synced 5 min ago · 3 changes waiting · 1 couldn't be sent";
  - the **Sync** page: Sync now, what is waiting, what couldn't be sent, and what is kept;
  - without signal, the bar says "No signal · keep working. Your changes wait and are sent when it is back";
  - the **first sync** after signing in shows its progress, and carries on where it stopped if the signal drops.
- **Signing out with changes waiting asks first**: "3 changes have not been sent". The choices are **Stay signed in** or **Sign out anyway**.

### On the phone

- ~~A phone-only app's way: the phone's Laravel holds the modules' own tables and services (P83), with the same list contract (P87).~~ **Amended by P104**: one generic store for every module, with a way out per module (its own rules, or its own table).
- There is no server and no sign-in. **Data and backups** has Back up now (to a file), Restore from a file, and the date of the last backup. There is no signal bar, because nothing depends on one.
- Updates follow P67 and P79.

### Web

The web app stays connected. People without signal use the phone app.

## Data

- On the phone: `sync_queue` (ulid, module, op, record_id, payload, version, key, tries, error, created_at) and `sync_state` (module, cursor, last_synced_at).
- On the server: `sync_keys` (key, user_id, result, created_at).

## API

- `GET /sync/changes?since=&modules=` → `{ changes: [{ module, id, op, record, version }], cursor, has_more }`
- `POST /sync/push { changes: [{ key, module, op, id, record, version }] }` → `{ results: [{ key, status: done | conflict | refused, record?, reason? }] }`

## Drawn

In the phone prototype (`prototype-phone/src/25_sync.js`), with the picker's **Data mode (P102)**:

- Home with the sync line;
- the Sync page;
- no signal in sync mode;
- the conflict screen;
- the first sync;
- signing out with changes waiting;
- Data and backups in on-the-phone mode.

Screenshots: `prototype-phone/screenshots/sync-*.png`, `phone-backups.png`.
