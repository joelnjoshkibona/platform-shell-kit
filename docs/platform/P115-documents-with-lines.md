# P115 · Documents with lines

Status: **decided** (kit 1.30.0; phone amendment 1.34.0; prices including VAT 1.39.0). Proposed by a product with sales and stock documents, tested in its copy of the prototype (the line
list, the line modal, lots, conversions) and ported here.

## Why

- Any product that trades needs documents with lines: offers, orders, invoices, purchase orders, goods receipts, deliveries, stock
  transfers. A sales-and-stock product has around seven of them, and the kit had no line pattern, so each product would hand-roll one.
- Lines are where money and stock are decided. One component means one set of rules for rounding, VAT, price overrides, lot picking and
  narrow screens, tested once.
- It composes existing decisions instead of adding new shell behaviour: forms with drafts (P26), AppDialog sizes (P100), ApiSelect (D36),
  RecordLink (P85), workflow lookups (P47), approval gates (P107, P108), and list rows' "measure the component, not the screen" (P40, P112).

## Decision

A document with lines is built from three library components and one page pattern. No product hand-rolls a line editor.

| Part | What it is |
| --- | --- |
| `DocLines` | The lines as a **list**: one read-only row per line (item, quantity, unit price, discount, VAT, line total) with **View, Edit and Delete** on each row, totals under the list. Every change happens in a **modal**: Add and Edit share one line form, Delete asks once. Kinds `sale`, `purchase`, `stock`; optional lot picking inside the line form. Read-only shows the list with View only. |
| `DocFlow` | The lifecycle as steps (the main road of P47 statuses, the step it is on, a side exit when it ended early). |
| `DocTrail` | The documents this one came from and led to, each a `RecordLink` (P85). |
| Document page pattern | The P26/P39 details page with: status pills in the header (lifecycle, and payment where there is one), the next actions as primary buttons, the rest under More; Overview = banner, `DocFlow`, KPI tiles, Details, `DocTrail`, Lines (read-only); a **Lines** tab second; child lists (P86); History last. |

## Behaviour

**Locked**

- Header and lines are **one form, one draft, one save** (P26). Never a separate "save lines" action.
- Lines are editable only while the document is a draft. After that the Lines tab is read-only and says why.
- **The list never holds inputs.** Each line is a row (columns when it fits, a card when it does not). The row opens **View**, and it
  carries **View, Edit and Delete** buttons (P5: the row is a stretched button, its action buttons sit above it). Read-only shows View only;
  on a phone the card opens View and carries Edit and Delete.
- **Changes happen in a modal.** **Add a line** (a button above the list, and in the empty state) and **Edit** open the same line form:
  the item (ApiSelect by name, SKU or barcode, P64 scan on a phone; Add only), quantity, unit price, discount, VAT and the line total, live.
  Field errors show in the form (P26 rules); **Save line** returns to the list. The same item added again adds to its line (unless lots are
  picked per line), and the form says so before saving.
- **View** shows the line: quantity, unit price and where it came from, discount, net, VAT, line total, picked lots, with Edit and Delete
  (Close when read-only) and **Open item**.
- **Delete** asks once in a small dialog naming the line ("Delete line 2?", Keep it / Delete line). No YES gate: a line is part of the
  document's unsaved changes, not a record of its own, and the document's Save keeps or drops it.
- Unit price comes from the product's price resolution (`priceOf`); overriding it needs a permission; an overridden price is marked on the
  line.
- Totals (subtotal, discount, VAT, total) show under the list and update when a line is saved. The server recomputes on save and its
  numbers win; a difference is a 409 (P88), never silently replaced.
- The component **measures its own width** (P40): columns when the row fits, a card per line when it does not (a phone, a narrow dialog).
  No `<table>`, no horizontal scroll, no native number spinners. The line modal rises from the bottom on a phone (the Dialog rule).
- Lots: `lots: true` adds a **Lots** section to the line form, filled **oldest first (FIFO)** with an "Oldest first" reset; the person may
  change it, and the list shows "n of m picked" per line. An action that moves stock (issue, record) refuses a line that is not fully
  picked and says which.
- A document's forms open as AppDialog `xl` when priced (the columns need it), `lg` for quantities only (P100).
- Status changes are actions in the header (primary for the next step, the rest under More); those that cancel ask for a reason; those
  behind approval say so in the confirm dialog and their button reads **Send for approval** (P107).
- Conversions (offer → order → invoice) copy the lines and link both records; the trail shows the chain.

**On a phone, Add a line picks from the catalogue** (amended in kit 1.34.0, P118 for its motion). Typing an item name on a phone is slow
and the person usually adds several lines in a row, so on a phone **Add a line** opens the **item catalogue** instead of the line form:

- `ItemCatalogue`: the items as a list, a sticky search (name, SKU, barcode; P64 scan) and category chips, each item with its price and
  what is in stock, and the quantity already in the document as a badge. An item that cannot be added (out of stock where stock limits
  the kind) says why when tapped.
- Tapping an item opens the **quantity sheet** (`QtySheet`): the item, its price and stock, a large quantity field with − / + and quick
  steps (+10, +20, +50, +100), the line total live, and **Add · total**; for an item already in the document **Update** and **Remove**.
  Limits are props: `maxBy` (stock, or none) and `room` (a money ceiling, such as what is left of a credit limit), and the sheet says which
  limit stopped it and does not add past it.
