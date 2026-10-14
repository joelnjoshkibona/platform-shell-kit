# P39 (proposed) · Scoped lists in details tabs, and linkable views

Status: **tested in DevBiz**, to be ported to the platform shell kit as a pull request (kit 1.0.0 → 1.1.0).
Builds on P22 (contextual search), P24 (list toolbar, filters/sort/page in the URL), P26 (details tabs in `?tab=`, related records open as a preview).

## Decision

A details-page tab that shows records **is the module's own list page, rendered with a scope** (`{ fieldKey: parentId }`). There is one list definition per module, used in two places: the list page and the parent's tab.

| Part | Inside a parent tab |
|---|---|
| Rows | Pre-filtered to the parent: a locked filter, never a removable chip. No extra context line: the tab label already names the list and its count. |
| Filters | The parent's field is removed. Every other filter stays (simple and advanced). |
| Columns and cards | The parent's column is hidden, and search skips it. |
| Search | The list has its own search box inside the card. The top bar keeps searching the parent module (P22). |
| Quick tabs | Kept as chips, counted within the scope. |
| Sort, paging | As on the list page. |
| Refresh | Not in the tab: the page header's Refresh covers it. |
| Create | The toolbar's primary button opens the normal form with the parent set and **locked** (shown, not editable). It is shown only when the parent allows it (e.g. no credit sale for an inactive customer). |
| Rows clicked | Open the record's preview (P26), not a page change. |
| Export | CSV of exactly the rows shown, with the parent in the file name; the parent column is dropped. |
| Copy link | Copies the address of this exact view. |

## One card (list pages and tabs)

Every list that shows rows (table or row list) is **one card**, in this order:

1. **Search + quick tabs** share a row only when they truly fit, decided by content, not breakpoints: the search grows to fill (`flex: 1 1 16rem`) with the tabs on the right; when the tabs don't fit they wrap to the next line and `justify-content: space-between` leaves that lone line on the left, while the search fills the first line. Works at any zoom or sidebar state. Pages without their own search show only the tabs, left-aligned.
2. **Filters + buttons**: Refresh (list pages only), Filters, Clear, Sort on the left; Export, Copy link and the create button on the right. Export and Copy link show as icons below extra-wide screens.
3. Active-filter chips, then an optional summary strip, then the rows and the empty state.
4. **The card picks table or cards by its own width** (CSS container query on the card, not the screen): under 700px wide it shows the row cards; from 700px the table fills the card's full width with no sideways scroll.

```
┌ 🔍 Search these payments   [All 2][Against accounts 1][At the till 1]…    ┐
│ Filters  Sort: Date ↓                       ⤓ Export  🔗 Copy link  [Take payment] │
│ (Status is any of Unpaid ×)                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ rows … / empty state                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

- On a phone: search, then tabs, then filter and sort icons left and action icons right.
- On list pages the title, banners and KPI tiles stay above the card. Search follows the top bar (P22) and shows as a chip in the card.
- Card grids (forms, media, delegations) keep the separate toolbar, because cards inside a card read badly.
- Component: `ListCard` (`list`, `tabs`, `v-model:quick`, `v-model:search` only for scoped lists, `refresh`, `placeholder`; slots `actions`, `tools`, `summary`, default). It replaces `ListToolbar` + `Tabs` + the separate table card. `ListToolbar` stays for card grids.

## Links (P24 + P26, applied to every view)

`/customers/C-0009?tab=sales&q=water&sort=-at&f[status][op]=in&f[status][value]=unpaid`

- The route, the record, `?tab=` and the active list's search, sort and filters are in the address. Back and forward work, reloads keep the view, and pasting a link opens the same view.
- A link never bypasses permissions: without access it shows No access (P3).
- Not in the link: open dialogs, drafts (P26 keeps those server-side).

## Page-level tabs

A page whose tabs show records (e.g. End-of-day count → History / Waiting) uses the same pattern: History is the full list with quick tabs; Waiting is the same list scoped to `status = waiting` (status filter and column removed).

## Kit changes for the pull request

1. `useList(o)`: new optional `o.scope()` (locked pre-filter, removes those fields) and `o.query()` (own search text); returns `scoped`.
2. New components: `ListCard` (the one-card list: tabs, actions, search, filters, sort, chips, summary, rows), `ListShare` (Export, Copy link), `LockedField` (parent value in forms). List pages that show rows move from `Tabs` + `ListToolbar` + table card onto `ListCard`.
3. URL sync: `registerUrlList(LS, q, active?)` per list (a stack: the last mounted list whose `active()` is true owns the address; a list hidden behind another tab passes `active`); page-level tabs (not only details tabs) go into `?tab=`; a tab change is a new history entry; route/record/tab/list state ↔ address (pushState on navigation, replaceState on filter changes); Copy link.
4. List pages accept `scope` + `scopeName` props; page header and KPIs render only without a scope.
5. Fomu: Form details → Responses tab and Location details → Users/Forms tabs move onto the scoped list.
6. Docs: PLATFORM_DECISIONS (P39), FRONTEND_RULES (checklist: "tabs that show records use the module list with a scope"), COMPONENTS + components_api, `kit.json` 1.1.0, screenshots.

## Tested in DevBiz

Customer → Sales, Payments (and Statement export); Product → Batches, Movements; Money account → Transactions. Locked parents in the sale form, Take a payment and Move money. Pasted links restore tab + search + filters in a fresh window; browser Back returns to the filtered tab.
