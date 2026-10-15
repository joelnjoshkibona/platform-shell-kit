# P40 · Priority columns, one row shape, one list stack

Status: **decided 2026-10-15**, explored in the reference prototype `docs/platform/p40-priority-columns.html` (kit 1.1.0 → 1.2.0).
Supersedes the table/row-cards switch in P6, P24 and P39. Builds on P5 (row opens on click, actions above the link), P22 (contextual search), P24 (toolbar, filters, URL state), P25 (Refresh), P31 (filter controls), P39 (one card, scoped lists, links).
Sources: the COBLEY row list (`FRONTEND/docs/module-patterns.md`, "avatar + primary line + meta line + right-aligned meta + chevron, no `<table>`") and the Fomu ListCard.

## Why

The P39 ListCard switches between two components at 700px of card width: a table with every column above, row cards below. Just above the cliff a seven-column table is squashed into 720px; just below it the list becomes a different thing with no header, no alignment and no column sort. The pain on tablets and small laptops is not tables, it is a **fixed column count**. COBLEY's row list avoids the cliff by never being a table, and pays for it with no vertical scanning of numbers or dates; COBLEY itself fell back to a real table for Logs and Queue.

P40 keeps one component at every width and lets the **columns** adapt: each column carries a priority, and as the card narrows the lowest-priority columns fold into the row instead of disappearing. The COBLEY row (avatar, title, badges, meta line, one number, chevron) is the fully folded state of the table, not a second layout.

## Decision

### 1. Priority columns

Every list that shows rows is one `ListCard` whose rows are a CSS grid driven by the module's column list. Each column declares:

| Field | Meaning |
|---|---|
| `key`, `label` | As today. `short` is an optional header label used when the card is tight. |
| `identity: true` | Exactly one column. The record's name or number with its avatar or icon tile. **Never folds.** Keeps at least 40% of the card's width while anything else is unfolded. |
| `hero: true` | At most one column. The record's key number (price, total, quantity). **Never folds.** Right-aligned, `tabular-nums`, with a one-word sub-label when the card is not tight. |
| `priority: n` | 1 for identity and hero (never fold). 2 and up for everything else: higher numbers fold first. |
| `fold: 'badge' \| 'meta'` | Where the column goes when it folds. `badge` for short identifiers (SKU, record number); `meta` for plain values. The `status` column is special-cased (below). |
| `min: px` | The width the column needs in the grid. The card folds columns until the sum of `min`s fits. |
| `sortable` | As today. A folded column is still sortable through the Sort control. |

**Fold order and placement**

1. The card measures its own width (container, not viewport; one `ResizeObserver`, the same the P39 container query used). It folds the unfolded column with the highest `priority` number until identity (at its 40% floor) + hero + the remaining columns + gaps fit.
2. **Status** folds to the right: a badge level with the title, with the hero number directly under it, both top-anchored. Once folded it is shown for every row, including the default state (Active), so the numbers line up across rows.
3. **Identity badges** (`fold: 'badge'`) go onto the title line after the name.
4. **Meta columns** (`fold: 'meta'`) fill the row's meta line in priority order (lowest number first), after the module's base meta, separated by `·`, while they fit on **two lines**. What does not fit is counted in a **`+N more`** chip at the end of the meta line.
5. `+N more` opens a label/value strip under the row listing the fields the meta line could not carry (two columns of `Label … value`, one column when tight). The chip sits above the row link (P5); the row click and the chevron always open the record. Expand state is page state, never URL state (P39 puts list state in the link; which rows are open is not list state).
6. **Tight**: when even identity's own `min` and the hero cannot both be met (phones), identity takes the remaining width (`minmax(0,1fr)`) and the hero shrinks to its content; row actions move under the meta line; the toolbar goes icon-only (P24); the title may wrap; the identity cell top-aligns so the icon stays level with the first line.
7. The column header shows unfolded columns only. Clicking a sortable header sorts; the Sort control lists every sortable column, folded or not.
8. Nothing inside a `ListCard` scrolls sideways. Report tables (Logs, Queue, anything that is a grid of numbers with no identity) are not `ListCard`s and may keep a real table that scrolls inside its own card.