- A **cart bar** (`CartBar`) at the bottom shows the lines, units and total and opens the lines (`DocLines`) in a sheet, where View, Edit
  and Delete work as above.
- Everything else is unchanged: the same lines, one draft, one save, the server recomputes and wins. On the web, and for kinds that need
  discount, VAT or lots on every line, Add a line keeps the line form.

**Prices including VAT** (amended in kit 1.39.0). Where people quote the price the customer pays (shelf and counter prices), the
document declares `pricesIncludeVat` (sale and purchase kinds; off by default, when prices are before VAT and VAT is added on top):

- The line form labels the unit price **incl. VAT** and shows the price **excl. VAT** under it as you type; the line total is the
  inclusive figure, with the VAT inside it named.
- The list shows the unit price **excl. VAT** and **incl. VAT**: both figures in the line's quantity × price cell (P133 layout A), the VAT rate as "18% inside".
- VAT is taken out of each line, never added: line total = qty × price × (1 − discount %), rounded to 2 decimals;
  **VAT = total × rate / (100 + rate)**, rounded to 2 decimals; excl. = total − VAT, so excl. + VAT is always the total. Rounding is to
  the currency's minor unit (2 decimals), half away from zero. The unit price excl. VAT (price × 100 / (100 + rate)) is for display only.
- Totals under the list: discount incl. VAT (when any), **subtotal excl. VAT, VAT, total incl. VAT**, each the sum of the line figures.
- The server recomputes with the same rule and its numbers win (409 on a difference, P88), as for exclusive prices.
- On a phone the quantity sheet shows the line total incl. VAT with the excl. figure and the VAT inside, the lines sheet's totals read
  subtotal excl. VAT, VAT, total incl. VAT, and the cart bar's total says incl. VAT.
- Mixed rates (0% and 18% lines) work line by line; a document is either inclusive or exclusive as a whole, never per line.

**Constrained-creative**: which columns a kind shows; the limit hint under an item (`ordered 4 · 1 delivered`); KPI tiles on the Overview.

**Free**: the document's own banners and cards (a fiscal receipt, a sent-to-customer log).

## Components

`DocLines`, `DocFlow` and `DocTrail` are in the library, with the phone's `ItemCatalogue`, `QtySheet` and `CartBar` (`docs/COMPONENTS.md`, `docs/components_api.json`, the Design system page, which
demos a sale draft, a stock draft with lots and a read-only list on an example catalogue). The kit names no product record: items, prices
and lots come from props (`itemOf`, `priceOf`, `lotsOf`) and the item picker is an ApiSelect module the product registers (`itemModule`).
`currency` labels the totals and the price field; empty shows numbers only. `pricesIncludeVat` switches a priced document to prices
including VAT (above); the Design system page demos a sale in that mode.

## API side (Bootbox)

- `BaseService` gains a lines helper: the header and its lines saved in one transaction; lines left out are soft-deleted, lines with a
  `uuid` updated, new ones added; rollups (totals, received, delivered, paid) run after the save inside the same transaction.
- A line's `item_id` uses `exists_in_org`; quantities and prices are decimals validated per kind; per-line 422 errors are keyed by the
  line's client id so `DocLines` can show them on the line.
- Numbering (`OF-2026-0001`) from `DocumentNumberService` with a counter row per series, never a text sort.

### The data shape (amended 2026-11-19, built in Bootbox)

- The lines belong to the document's module: a `{table}_lines` table (`uuid`, the document's key, `position`,
  `item_id`, `qty`, `price`, `disc`, `vat`, any extra columns, soft deletes) and a `{Module}LineModel` in its folder.
  They have no routes, permissions or menu of their own: they are read with the document and saved with it.
- The document's model declares them (`HasDocumentLines`, `const LINES = ['model', 'key', 'columns', 'kind',
  'item_module', 'prices_include_vat', 'editable_status']`) and its number (`HasDocumentNumber`, `const NUMBER =
  ['column', 'prefix']`, made on create, never taken from the request). The header keeps `subtotal`, `tax` and
  `total`, the server's figures.
- Every scaffolded create and edit service saves them (`SavesDocumentLines`, a no-op for a module without lines):
  rules for `lines.*`, the lines saved in order after the header, the totals worked out and stored (a claimed `total`
  a cent off is a 409 with the server's totals), and, once the document's status is past `editable_status`, lines in
  an edit refused with the reason.
- The web form holds the lines in the same draft and sends them in the same save; the details page shows them read-only
  on the Overview and on a Lines tab, second.

## Open

- Barcode scanning on the web: USB scanners type into the item picker today; a camera scan on the web may follow (P64 covers the phone).
- Units of measure and pack sizes (a unit vs a case of 4): out of scope; a product adds a `unit` column if it needs one.
- Multi-currency lines: convert at entry for now; a kit-level currency field is a separate P.

## Amended by P133 (2026-11-23): how the lines read

The owner chose layout A of three prototyped (stacked table, list rows, list and detail): **a line is one unit, each column
carries two facts**: the item over its code or note, quantity × price over the excl. figure or a discount, the amount over
its VAT ("incl. VAT 18% · 2,700", "+ VAT 18% · 2,700", "no VAT"). No # column and no row of icon buttons: a click opens
the line (view, then edit or remove) and a ⋮ menu is the shortcut; read-only lists have no menu. On a narrow screen each
line folds to one stacked row with nothing cut off. Lines are never edited in the row (the owner: not at all).

