# Lists, details pages, forms and links

Every screen of a product is one of a few shapes. Each shape is decided once (the P decisions) and built from the component library, so every product feels the same.

## Lists (P24, P39, P40, P87)

- One `ListCard` per list: toolbar (Refresh, Filters, Sort, then New on the right), quick tabs, search, filter chips, the rows.
- Rows are `ListRows` with **priority columns**: as the card gets narrower, the least important columns fold into the line under the title, so nothing ever scrolls sideways.
- On a phone, when the titles would not fit beside the status and the main number, those move to a line under the title, on every row of the list (P112), so a record number never breaks in the middle.
- Search, filters, sort and the page are in the address, so a copied link opens the same view.
- The API side is the **list contract**: filters as `{ operator, value }` on allowlisted fields, allowlisted sorts, at most 100 per page, bulk actions, export.

## Details pages (P26, P49)

- A breadcrumb that starts with **Back**, a header (icon, title, code, status), action buttons (Refresh, Edit, the main action, More).
- Tabs, with the active tab in the address: **Overview first, History last**. A tab that shows other records is that module's own list, locked to this record (P86).
- Delete checks what would go with it, then asks you to type YES.

## Forms (P26, P42)

- Create and edit open as one dialog. Every form keeps a **draft** on the server as you type, and offers it back if you leave and return.
- No browser-native pickers: dates, times, files and selects use the library's pickers. Required fields have an asterisk.

## Documents with lines (P115)

