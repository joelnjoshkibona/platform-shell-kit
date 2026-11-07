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

## Links between records (P85)

Anywhere a record points at another (a task's project, a request's location), it is a `RecordLink`:

- a click opens the other record's preview in a side sheet, with **View full page**;
- Ctrl-click or middle-click opens it in a new tab;
- if you may not open it, it is plain text with a lock and the reason;
- a deleted record shows its label struck through; a missing one says so.

> **Tip**: Open the kit prototype, go to Approvals, open a request and click its location. That is a `RecordLink` (the Design system page shows all its states).
