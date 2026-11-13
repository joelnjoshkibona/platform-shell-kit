# P115 · Documents with lines

Status: **decided** (kit 1.30.0). Proposed by a product with sales and stock documents, tested in its copy of the prototype (the line
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

**Constrained-creative**: which columns a kind shows; the limit hint under an item (`ordered 4 · 1 delivered`); KPI tiles on the Overview.

**Free**: the document's own banners and cards (a fiscal receipt, a sent-to-customer log).

## Components

`DocLines`, `DocFlow` and `DocTrail` are in the library (`docs/COMPONENTS.md`, `docs/components_api.json`, the Design system page, which
demos a sale draft, a stock draft with lots and a read-only list on an example catalogue). The kit names no product record: items, prices
and lots come from props (`itemOf`, `priceOf`, `lotsOf`) and the item picker is an ApiSelect module the product registers (`itemModule`).
`currency` labels the totals and the price field; empty shows numbers only.

## API side (Bootbox)

- `BaseService` gains a lines helper: the header and its lines saved in one transaction; lines left out are soft-deleted, lines with a
  `uuid` updated, new ones added; rollups (totals, received, delivered, paid) run after the save inside the same transaction.
- A line's `item_id` uses `exists_in_org`; quantities and prices are decimals validated per kind; per-line 422 errors are keyed by the
  line's client id so `DocLines` can show them on the line.
- Numbering (`OF-2026-0001`) from `DocumentNumberService` with a counter row per series, never a text sort.

## Open

- Barcode scanning on the web: USB scanners type into the item picker today; a camera scan on the web may follow (P64 covers the phone).
- Units of measure and pack sizes (a unit vs a case of 4): out of scope; a product adds a `unit` column if it needs one.
- Multi-currency lines: convert at entry for now; a kit-level currency field is a separate P.
