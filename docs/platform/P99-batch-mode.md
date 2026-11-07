# P99 · Batch mode on lists

Status: **decided** (kit 1.19.0). The owner, 2026-11-07: "I don't want checkboxes to show up immediately; rather a batch mode toggle, then we begin our batch actions while taking care of the selected page or all based on the filters." Approved in `docs/proposals/P99-P102.md`.

## Decision

- **Batch mode is off by default.** A list looks exactly as it did: no tick boxes.
- **Turning it on:**
  - the **Batch** button in the list toolbar, after Sort. It shows only when the module has at least one bulk action the person may use;
  - on a phone, a **long press** on a row also turns it on, with that row ticked.
- **In batch mode:**
  - every row has a tick box. A tap on the row ticks it (it no longer opens the record), and Space ticks it from the keyboard. The row is announced as a checkbox;
  - the toolbar becomes the **batch bar**:
    - **Done**, then the count: "2 ticked" or "All 340 that match";
    - **Tick this page**: every row on the screen;
    - **All N that match**: every row the filters, search and tab match, on every page. It is sent as the filter (`mode: filter`), never as a list of ids, so it is exact for any number of rows;
    - **Clear**;
    - the bulk actions from the module (`bulk: true` actions, P84): two shown, the rest under **More**;
  - on a phone, the actions sit in a bar fixed at the bottom (the first action and More), and the list leaves room for it;
  - row actions and menus are hidden while batching, so a tap always ticks.
- **Done**, or Esc, ends batch mode and clears the ticks.
- **Changing the filters or the search clears the ticks**, with a toast ("Ticks cleared"), so nothing is acted on that the person no longer sees. With **All that match**, the count simply follows the new filters.
- **Running an action:**
  - an action that deletes or can't be undone asks first, with the count (AppDialog `confirm`); a delete needs **YES** typed;
  - **up to 100 ticked rows** are done at once. The result says how many were done and lists the **skipped** rows with the reason for each ("the owner can't be removed", "two-step is already on");
  - **All that match, or more than 100 rows**, runs as a **background job** (P95), with its page and notification;
  - an action behind an approval (P18) makes one request for the whole batch.
- **Ticks are never in the link.**

## API

- `POST /{module}/bulk-action` with `{ action, mode: 'ids', ids: [] }` or `{ action, mode: 'filter', filters: {} }`.
- It answers `200 { done, skipped: [{ uuid, label, reason }] }`, or `202` with the job run (P95). The server fixes the set of rows when it starts.
- Each row is checked against the action's rules and the person's permission at that row's location; a row that fails is skipped with a reason, never an error for the whole batch.

## Extension point

`useBatch(LS, { noun, key, label, usable, actions: [{ key, label, icon, danger?, typeYes?, confirm?, allowed?(), can?(row) → true | reason, apply(row) }] })` in `parts_listcard.js`. In the app, `apply` is the API call and `can` comes from the server's `skipped`.

## Tests (kit check)

Off by default; Batch turns it on; rows tick and are announced as checked; Tick this page ticks every row; a skipped result lists the reasons; Remove needs YES; All that match runs as a job; changing the search clears the ticks with a toast; Esc ends batch mode; a long press starts it with the row ticked; the phone bar fits.
