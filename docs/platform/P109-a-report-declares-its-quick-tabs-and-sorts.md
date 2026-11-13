# P109 · A report declares its quick tabs and sorts

Status: **decided** (kit 1.26.0). Amends P96. Proposed by a product (kit 1.25.0), tested in its copy of `parts_reports.js` and ported here with P107–P112.

## Why

P96 makes `REPORTS` the extension point: a product adds its reports there. But the report page itself hard-coded the kit's demo "Sales lines" report:

- its **quick tabs** read the demo's `pay` field (Cash, M-Pesa, Card, Credit, from the demo's `RP_PAY` list);
- its **sorts** were fixed to `date`, `total` and `qty`.

Once a product removes the demo reports (as it should), the quick tabs break, and a report whose rows have no `total` or `qty` offers sorts that do nothing. A product's reports group by status, officer and key account type.

## Decision

- **A report names its quick-tab field**: `REPORTS[i].quick = 'status'`. The tabs are "All" plus that field's values (sorted), with counts. `quick: { key, values }` fixes the values and their order. With no `quick`, the report has no quick tabs.
- **A report lists its sorts**: `REPORTS[i].sorts = [{ value, label, get(row) }]`. With none, the sorts are its fields of type `date`, `money` and `number`, in field order.
- **The report page names no demo field.** The kit's demo reports declare `quick: { key: 'pay', values: RP_PAY }` and their three sorts, so they look the same.
- In the app, `quick` and `sorts` are part of the report's definition (P96's API: the definition the viewer is built from); the sorts' keys are the list contract's allowlisted sorts (P87).

## Extension point

`REPORTS` in `parts_reports.js` (P96): new keys `quick` and `sorts`. `G.reports` is the same list, for product code outside the shell module.

## Tests (kit check)

- A report with `quick` shows tabs for that field's values, with counts; a report without it shows none.
- A report's declared sorts are the ones offered; without them, its date and number fields are.
- The report page's code (`ReportsPage`, `ReportPage`) contains no `pay` or `RP_PAY`.

`tools/prototype-shots/decisions.test.js` runs the first two in the browser; `tools/kit-check.py` checks the last.