**Removed**: the cards/table toggle in the toolbar, per-user view memory, the "phones always show cards" rule (P6) and the 700px container switch (P39). There is one mode; `density` was explored (a labelled value grid inside every row for approval queues) and dropped: 4 records per phone screen instead of 10, for every list.

### 2. One list stack

Every `ListCard`, on list pages and in details tabs, stacks in this order, at every width:

1. **Toolbar** (P24 order without the toggle): Refresh, Filters (n), Clear, Sort, `#tools` on the left; Export, Copy link, the primary create button on the right.
2. **Quick tabs**, only when the module declares them: one horizontally scrollable row of pills with counts, an edge fade, no wrapping. (P31 caps fixed sets at 10.)
3. **Search**: the list's own search field on its own row. Lists that follow the top-bar search (P22) show the search chip here instead.
4. Active-filter chips, then the optional summary strip (unchanged from P39).
5. Column header (unfolded columns).
6. Rows, or the empty state.
7. Footer: range, per-page, Previous / Next (P24).

Tabs sit above search (coarse to fine: a tab removes most of the list, a search term finds a few rows). Search and tabs **never share a row**: the P39 "share a row when they fit" rule is a second measured layout in one card and is withdrawn; a fixed row costs 36px on desktop only on lists that have tabs.

### 3. Per module (product decisions, not platform)

Which columns a list has, their `priority`, which one is the hero, the base meta line (`per piece`, the customer's name, the job type), the quick tabs and the search placeholder. The platform decides the mechanics; the module decides the content. Rule of thumb from the exploration: identity leads with what a person recognises (a worker's name, an order number), never a bare database id; the id folds to a mono badge.

## Reference prototype

`docs/platform/p40-priority-columns.html` is a self-contained page: a width slider (340–1280px), three datasets (Items, Sales orders, Worker pay), the fold readout, a "Compare with P39 cliff" toggle rendering the same width under the old rule, and a ladder at the four review widths (1280, 1024 with sidebar, 768, 390). Open it in a browser; it has no build step. The fold algorithm in its `plan()` function is the normative one; the Vue component measures the rendered meta line instead of estimating it.

```
1280  Name · SKU · Type · Category · Price · Status · Created        full table
 928  Name · SKU · Category · Price · Status  (Type, Created → meta)
 720  Name · SKU · Price · Status             (Category → meta)
 390  [icon] Name  [SKU]            [Status]   COBLEY row; status over the price
             per piece · Engine · +1 more     TZS 22,500  ›
```

## Kit changes in this pull request

- `docs/PLATFORM_DECISIONS.md`: P40 row.
- `docs/FRONTEND_RULES.md`: toolbar item 5, quick tabs, One card, Shape, Constrained-creative, review checklist.
- `docs/COMPONENTS.md` + `docs/components_api.json` + the inventory in `prototype/src/parts_shell.js`: "Table · Card list" becomes "List rows (ListRows)", List card specs and slots updated, List toolbar note.
- `docs/architecture/p_map.json`: P40 → this note.
- `prototype/src/kit.json`: 1.2.0, 40 decisions.
- `README.md`: P1–P40.

**Prototype (kit 1.2.1):** `ListRows` in `prototype/src/parts_listcard.js` (registered in `assemble.py`), ListCard reordered toolbar / tabs / search / chips, the `@container lc` rules removed from `builder.html`, and every list that shows rows converted with declared priorities: Roles, Users, Locations (tree: identity indented by depth), Location › Users, Approvals, and the design-system demos. A `success` tone (`--success`, Badge `success`) is added for settled states (paid, delivered). `tools/prototype-shots` selects rows as `[role=link]`. Products pull 1.2.1.

## Review checklist additions

- [ ] Drag the card from 1280 to 360 with the sidebar open: columns fold one at a time in priority order; nothing scrolls sideways; identity never drops below 40% until tight.
- [ ] Status folds right, above the hero, and shows on every row once folded.
- [ ] `+N more` appears only when the meta line would overflow two lines; the row and chevron still open the record.
- [ ] Toolbar · tabs · search · chips · header · rows · footer, in that order, at every width.
