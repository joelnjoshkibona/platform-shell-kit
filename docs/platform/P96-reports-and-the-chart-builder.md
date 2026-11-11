# P96 · Reports and the chart builder

Status: **decided** (kit 1.16.0); quick tabs and sorts amended by **P109** (kit 1.26.0). The owner, 2026-11-07: "Reports should be designed in a new way to enable viewing the reports either paginated or not with totals or aggregates, fixed headers or columns decided by users, summarize the reports into charts by using a chart builder and ability to download it choosing axes"; then "Highcharts, use it only. Check to ensure headers stick, columns can show totals bottom, or we can have an aggregate at the top as a toggle based on the filters chosen on that page while ignoring pagination. Exports are present too primarily: Excel, CSV, PDF, or image for charts." Proposal `docs/proposals/P94-P98.md`.

## Decision

- **A report** is a definition over a module's data: a source (the module's list endpoint, or a report service for joins and calculations), fields (label, type, whether a field can be grouped, its default aggregate) and default filters. Products ship reports; admins can add more.
- **The viewer is a list page** (`/reports/{id}`; owner, 2026-11-07, after reviewing a sample against a separate report layout): the chart builder on top, then one list card (P24, P39, P40) with the toolbar **Refresh · Filters · Sort · Group · Columns** and **Export** on the right, quick tabs, its search, the filter chips, a summary row (the row count and the totals switches), then the report table.
  - **Filters**: the list's own Filters dialog, simple and advanced, on any field of the report (P87); quick tabs for the most used field (Sales lines: payment). **Amended by P109**: the report names that field (`quick`) and its sorts (`sorts`); the viewer names none.
  - **Paged or all rows**: the "All rows" switch. Above a limit set in Settings it offers an export instead.
  - **Columns** (a dialog, like Filters): tick to show, move up or down, **pin** to the left, and choose each number column's total (sum, average, count, min, max or none).
  - **The header row, the pinned columns and the totals row stay put while the table scrolls both ways.** A test scrolls a long report down and right and checks all three.
  - **Totals, two ways:**
    - **a totals row under the table**, for the rows shown (this page, or all rows when "All rows" is on);
    - **an aggregate strip at the top**, switched on or off, over **every row the filters match, whatever page you are on**. The server computes it (`GET /reports/{id}/aggregate` with the same filters), because the browser only holds the page it shows.
  - **Group** (a dialog): no grouping, or by one field, each choice showing how many groups it makes; optionally start folded (only the subtotals). Each group row shows its count and subtotals and folds or unfolds. Grouping never hides rows; filters do. Subtotals are computed by the server too.
  - **Saved views**: the filters, columns, pins, grouping, totals and chart, saved under a name, just for me or shared, with one default.
- **Exports, a first-class part of every report:**
  - The **table** as Excel, CSV or PDF, with the view's filters, columns, order, grouping and totals. The server makes it over every matching row as a background job (P95), so a large report never freezes the page.
  - The **chart** as PNG, SVG or PDF, and its data as CSV. These are made **in the browser** by Highcharts' offline exporting (no export server).
- **The chart builder uses Highcharts and nothing else:**
  - type: column, bar, line, area, pie, scatter, or one number;
  - X axis: any groupable field, dates by day, week or month;
  - measures, each with its aggregate;
  - split by a series (stacked for column, bar and area);
  - top N with the largest first; values on or off;
  - a live preview on the report's filters;
  - saved with the view.

  Highcharts is loaded only on report pages, uses the kit's chart colours (`--c1`…`--c5`) and text colours in light and dark, and has its accessibility module on.
- **On a phone** the chart's controls stack above the chart, and the table scrolls inside its card with the header, pins and totals still fixed.

> **Watch out**: Highcharts is free only for non-commercial use. A product run for a customer needs a Highcharts licence (per developer or per product), recorded in the product's decision log before Phase 0.

## API

- `GET /reports/list`
- `GET /reports/{id}/view` (the definition and the person's views)
- `GET /reports/{id}/rows` (the list contract, paged)
- `GET /reports/{id}/aggregate` (totals over every filtered row, and per group)
- `POST /reports/{id}/run` (an export, 202 + the run, P95)
- `POST /reports/{id}/views`, `PUT /reports/{id}/views/{view}`, `DELETE /reports/{id}/views/{view}`

## Extension point

`REPORTS` in the prototype's `parts_reports.js` (a definition: id, name, module, desc, rows, fields, views, and since P109 `quick` and `sorts`); `loadHighcharts()`.
