# Lists, details pages, forms and links

Every screen of a product is one of a few shapes. Each shape is decided once (the P decisions) and built from the component library, so every product feels the same.

## Lists (P24, P39, P40, P87)

- One `ListCard` per list: toolbar (Refresh, Filters, Sort, then New on the right), quick tabs, search, filter chips, the rows.
- Rows are `ListRows` with **priority columns**: as the card gets narrower, the least important columns fold into the line under the title, so nothing ever scrolls sideways.
- Search, filters, sort and the page are in the address, so a copied link opens the same view.
- The API side is the **list contract**: filters as `{ operator, value }` on allowlisted fields, allowlisted sorts, at most 100 per page, bulk actions, export.

## Details pages (P26, P49)

- A breadcrumb that starts with **Back**, a header (icon, title, code, status), action buttons (Refresh, Edit, the main action, More).
- Tabs, with the active tab in the address: **Overview first, History last**. A tab that shows other records is that module's own list, locked to this record (P86).
- Delete checks what would go with it, then asks you to type YES.

## Forms (P26, P42)

- Create and edit open as one dialog. Every form keeps a **draft** on the server as you type, and offers it back if you leave and return.
- No browser-native pickers: dates, times, files and selects use the library's pickers. Required fields have an asterisk.

## Reports (P96)

A report is a list page like any other (the same toolbar, Filters, quick tabs and search), with two more dialogs, Group and Columns. It lets people shape the numbers themselves: which columns (pinned or not), totals for the rows shown or for everything the filters match, grouping with subtotals, and a chart built with Highcharts. A view is saved for yourself or shared. The table exports as Excel, CSV or PDF (made on the server, in the background); the chart downloads as a picture or as data.

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

A details page has tabs, and each tab has its own address (`?tab=users`). You don't have to go to a record to see one of its tabs: a link can open **another record's tab in a dialog**, over the page you are on. The dialog's header has the record's name and its tabs; the middle scrolls; the footer has **Close** and **Open full page**.

```html
<RecordLink module="Locations" :id="req.loc" tab="users" label="Its people"/>
```

For that to work, the module tells the kit its tabs and its page, in `defineModule({ tabs: [...], page: LocationPage })`. The page draws only one tab when it is given `embedId`.

Dialogs stack: a link inside a dialog opens another on top, at its own size. Close, Esc or the phone's Back closes the top one only. A dialog never closes from a click outside it, so nobody loses work by accident.

Tabs also work from the keyboard (← → Home End), and when there are too many to fit they scroll, with a **More** menu listing them all.

## Links between records (P85)

Anywhere a record points at another (a task's project, a request's location), it is a `RecordLink`:

- a click opens the other record's preview in a side sheet, with **View full page**;
- Ctrl-click or middle-click opens it in a new tab;
- if you may not open it, it is plain text with a lock and the reason;
- a deleted record shows its label struck through; a missing one says so.

> **Tip**: Open the kit prototype, go to Approvals, open a request and click its location. That is a `RecordLink` (the Design system page shows all its states).
