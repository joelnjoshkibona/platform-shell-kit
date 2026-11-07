# P101 · Tabs you can open from anywhere and move through

Status: **decided** (kit 1.18.0). The owner, 2026-11-07, approved in `docs/proposals/P99-P102.md`: "tabs can be opened in a page right, not must I have to navigate to the details page then the tab; this will make it easier to navigate from another module too". Then: "It can open a modal showing data of that details page tab, with a button for the full page… header and footer fixed, middle content scrollable"; "we should be able to stack multiple dialogs … and close them one by one"; "the dialog shouldn't be smaller as they open up"; "dialog should close by clicking Close at the bottom only or by clicking Open full page".

## Decision

### Another record's tab, in a dialog

- From anywhere (a request, a ticket, another record's tab), a link opens **another record's tab in a dialog**, and you stay on your page.
- **The record dialog** (AppDialog `kind: 'record'`, size `xl`):
  - **header (fixed)**: the module ("Location"), the record's name, ⤢ Full screen, and the record's tabs, to switch between them;
  - **middle (scrolls)**: the tab exactly as on the details page. A list keeps its own search, filters, quick tabs and actions;
  - **footer (fixed)**: **Close** on the left; **Open full page** on the right. That one closes the dialogs and opens the details page on the same tab, and Back returns to where you were.
- **Any module can open it**:
  - `<RecordLink module="Locations" :id tab="users" label="Its people"/>` opens the dialog (without `tab`, RecordLink still opens the preview sheet, P85);
  - actions, menu items and notifications call `openRecordTab(module, id, tab)`;
  - each module declares, in `defineModule`, its `tabs` (`{ key, label, perm? }`) and its details `page`, which can draw one tab (`embedId`, `embedTab`, emits `tabs`). A wrong tab name fails the type check; a tab the person may not see is not offered.

### Dialogs (AppDialog)

- **They stack, and close one by one.** Anything opened from inside a dialog opens on top of it. There is no fixed limit.
- **Each dialog opens at its own size**, from what it holds (`sm` 420 · `md` 560 · `lg` 760 · `xl` 1100), never smaller because it is deeper. The layers below are dimmed. The top dialog's header has a trail of the ones below ("Arusha Branch · Details › Northern Zone · Users"); tapping one closes the dialogs above it, one by one. On a phone, the trail is a back arrow with the name of the one below.
- **A dialog closes only through its footer**: there is no × and clicking outside does nothing. **Esc** and the phone's **Back** close the top dialog only.
- **Full screen** (⤢) fills the window, keeping the fixed header and footer. The choice is remembered per kind of dialog for the person. On a phone every dialog is already full screen, so the button is not shown.
- **The open record dialogs are in the link**: `?open=locations/ARU-01/users,locations/NTH/users`. A reload, a copied link, Back and Forward open the same stack; switching a dialog's tab is a history entry.
- The full settings of `AppDialog` (kinds, actions, `beforeClose`, `confirmText`) are P100's. This decision ships its base: the stack, sizes, full screen, the footer, and the `record`, `confirm` and `info` kinds. Forms with a context come with P100.

### Tabs

- **Keyboard** (the WAI-ARIA tabs pattern): ← and → move and open the next tab; Home and End go to the first and last; only the open tab is in the Tab order, so Tab moves into its content.
- **Too many to fit**: the strip scrolls sideways with faded edges where tabs are hidden; the open tab always scrolls into view; a **More** button lists every tab with its count.
- **Counts** sit inside the tab and never move the tabs when they load.
- **Every tab has its own `?tab=`** (P26, P39).
- **A link to a tab the person may not see, or that does not exist,** opens the first tab instead, with a toast: "You can't see Costs on this record".

## Extension point

`defineModule({ …, tabs, page, resolve })` in `parts_links.js`; `openRecordTab()`, `openDialog()`, `closeDialog()` and `guardTab()` in `parts_dialog.js`; `RecordLink`'s `tab`.

## Tests (kit check)

- Keyboard: → opens Details, End opens History, Home opens Overview, and focus follows.
- More appears exactly when the tabs overflow; choosing History scrolls it into view.
- `?tab=costs` opens Overview with the toast.
- A record dialog opens at `xl` on Users, with Close and Open full page and no corner ×, and is in the link. Clicking outside does nothing.
- Two dialogs stack, with the trail; Esc closes only the top one.
- Open full page goes to `#/locations/…?tab=users`.
- Full screen works and is remembered, and is hidden on a phone.
- `?open=roles/editor/perms` opens the dialog on Permissions.
- Browser Back closes the dialog and stays on the page.
