# P100 · Forms opened with settings, and AppDialog

Status: **decided** (kit 1.20.0). Amends P26 (the one modal host is now a stack; drafts are saved the moment a changed form closes). The owner, 2026-11-07, approved in `docs/proposals/P99-P102.md`, including: "Dialog should close by clicking Close at the bottom only or by clicking Open full page"; "any close of a form that has changes needs to auto save to draft immediately"; "the generator system shell had a drafts logic, we absolutely need that here too"; "create our AppDialog component with all settings we need that calling sites can customise"; and the footer as drawn.

## Form context

`openForm(module, { mode, prefill, lock, hide, disable, title, after, draft })`:

| Setting | What the person sees | Example |
| --- | --- | --- |
| `prefill` | the field is filled, and can be changed | code = ARU-02 |
| `lock` | the field shows its value with a lock (LockedField), fixed | Parent = Arusha Branch |
| `hide` | not shown; the value is fixed | type = branch |
| `disable` | shown greyed, with the reason under it | "Codes are given by head office" |
| `title` | the dialog's title | "New branch in Arusha" |
| `after` | what Save does next: `stay` (another), `open` (the new record), `back` | `open` |
| `draft` | a draft to resume | (from My drafts, or Open full page) |

- **The server enforces it**:
  - before the form opens, the module's splash (`CreateSplash`, P83) checks the context. A lock to a record the person can't see is refused: a toast says so, and the plain form opens;
  - on save, a locked or hidden field sent with another value gets **422** ("Parent is fixed for this form and can't be changed"). Editing the link changes nothing.
- **It is in the link**: `?form=locations.create&lock[parent]=aru&hide[type]=branch&prefill[code]=ARU-02&disable[code]=…&ftitle=…&after=open`. A reload, a copied link, Back and Forward keep it. A link without `form=` closes the form (its draft is kept).
- **P39's scoped create** ("New location under Arusha") is one case of it: `lock: { parent }`.

## AppDialog

`openDialog({ kind, title, size, fullscreen, fullPage, closeLabel, actions, status, beforeClose, confirmText, component, props })` is the only way to open a dialog.

| `kind` | Size | Full screen | Open full page | Footer |
| --- | --- | --- | --- | --- |
| `confirm` | `sm` | no | no | [Cancel] … [the action]; a YES box in the body for deletes |
| `form` | `md`, or the form's | yes | yes: the form as a page, with its draft | [Close] [Open full page] · draft state · actions |
| `record` | `xl` | yes | yes: the record's page on the same tab (P101) | [Close] [Open full page] |
| `info` | `md` | no | no | [Close] |

- **The footer** has three areas:
  - left: the dialog's own buttons, Close and Open full page;
  - middle: the content's status;
  - right: the content's actions, with the main one furthest right, one beside it and the rest under More.

  On a phone the footer is two rows: the status and actions on top, then Close and Open full page. When the actions don't fit beside the dialog's own buttons, they move to their own row as a group.
- **A form is written once.** It hands its status and actions to whatever hosts it with `useDialogFooter(host, { status, actions })`. In a dialog they go to the footer. As a full page (route `form`, after Open full page) the same form puts them in a sticky save bar.
- **Fixed for every dialog** (P101): dialogs stack at their own sizes; they close only through the footer, Esc or Back, top first; there is no × and clicking outside does nothing; on a phone every dialog is full screen.

## Drafts (P26, kept, with one change)

- **Kept as decided:**
  - autosave about every 4 seconds;
  - several drafts per create form, with "You have N drafts" and View drafts;
  - one draft per record for edit forms, with Restore or Discard;
  - My drafts in the account menu;
  - never files or secrets, never in action wizards.
- **New: closing a changed form saves its draft at once**. This covers Close, Esc, Back, a step in the dialog trail, Open full page, and leaving the page:
  - the toast says "Kept as a draft";
  - if the draft can't be saved, the form **stays open** with "Couldn't save the draft" and **Try again** or **Close without saving**;
  - a form changed back to how it started keeps nothing.
- **A record saved with the status Draft** (P47) is different: it is a real record. It gets **Save as draft** beside **Submit**, only on forms whose module has that workflow.

## Extension point

`defineForm(module, { title, size, component, labels, splash(ctx) })`, `openForm()`, `useDialogFooter()`, `keepDraftOnClose(draft, host)`, `checkContext()` in `parts_dialog.js`; `useFormDraft(...).saveNow()` and `.changed()` in `parts_comp.js`. Example: `LocationForm` in `parts_loc.js`.

## Tests (kit check)

- The form dialog's footer has Close, Open full page, Create and add another, and Create location.
- A context locks the parent, hides the type, disables the code with its reason, prefills the code, and is in the link.
- A lock to a record that doesn't exist is refused, with a toast.
- `checkContext` returns the 422 message.
- Esc on a changed form keeps a draft, which is offered when the form opens again; an unchanged form keeps nothing.
- A draft that can't be saved keeps the form open, and Close without saving closes it.
- A `?form=` link opens the form with its lock.
- Open full page carries the typed name into the page's save bar form.
- Create location saves and closes; Create and add another stays open, resets the fields and keeps the lock.
