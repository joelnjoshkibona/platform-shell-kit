# Fomu frontend rules

> Source of truth for every Fomu screen. In this repository this file is authoritative; the prototype's Rules tab is a snapshot of it. Change a rule only through a new decision (D#) in `docs/architecture/erd_data.py`, in the same PR. Decision numbers point to the ERD decision log.

Every Fomu screen is built against these rules. Cobley's frontend code is discarded; its backend and behaviour rules are kept. Where the two disagree on look, the Fomu prototype wins (D27).

## How to use these rules

- **Locked**: every module matches exactly. These are correctness fixes or consistency a user would notice. No exceptions without a new decision (D#).
- **Constrained-creative**: pick from an established shape; never invent a new one.
- **Free**: per-module judgement, no standard imposed.
- When unsure which tier applies, choose Locked for anything a user would see as inconsistent between modules, and Free for anything about a module's own data.
- The prototype's Design system page is the visual source of truth (D17). These rules are the behaviour source of truth.

## Locked: component library

- `COMPONENTS.md` (generated) lists every component with its specs, props, emits, slots and do/don't. Build screens only from it.
- A control that is not in the library is added to it first: spec and demo on the prototype's Design system page, API in `components_api.json`, then rebuild. Never hand-roll a one-off version inside a page.
- A component's props/emits contract is frozen once another module uses it; extend it, don't change it.

## Locked: app shell

**Navigation**

- Sidebar opened by a hamburger with the word "Menu" under it. On phones it opens as a sheet from the left.
- Menus come from the database (`menus` table). Display modes: dropdown (always accordion), panel, section. Animation follows the mode unless the menu overrides it (D14, D16).
- One permission per child menu. A parent shows if any child shows; an empty parent is hidden (D8).
- Organisation switcher and location context sit at the top of the sidebar. Switching plays the curtain and reloads every list.

**Permissions**

- Names are `Module.action`: `list`, `view`, `create`, `edit`, `delete`, plus module verbs such as `Forms.publish`, `Responses.export`, `Users.impersonate` (D28).
- Menus are gated by `Module.list`. Every route and endpoint behind a menu checks the same permission; a hidden menu reached by URL shows the No access page with a Request access button (D12).
- Buttons the user cannot use are hidden, not disabled, unless the reason helps them (then a tooltip says why).
- Effective permission at a location = main role + custom roles here and above + granted − denied; deny wins (D21).

**Top bar (P43)**

- Menu · title on the left; the module search when the page has one; the actions (View as, theme, notifications, account) always at the right edge, on every page. The title truncates first.

**Settings (P42)**

- One page of tabs, `?tab=` in the link: General first, the product's tabs (`SETTINGS_TABS`) in their order, then Notifications and Security last. A product tab is one component of cards; it can need a permission and can ask for the wide (1000px) layout.
- One lock banner and one read-only fieldset for people who cannot manage settings. Fields save as they change. The tab strip wraps from 640px and scrolls in its own row on phones.

**Recent activity (P45)**

- Current organisation only; a location page shows its subtree; View as narrows it; session actions appear at once; an empty feed says so.

**Demo clock (P44)**

- Prototype dates come from `TODAY` (a weekday, Mon 12 Oct 2026). Never hard-code today's date in a part.

**Search (D29, D30)**

- The top-bar box follows the page. In a module it searches that module only and filters the list in place through the module's `search` filter, kept in the URL.
- Its last line is always "Search everywhere for ...".
- On a details page it searches the parent module and shows a small dropdown; Enter opens the filtered list.
- On pages with nothing to search the box is hidden.
- On the Dashboard it is global: results grouped by module, top 5 each, each group ending in "See all in X".
- Phones: a search icon expands into a full-width bar with Cancel. Dashboard results open full screen with recent searches.

**Refresh (D32)**

- Every viewable page has Refresh: lists, details, results, dashboard. Tooltip: "Updated 2 min ago".
- Refresh keeps current content on screen, dimmed (`opacity-60`, `pointer-events-none`), until new data arrives. Only a first load with nothing on screen shows a spinner.

**Modals and overlays**

- Every dialog opens through the shared modal host (`useModal().openModal(...)`), never a local `ref(false)`.
- Menus, selects, popovers and tooltips are portalled to `<body>`, fixed-positioned, 8px from screen edges, and flip to stay on screen. Never `absolute` inside a scrolling or overflow-hidden container (D9).
- Every dialog and sheet has a title and a screen-reader description.
- Footer order: Cancel on the left (`outline`), primary on the right. Destructive actions use the `destructive` variant.
- On phones dialogs rise from the bottom; sheets fill the width.

**Page transitions (D13)**

- The curtain plays on first load and on every page change, sidebar included; not between sign-in steps or between tabs inside a page.
- Loader text appears only after 300ms. Skipped under `prefers-reduced-motion`.
- Curtain colours: bright teal in light mode, deep green in dark mode.

**View as (D24, D37)**

- Two read-only modes from the top-bar eye: **a person** (their exact main role, location roles and overrides) or **a role** (main role + optional custom role at a location, no real person). The Roles page also offers "Preview this role".
- A banner shows who or what is being viewed. Everything is read-only, nothing is sent, and every session is written to the audit log.
- The synthetic role-preview member never appears in lists, counts, pickers or approver lists.
- There is no "Act as" (signing in as someone with write access).

## Locked: lists

**Toolbar (D31)**, left to right:

1. Refresh (spinner while loading)
2. Filters, with the active count: `Filters (2)`
3. Clear 2 (only when filters are active)
4. Sort: `Name ↑`
5. Right side: Export / Import only when the backend has those routes, then the primary New button. There is no cards/table toggle (P40).

- Every primary action has an icon and visible text on desktop. On phones the toolbar shows icons with counts, and the New button keeps its text.
- Quick-filter tabs (status) sit under the toolbar on their own scrollable row, above the search field (P40), and stay in sync with the Filters dialog.

**One card, one stack (P39, P40).** Every list that shows rows, on list pages and in details tabs, is one `ListCard`, stacked in this order at every width:

1. Toolbar: Refresh (list pages only), Filters, Clear, Sort and `#tools` on the left; Export, Copy link and the primary create button on the right. Export and Copy link are icon-only below extra-wide screens.
2. Quick tabs, only when the module declares them: one horizontally scrollable row of pills with counts and an edge fade. Never wrapped, never on the search row.
3. Search on its own row: the list's own field, or the top-bar search chip for lists that follow the top bar (P22).
4. Active-filter chips, then an optional summary strip.
5. Column header (unfolded columns only), rows or the empty state, footer.

**Priority columns (P40).** The rows are a grid driven by the module's column list; the card measures its own width (never the viewport) and folds columns instead of switching layouts:

- One `identity` column (name or number with its icon tile) never folds and keeps at least 40% of the card while anything else is unfolded. At most one `hero` number never folds: right-aligned, `tabular-nums`, one-word sub-label when there is room.
- Every other column has a `priority` (2 and up) and a `fold` target. The highest number folds first, until identity + hero + the rest fit with no sideways scroll.
- Status folds right: a badge level with the title, the hero number directly under it, both top-anchored. Once folded it shows on every row, including the default state, so the numbers line up.
- Identity badges (SKU, record number; `fold: 'badge'`) fold onto the title line. Meta columns (`fold: 'meta'`) fill the row's meta line after the module's base meta, in priority order, while they fit on two lines; the rest is a `+N more` chip that opens a label/value strip under the row. The chip sits above the row link; the row and the chevron always open the record. Which rows are open is page state, not link state.
- Tight (identity's own minimum and the hero cannot both be met): identity takes what is left, the hero shrinks to its content, row actions move under the meta line, the toolbar goes icon-only, the title may wrap and the identity cell top-aligns so the icon stays level with the first line.
- Header click sorts an unfolded column; the Sort control lists every sortable column, folded or not.
- Report tables with no identity (Logs, Queue) are not `ListCard`s and may scroll inside their own card. Card grids (forms in cards view, media, delegations) keep the separate `ListToolbar`: cards inside a card read badly.
- The reference is `docs/platform/p40-priority-columns.html`; check a list by dragging the card from 1280 to 360 with the sidebar open.

**Filters dialog**

- Fields come from the list endpoint's `filterFields`; the page declares none of its own.
- Simple mode (default): each field uses its natural operator — text contains, select is any of, number/date/boolean equals.
- Advanced switch: an operator picker per field (between, greater/less than, begins/ends with, is empty, is not empty).
- Select filters are multi-select by default. A between with one side empty blocks Apply.
- Field type decides the control (D38): `select` (pills) only for short fixed sets of 10 or fewer, such as status; anything that grows (locations, people, forms, wards) is `select_paginated` and renders a multi API select for its module. Location filters include the locations under the chosen ones by default, with a switch to turn it off; the chip says "and below".
- Apply sends one request and returns to page 1. On phones the dialog is a bottom sheet.

**State and loading**

- Page, per-page, sort and filters live in the URL (`?page=2&sort=name&f[status][operator]=in...`), so any view can be bookmarked or shared and survives a reload. Other query params such as `?tab=` are kept.
- First load with no rows: a centred spinner. Every later fetch keeps rows visible and dimmed.
- Footer: `1–10 of 84`, per-page picker, Previous / Next.

**Shape (prototype wins, D27)**

- One row shape at every width: the table at the top of the range and the folded row (icon tile, title, badges, meta line, status over the hero, chevron) at the bottom are the same component (P40). No cards/table choice, nothing remembered per user.
- A row opens on click with a stretched link; its actions menu and the `+N more` chip sit above it (`relative z-10`) (D10).
- Empty list: centred icon (`size-6`, muted 60%), one specific line ("No forms match."), and Clear filters when filters are active. Never a second New button.
- No horizontal page scroll at 360px, and no sideways scroll inside a `ListCard`: columns fold (P40). Only report tables with no identity column scroll inside their own card.

## Locked: details pages

**Header**

- Breadcrumb, then icon tile (or avatar for a person), title, code and status badge on one line, meta under it.
- Header buttons, row 1: Refresh, and View full page when shown as a preview. Row 2: the record's actions. Only Edit is promoted to a visible button; delete and rare actions live in the More menu, which hides itself when empty.
- One exception: a module may promote its single defining action beside Edit (Add child on a location, Preview this role on a role). Everything else stays in More (D39).
- Back returns to `?back=` if present, else to the module list. Never browser history.
- Terminal states (closed, cancelled, voided, archived) show a banner explaining why actions are gone and that the record is read-only.

**Tabs**

- Tabs live in `?tab=`, never nested routes, so a tab switch does not refetch the header.
- Tabs switch without the page curtain (D13). On phones the tab strip scrolls sideways.
- Every module has Overview first and History (activity) last. Which tabs sit between is Free.

**Overview**

- Cards of icon + label + value fields. Same field shape gets the same icon everywhere: `Hash` for codes and references, `AlignLeft` for notes, `FileText` for descriptions, `CalendarRange` for a validity window shown as `from → to`.
- A Timeline card (Created, Created by, Updated, Updated by) and both halves of the audit pair are always shown when the API returns them.
- A field that points at another record is a related-record link, never plain text or a raw id.

**Related-record preview**

- A related-record link opens the target module's own details panel in a side sheet (not a summary), with a View full page button that carries the active tab and stamps `?back=`.

**Activity**

- History tab = the shared activity card fed by `/{module}/{uuid}/activity`, paginated, with its own loading state.

**Delete**

- Delete first calls the backend's delete check, which lists what depends on the record.
- A real delete needs the user to type YES before the button enables. Soft-deleted records show a restore banner.

**Roles (D39)**

- Roles is a list + details module like every other. Never a master-detail split view.
- List rows: icon tile (Crown locked, Shield main, ShieldPlus custom), name + description, Main/Custom badge, permission coverage bar with `n/total`, visible menus, holder avatars.
- Details tabs: Overview, Permissions, Menus, People, History. Permission and menu ticks save on change; read-only users see the same screen with disabled controls and a one-line reason.
- Main roles: name fixed, never deleted. Custom roles: created from the list (optionally copying another role once), renamed in Edit, deleted only when nobody holds them.

**Staged edits and leaving (D42)**

- Editors that change many switches at once (role permissions, menus) stage changes. A sticky bar at the bottom shows the diff (+n / −n), who it affects, Discard and Save.
- Leaving a page with staged changes asks Stay / Discard and leave / Save and leave. The guard covers every in-app navigation and the browser's close/reload prompt.


**Tabs that show records (P39)**

- The tab is the module's own list with a scope (`useList({ scope: () => ({ fieldKey: parentId }) })`); never a second hand-built table.
- Rows are locked to the parent (no removable chip); the parent's filter field, column and search are removed; quick tabs count within the scope.
- The tab has its own search box in the card; the top bar keeps searching the parent module (P22). No Refresh and no context line in the tab.
- Rows open the record's preview (P26). Export downloads exactly the rows shown, with the parent in the file name and without the parent column.
- The create button opens the normal form with the parent shown read-only (`LockedField`), only when the parent allows it.
- Page-level tabs that show records (e.g. History / Waiting) follow the same pattern: Waiting is the same list scoped to its status.
- The tab, search, sort and filters are in the link (`?tab=users&q=…&f[from][op]=in…`); a tab change is a new history entry, a filter change is not.
## Locked: forms and fields

**Fields**

- Label above, help text under, error under that in `text-xs text-destructive`. No error summary box at the top.
- Required: a CSS asterisk on the label (`after:content-['*']`), never a literal `*` in the text.
- One field per row; pair two only when short and related (code + unit).
- No native pickers, anywhere: no `<select>`, `<input type=file>`, `type=date|time`. Use Select, API select, Date picker, Time, File picker.
- Create and edit share one form modal. Edit seeds itself from the record before it is shown.

**Drafts (D33)**

- Every create and edit form autosaves to the server every 4 seconds of idle time, so work survives a closed tab and resumes on another device.
- The dialog footer shows the state next to Cancel: `Saving…`, `Draft saved 12:41`, or `Couldn't save draft` (announced once).
- Create: several drafts per form; a banner "You have 2 drafts" opens a picker to resume or delete one.
- Edit: one draft per record; a banner "You have unsaved changes from 2 hours ago" with Discard and Restore. Autosave pauses until the banner is answered.
- Closing saves the draft; a successful save deletes it; a failed save keeps it.
- A form changed back to how it started drops its draft.
- Never stored: passwords, tokens, OTPs. Files are stored as media ids (see File picker).
- Never in action wizards or one-shot dialogs.
- "My drafts" in the user menu lists every draft across modules, newest first, with Resume and Delete.

**File picker**

- One component for single and multiple files. Two sources: Upload (drag and drop, browse, paste an image) and Media library (search and pick existing files).
- Limits are shown before choosing: allowed types, max size, max files.
- Each file shows a thumbnail or type icon, name, size, a progress bar, Cancel while uploading, Retry and the reason on failure.
- Uploads go to the Media module immediately and the field holds `media_id`s. Unattached media older than 24 hours is cleaned by a scheduled job.
- Existing files show with View, Download and Remove. Images open in a preview.
- Phones: Upload offers Camera and Files; the library opens full screen.

**API select (D36)**

- Backed by `GET /select/{module}?search=&page=|after=&per_page=20&filter[k]=v&exclude[]=&ids[]=` → `{ data, selected, meta: { has_more, next_cursor? } }`.
- Paging is mixed: `page=` for small tables, an opaque `after=` cursor for big or busy ones (wards, items, respondents). The module declares which. The client trusts `has_more`; no totals.
- The next page loads when an end marker scrolls into view (120px early), with a "Loading more…" row and Retry if it fails.
- Search from 2 letters, 300ms after typing stops. A new search cancels the previous request. Results rank exact, then starts-with, then contains.
- Selected labels come from three layers: (a) view endpoints return every foreign key as `{ id, label, sub }` and the form passes it as `selected-options`; (b) anything still missing goes into one batched `ids[]` lookup per module per tick, across every picker on the page; (c) every label lands in a shared label store.
- Current choices are pinned under "Selected" on page 1 and excluded from later pages.
- A chosen value that is archived shows greyed with "(archived)"; one the user cannot see shows a lock and "Restricted record"; a deleted one shows "Deleted record". A warning sits under the field. Values are never cleared silently.
- Results for the same module, filters and search are cached for 60 seconds: reopening shows them at once and refreshes in the background.
- Desktop opens a popover with the search focused; phones open a bottom sheet. Footer "Create new …" when the user has `Module.create`.

**Rich text (WYSIWYG)**

- Tiptap (Vue 3, headless) styled with our tokens.
- Toolbar: paragraph/H2/H3, bold, italic, underline, link, bulleted and numbered list, quote, clear formatting; image only through the File picker.
- Markdown shortcuts work (`**`, `-`, `1.`, `>`). Paste is cleaned to the same allowlist.
- Output is HTML, sanitised again on the server with the same allowlist (`HtmlSanitizerService`).
- Character count when the field has a limit. On phones the toolbar scrolls sideways and sticks above the keyboard.

**Action wizards**

- `Stepper` inside a dialog. Footer: Cancel, Back, Next, then the real action on the last step.
- The last step is a read-only review with a confirmation checkbox that gates the action.
- A validation error jumps back to the step that owns the field. No drafts.

## Locked: approvals (D25, D34)

- Any action can be put behind an approval workflow. The UI checks for an active workflow before doing the action and offers "Request to …" instead.
- Steps run in order; each step lists who may approve (custom role at the request's location or above, main role, permission or person), Any or All, and how many approvals it needs.
- Approvers are resolved at the request's location chain. If nobody qualifies, the step escalates to owners and admins and says so.
- The request page always shows, for the current step, who can act and why ("Branch supervisor at Arusha Branch").
- A requester never approves their own request. A rejection needs a reason; an approval comment is optional.
- Acting under a delegation is labelled on the decision ("by Hamisi, delegated") and on the request page.
- Approved, rejected and cancelled requests show a banner explaining the outcome and that the request is read-only.
- The editor previews who each step would go to at a chosen location and warns when fewer people qualify than the step needs.
- Capacity rule (D40): a step needing 2+ approvals needs required + 1 people who can approve; the editor shows an inline error, Save stays disabled and the workflow can't be switched on. Existing failing workflows show a "Can't be met" badge; a short step adds the Owner, and an Owner completes a step that already has every approval it can get.
- Gated actions (D41): when a workflow applies, the action button opens "This needs approval" (subject, route preview, note) instead of running. Labels change to say so ("Request another attempt"), menus show a disabled "Needs approval first" row, and an open request for the same subject shows its number instead of a second request.
- Notifications (D43): the workflow editor has a Notifications block (channel chips, in-app locked on; event switches; reminder every N hours up to M). Each step can override channels and mark them required. The request page has a Notifications tab: one row per person and event with a chip per channel, crossed out with the reason when skipped. People manage their own email/SMS/push in Notification settings (user menu); in-app can't be turned off.
- Email and quiet hours (D44): approval emails link to the request; nobody decides from an email. SMS and push inside the org's quiet hours (Settings, default 20:00–07:00 EAT) show as held (amber chip with the release time); required steps ignore quiet hours.

## Locked: visual

shadcn-vue components and Tailwind with semantic tokens only; never a raw hex or grey class in a component. Values come from the prototype's Design system page (D17).

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--primary`, `--ring`, `--primary-foreground` | the organisation's accent (product default: teal `174 72% 26%`) | derived (teal `170 62% 46%`) | Primary buttons, links, focus, active controls. Set by `applyAccent` from the organisation's brand colour (P41, P46), never by hand |
| Neutrals | zinc scale | zinc scale | Background, cards, borders, muted text |
| `--warning` / `--destructive` | semantic | semantic | Approaching a limit / errors and danger |
| Chart c1–c5 | #14937f #d06d0a #2f6fe0 #d6456a #7c5ad8 | #1f9e89 #c97514 #4c82e8 #dc5577 #8f73e3 | Charts only, max 5 series then Other (#94a3b8 / #64748b) |
| `--curtain`, `--curtain-fg` | derived from the accent (teal: `170 62% 46%`, dark text) | derived (teal: `166 58% 13%`, light text) | Page transition only; at least 6:1 |
| Form accent | per form | per form | A form's own brand colour, tenant-overridable |

- **Brand colour (P46)**: the organisation picks a preset or any hex; everything else is derived and checked (button text ≥ 4.5:1, primary vs page ≥ 3:1, curtain ≥ 6:1, both themes). Nothing but primary, ring, the curtain and the org badge follows it: never status, chart, background or border colours. Components never read the accent value; they use `primary` (or `.acc-chip` + `accChip()` for another organisation's colour, e.g. the switcher).
- **Product identity (P48)**: name, mark (`BrandMark`), sign-in headline, points and art come from the product config only; the shell never hard-codes a product's icon, words or picture. The mark is a 24×24 SVG in `currentColor`.
- **Back (P49)**: every record page starts its breadcrumb with `BackButton`: to the screen the person came from (record, tab and list view kept), else the record's list. Never only the browser's back.
- **Row actions (P50)**: on tight rows (phones) a row's actions sit where the chevron was, level with the title; never a line of their own.
- **Type**: Geist. Page title `text-xl font-semibold` (`text-2xl` from `sm`), body `text-sm`, meta `text-xs`, group labels `text-[11px]` uppercase semibold, KPI numbers `text-2xl` with tabular figures, codes and permission names in mono `text-xs`.
- **Spacing**: `gap-4` between sections and fields, `p-4` card padding (`p-3.5` for KPI tiles), `gap-1.5` inside a label/input/error stack, `gap-2` between inline items.
- **Radius**: `rounded-md` controls, `rounded-lg` dialogs and popovers, `rounded-xl` cards, `rounded-full` pills and avatars.
- **Icons**: Lucide, `size-4` next to text, `size-6` for empty states. Same field shape, same icon everywhere.
- **Status**: short badges or pills with a dot; colour never carries meaning alone (always a word).
- **Workflow status (P47)**: a pill reads its label and tone from the workflow's lookup table (`StatusPill workflow="request" :code="r.status"`). Code, filters, quick tabs and sort compare the `code`, never the label; tone is one of muted, info, wait, warn, live, ok, bad, off and maps to tokens (`ok` = `--success`, `wait`/`warn` = `--warning`, `bad` = `--destructive`, `live` pulses). Quick tabs, filter options and lane order follow the table's `sort_order`. An unknown code shows as a muted pill with the raw code.
- **Motion**: cards rise in with a 40–60ms stagger, sparklines draw in, bars grow from the left; 150–250ms for UI transitions. Everything decorative stops under `prefers-reduced-motion`.
- **Dark mode**: every screen is checked in light and dark before merging. Theme choice: Light, Dark, System.
- **Responsive**: built and checked at 360, 390, 768, 1280px. Grid children get `min-w-0`; no horizontal page scroll; tap targets at least 40px on phones; safe-area insets respected.
- **i18n**: every user-facing string goes through `t()`, with English and Swahili keys added together.

## Constrained-creative and Free

**Constrained-creative** (pick an existing shape):

- List rows (P40): which columns a list has, their priorities, which column is the identity and which is the hero, the base meta line, the quick tabs and the search placeholder are per module; the fold mechanics and the column look are fixed. Identity leads with what a person recognises (a name, a document number), never a bare id; the id folds to a mono badge.
- Details header title: a name, a code or a document number, whichever identifies the record; a person always gets an avatar with initials.
- Overview cards: field grid inside a card; grouping and card names per module (Information, Amounts, Rule, Timeline).
- KPI strip: 2 columns on phones, 4 on desktop; each tile = label, icon chip, number, one line of context or a sparkline/progress bar.
- Charts: the views in the chart catalogue (bars, donut, columns, rating, stacked, heatmap) with the shared palette.

**Free**:

- Which tabs a details page has between Overview and History.
- Domain visualisations a module's data calls for (the location tree, a permission editor, a timer pill).
- Empty-state wording and illustrations within the empty-state shape.

## Backend contract the frontend relies on

| Need | Endpoint / shape | Note |
| --- | --- | --- |
| Lists | `GET /{module}/list` with `filters`, `params{page,per_page,sort,order}` → `data, meta, filterFields` | Every module declares a `search` filter field (D29) |
| Pickers | `GET /select/{module}?search=&page=\|after=&per_page=&filter[k]=&exclude[]=&ids[]=` → `data, selected, meta{has_more,next_cursor}` | min 2 characters; `ids[]` resolves labels incl. archived/restricted/deleted (D36) |
| Global search | `GET /search?q=` → groups of top 5 per searchable module | New; permission- and location-scoped (D30) |
| Details | `GET /{module}/{uuid}/view`, `/activity` | Every foreign key comes back as `{ id, label, sub }` for pickers (D36) |
| Delete | `GET /{module}/{uuid}/delete/check`, then `DELETE /{module}/{uuid}/delete` | Check lists dependants |
| Drafts | `POST /drafts/save`, `GET /drafts/find`, `/drafts/for-context`, `/drafts`, `DELETE /drafts/{uuid}` | Keyed by module, form type, record key |
| Media | `POST /media/create`, `GET /media/list`, `/media/{uuid}/info`, `/download` | Download needs the bearer token, so fetch as a blob |
| Location context | `X-Location-Id` header + `location_filter` param | Header checks permission; param narrows data |
| Booleans in FormData | `1` / `0` | Never `true` / `false` strings |

- Services validate before touching a model; only validated keys reach `create`/`update`.
- Permissions are checked by middleware with the same name the menu uses.

## Review checklist before merging a screen

- [ ] Checked at 360px and 1280px, light and dark; no horizontal page scroll
- [ ] Zero console errors and zero console warnings (e2e asserts it)
- [ ] Every menu, select, popover and tooltip is portalled and stays on screen
- [ ] Toolbar order is Refresh, Filters, Clear, Sort, then Export / Copy link / New; no cards/table toggle; Refresh keeps content visible
- [ ] Filters, sort, page and tab are in the URL and survive a reload
- [ ] Lists that show rows are one ListCard stacked toolbar · tabs · search · chips · header · rows · footer; columns fold by priority as the card narrows (dragged from 1280 to 360 with the sidebar open): identity and hero never fold, status folds right above the hero, `+N more` only when the meta line would overflow two lines, nothing scrolls sideways
- [ ] Tabs that show records use the module list with a scope (parent filter/column/search removed, own search, Export, Copy link, create with the parent locked)
- [ ] Top-bar search filters this module; "Search everywhere" works; top-bar actions sit at the right edge with or without search
- [ ] Activity, KPIs and lists show only the current organisation after a switch
- [ ] Create/edit form has drafts (or is listed as an exception with a reason)
- [ ] No native pickers; required asterisks are CSS; errors sit under fields
- [ ] Buttons and menus respect permissions; a direct URL without permission shows No access
- [ ] Delete uses the delete check and the YES gate
- [ ] Status pills come from the workflow lookup (P47); no code compares a label; filters and quick tabs follow the table's order
- [ ] Strings in English and Swahili
- [ ] Built only from components in `COMPONENTS.md`; new ones added to the library first
- [ ] Rule changes copied to the doc, `FRONTEND_RULES.md` and the Rules tab