- An order, an invoice or a stock transfer is a header plus lines. The lines are `DocLines`: a list with **View, Edit and Delete** on every row, never inputs in the list.
- Adding or changing a line opens the line form in a modal; deleting asks once (no YES: the line is part of the document's unsaved changes). Header and lines save together, with one draft.
- Lots, when the document moves stock, are picked in the line form, oldest first. `DocFlow` shows where the document is in its workflow and `DocTrail` the documents before and after it.

## Motion (P116)

- Motion tells you what just happened: a dialog opening and closing, a new or deleted row, a changed number, a refused field. It never decorates, never loops, and never plays when you only filter or sort.
- Use the library's pieces instead of your own: `Meter` for a percentage bar, `Num` for a number that changes, `Collapse` for something that opens, `TabPanel` for tab content. Lists and Highcharts charts already get theirs.
- With reduced motion turned on in the operating system, everything shows at once and still works.

## Opening a form with settings (P100)

A form is often opened from somewhere that already knows part of the answer: "New location under Arusha" knows the parent. Instead of a new dialog for each place, every module registers its form once (`defineForm`) and any screen opens it with a context:

```js
openForm('Locations', { title: 'New branch in Arusha', lock: { parent: 'aru' }, hide: { type: 'branch' },
  prefill: { code: 'ARU-02' }, disable: { code: 'Codes are given by head office' }, after: 'open' })
```

The server checks the context twice: when the form opens (a lock to something you can't see is refused) and when it saves (a locked or hidden field that changed is a 422). The form gives its buttons to its host with `useDialogFooter`, so the same form works in a dialog and, after **Open full page**, as a page. Closing a form you changed saves your draft at once ("Kept as a draft"); if that can't happen, the form stays open.

## Reports (P96)

A report is a list page like any other (the same toolbar, Filters, quick tabs and search), with two more dialogs, Group and Columns. It lets people shape the numbers themselves: which columns (pinned or not), totals for the rows shown or for everything the filters match, grouping with subtotals, and a chart built with Highcharts. A view is saved for yourself or shared. The table exports as Excel, CSV or PDF (made on the server, in the background); the chart downloads as a picture or as data.

A report is declared once in the module, and the page is built from it; it names its own quick tabs and sorts (P109):

```js
{ id: 'conversion', name: 'Proforma conversion', module: 'Proformas', rows: () => api.rows('conversion'),
  fields: [{ key: 'no', label: 'Proforma', type: 'text' }, { key: 'status', label: 'Status', type: 'text', group: true },
           { key: 'total', label: 'Total', type: 'money', agg: 'sum' }],
  quick: 'status',                                                      // tabs: All, then each status, with counts
  sorts: [{ value: 'total', label: 'Total', get: r => r.total }],       // left out: its date and number fields
  views: [/* … */] }
```

## Exports, reports and imports (P95)

Anything that takes more than a few seconds runs in the background. The button says so and you keep working. When it ends, a notification opens its **job page**: what you asked for, the result with Download and its first rows, or what went wrong in plain words, and Run again. Everything you started is under **My exports and reports** in the avatar menu.

## Batch mode (P99)

A list never shows tick boxes until someone asks for them. The **Batch** button (or a long press on a phone) turns batch mode on; then people tick rows, tick the whole page, or choose **All N that match**, which sends the filter to the server instead of thousands of ids. The module gives its bulk actions to `useBatch`, each saying which rows it can't apply to and why:

```js
useBatch(LS, { noun: 'users', actions: [
  { key: 'remove', label: 'Remove from the organisation', danger: true, typeYes: true,
    can: m => m.role === 'owner' ? "the owner can't be removed" : true, apply: m => api.remove(m) },
] })
```

Up to 100 rows are done at once, with a result listing what was skipped and why; more, or all that match, run as a background job.

## Tabs and record dialogs (P101)

A details page has tabs, and each tab has its own address (`?tab=users`). You don't have to go to a record to see it or one of its tabs: a link opens **the other record in a dialog**, over the page you are on, on its Overview or on the tab the link names. The dialog's header has the record's name and its tabs; the middle scrolls; the footer has **Close** and **Open full page**.

```html
<RecordLink module="Locations" :id="req.loc" tab="users" label="Its people"/>
```

For that to work, the module tells the kit its tabs and its page, in `defineModule({ tabs: [...], page: LocationPage })`. The page draws only one tab when it is given `embedId`.

Dialogs stack: a link inside a dialog opens another on top, at its own size. Close, Esc or the phone's Back closes the top one only. A dialog never closes from a click outside it, so nobody loses work by accident.

Tabs also work from the keyboard (← → Home End), and when there are too many to fit they scroll, with a **More** menu listing them all.

## Actions that need approval (P107, P108)

Any action can be put behind an approval workflow (Settings › Approval workflows). The module says what the action is and what happens once it is decided; the approvals engine itself is never edited:

```js
ACTIONS['Proformas.discount'] = { label: 'Discount on a proforma', icon: 'Percent',
  effect: 'The discount is written into the proforma and it can be sent.',   // the sentence on the request page
  apply: (req) => api.applyDiscount(req.subject.id),    // once, when the last step approves
  reject: (req) => api.dropDiscount(req.subject.id) }   // once, when any step rejects
```

The button that does the action goes through the gate, which either runs it or asks for approval. The record brings its own location, because a workflow can apply only to records owned by a branch or zone, and its approvers are found at that location and above:

```js
approvalGate('Proformas.discount', { kind: 'proforma', id: pf.id, label: pf.no, loc: pf.store, note: reason },
  () => api.applyDiscount(pf.id))     // runs at once when no workflow applies
```

In the app the effect runs on the server: the module registers a handler for its action's `approved` and `rejected` events, and the page only refreshes the record. The server also finds the record's location itself; it never trusts the one the page sends.

## Links between records (P85, P111)

Anywhere a record points at another (a task's project, a request's location), it is a `RecordLink`:

- a click opens the other record's details page in a dialog over yours (the record dialog above), on its Overview or on the link's tab, with **Close** and **Open full page**; a module with no details page shows its preview in a side sheet instead;
- Ctrl-click or middle-click opens it in a new tab;
- if you may not open it, it is plain text with a lock and the reason;
- a deleted record shows its label struck through; a missing one says so.

> **Tip**: Open the kit prototype, go to Approvals, open a request and click its location. That is a `RecordLink` (the Design system page shows all its states).
