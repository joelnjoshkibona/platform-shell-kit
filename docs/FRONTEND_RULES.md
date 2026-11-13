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
- The product may replace the ring and mark with its own loader (P114, `PRODUCT.loader`): `page` on page changes, `boot` on the first load and the phone splash. One colour (`currentColor`, cut-outs in `var(--cut)`), motion as CSS inside the SVG, still under reduced motion. Never in buttons or inline saves.

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
- On a tight card, when the widest title on the page does not fit beside the widest status or hero, every row stacks: title (and badges), then status and hero on a line under it, then the meta line; no right-hand column, and the header shows only the identity's heading (P112, amends P40).
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

**Related-record links (P85, amends P39)**

- Every value that points at another record (list cell, overview field, child row, activity line) is a `RecordLink module id`, never plain text or a raw id.
- It is a real link to the full page (`#/{path}/{id}`): a plain click opens the record's details page in the record dialog (P101), on Overview or the link's `tab` (P111, amends P85); a module with no `page` opens its own preview in the side sheet with View full page (keeps `?tab=`, stamps `?back=`); a modifier or middle click opens a new tab. The link's icon is PanelTop ("Open …"); PanelRightOpen ("Preview …") only for the sheet.
- The target comes from the module registry (`defineModule`, P81), never from a hand-kept map.
- Without the module's permission it is plain text with a lock and the reason; empty is "–"; a deleted record keeps its label struck through with Deleted and previews read-only; a missing one says "No longer exists".

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
- What an approved or rejected request does belongs to its action (P107): `ACTIONS[action].apply(req)` / `.reject(req)`, set by the module from its own code. The approvals engine never names a product's records; in the app the module's approval handler does the work on the server.
- The gate is given the record's owning location and an optional note: `approvalGate(action, { kind, id, label, meta?, loc, note? }, run)`, `approvalNeeded(action, loc)` (P108). The route is chosen at that location; the engine never looks the record up in a module's table. New request picks the record from the action's `pick` source.
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
- **Row actions (P50)**: on tight rows (phones) a row's actions sit where the chevron was, level with the title, while the identity keeps 140px; otherwise (a labelled button, buttons beside a hero) they keep a line under the meta line.
- **No connection (P51)**: a page with no answer shows `ConnectionNotice variant="page"`, never empty lists or zero totals; a loaded page keeps its figures under `variant="banner"`. Recovery is automatic; nothing is queued.
- **Phone app (P51–P70)**: see "Locked: the phone app" below; its pieces are the Phone section of `COMPONENTS.md`.
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

## Locked: the phone app (P51–P70)

The phone app is the web shell inside a product's Android app (NativePHP web view). A phone is a device that moves; every movement has one rule (`docs/mobile/PHONE_MODEL.md`). Components: the **Phone** section of `COMPONENTS.md`.

- **Header (P56)**: below 640px only the menu, the title, search and the avatar. Notifications, View as and the theme are in the avatar menu; a dot on the avatar means unread.
- **Boot and session (P57)**: keep the stored session; validate it only with a network; no network opens read-only on the last data. A 401 shows Session ended; a lost signal never does. The token is in secure storage and no secret ships in the web bundle. Sign out wipes the cart, drafts and caches of that phone.
- **Lifecycle (P58)**: to the background: stop polls, save the cart and the open form; to the foreground: refresh what is on screen, recheck the session, the update and the network, show "Updated just now"; killed: reopen where they were with the cart back. Coming back from the system (installer, Settings, share, call) re-reads state; never a timer.
- **Connectivity (P51, P59)**: the phone's network state and failed calls drive No connection; a loaded page keeps its figures with how old they are; every request has a timeout; reads retry, writes are never retried by the app.
- **Uncertain writes (P60)**: never replay a write automatically; disable the action while it runs; money and stock writes carry an Idempotency-Key; after an uncertain failure keep the form and say "Check recent <records> before you try again."
- **Back (P52, P61)**: close the top layer in order (scan, action sheet, dialog or sheet, menu or sidebar, picker), then history, then press twice on the first screen; on a forced screen Back does nothing; auth redirects replace.
- **Safe areas and keyboard (P62)**: `--sa-*` from the injected inset with `env()` behind; everything fixed to an edge adds its inset; the view shrinks with the keyboard (`100dvh`); the focused field scrolls to about 30% from the top after 300 ms; the primary action sits in a BottomBar.
- **Permissions (P54, P63)**: ask at the moment of need, reason first, say what still works without it; never block on the answer; denied for good offers Open Settings and the fallback.
- **Phone actions (P64)**: phone numbers open the Action sheet (Call, WhatsApp, SMS, Copy); Scan always offers Type the code; printing uses a remembered, chosen Bluetooth printer.
- **Lock (P65)**: an organisation setting, off by default; locks after time away and after a kill; fingerprint, then PIN; the system in front for our request is not "away".
- **Notifications and links (P66)**: register after sign-in, re-register on rotation, unregister before sign-out; a tap opens the record.
- **Updates (P53, P67)**: compare the installed integer version code; never read a cached answer; resumable, verified download; the forced screen cannot be left.
- **Releases (P68)**: signing key outside the repo and the app; channels with their own id, name and badge; version code read from the APK; plugins shared, never forked.
- **Debugging and tests (P69, P70)**: web debugging off in release builds; a checklist per movement; a harness that drives a real web view.
- Sizes: phone pieces use 48px buttons, 52px rows, 56px keys; the web shell's own controls keep the sizes they are drawn at.

## Locked: modules and code structure (P80–P90)

Guide: `docs/architecture/MODULES.md`.

- **A module owns its files (P80)**: `api/app/Modules/{Tier}/{Group}/{Module}/`, `web/src/modules/{module}/` and, for the modules the phone shows, `mobile/resources/spa/src/modules/{module}/`. Each app's `src/` has `app/`, `components/`, `modules/`.
- **The phone app is its own app (P93)**: crafted for a phone in Hodie's shape (`mobile/` with its own Laravel for the phone's work and its own interface in `resources/spa/`); it shares only `packages/shared` with the web app, never screens, components or layouts. Nothing about a module lives outside its folder; file names say what they do.
- **One manifest, found by glob (P81, P82)**: `module.json` on the API, `defineModule()` in `module.ts` on web and phone. No central registry, menu file or picker trait. Adding a module is adding a folder.
- **One service per operation, container instances (P83)**: `{Module}{Op}Service`, `execute → validateData → process`; models take only validated data plus server fields.
- **Actions declared once (P84)**: service + route + `{Module}.{action}` + button placement + form type in one manifest entry.
- **A product registry (P110)**: the product's permission catalogue, role defaults and detail pages are declared once (`web/src/product/registry.ts`; the prototype's `parts_product.js`) and loaded before the shell; the shell's files name no product route, permission or role.
- **Related records are links (P85)** and **child tabs are the child's scoped list (P86)**.
- **List contract (P87)** and **API shape (P88)**: see the backend contract below.
- **Strict TypeScript (P89)**; **every convention has a test (P90)**.

## Locked: the phone app's data modes (P102)

- Phone screens read and write through the data layer (`list / view / save / delete / action`) only; they never call the API or the local Laravel directly, so the mode can change without touching a screen.
- Sync mode: every change has a key; a 409 shows mine and theirs and keeps mine as a draft; refused changes are listed with why; signing out with changes waiting asks first.
- On-the-phone mode has backups instead of a server; no signal bar.

## Locked: forms with settings and AppDialog (P100)

- Open a form with `openForm(module, ctx)`, never by building a one-off dialog. Prefill, lock, hide and disable come from the context; the server checks the context and rejects a changed locked or hidden field (422).
- A form never draws its own buttons: it gives them to its host with `useDialogFooter`, so it works in a dialog and as a page.
- Closing a changed form saves its draft at once; if that fails the form stays open. Never close a changed form without a draft or the person's explicit "Close without saving".
- Save as draft (a record with the status Draft) is a workflow button, not the autosaved draft.

## Locked: batch mode (P99)

- No tick boxes until the person turns batch mode on (Batch, or a long press on a phone). Lists with bulk actions use `useBatch`; never add tick boxes by hand.
- "All N that match" sends the filter, not the ids. Changing the filters or search clears the ticks.
- Up to 100 rows run at once with a done/skipped result; more, or all that match, run as a background job. Destructive actions confirm; deletes need YES.

## Locked: tabs and record dialogs (P101)

- To show another record (on Overview) or one of its tabs without leaving the page, use `RecordLink` (with `tab` for a tab, P111), or `openRecordTab(module, id, tab)`. Never copy the tab's content into another module.
- Every module with a details page declares its `tabs` and its `page` in `defineModule`; the page draws one tab when given `embedId`.
- Dialogs go through AppDialog only (`openDialog`): they stack, each at its own size; the footer has Close on the left; there is no × and clicking outside does nothing; Esc and Back close the top one.
- Tabs move with ← → Home End, scroll with a More menu when they don't fit, and a link to a hidden tab falls back to the first with a toast.

## Locked: the user guide (P98)

- Every task a person does on a screen has an article in `docs/help/articles/`, and the screen is in its `screens:` so How do I… offers it.
- Pictures are never drawn by hand: write the shot spec and run `tools/help/build.js`. A marker points at a selector a person would recognise (a label, an aria-label), not at a position.
- Changing a screen changes its articles in the same pull request (or the commit says `Help: no change` and why).
- Give every control a name (text or aria-label): the guide, tests and screen readers all find it by that name.

## Locked: reports (P96)

- A report is a list page: the toolbar is Refresh, Filters, Sort, Group, Columns, then Export; Group and Columns open dialogs like Filters; quick tabs, search and chips as on every list.
- A report names its own quick-tab field (`quick`) and its sorts (`sorts`); without them it has no quick tabs and sorts by its date and number fields (P109). The report page never names a report's field.
- A report table may scroll both ways inside its card; its header row, pinned columns and totals row always stay put.
- The totals row is for the rows shown; the aggregate strip (a switch) is for every row the filters match, computed by the server.
- Charts are Highcharts only, loaded on report pages, in the kit's chart colours; chart pictures and data are made in the browser; table exports run as background jobs.

## Locked: background work (P95)

- Anything that may take more than a few seconds (export, report, import, big bulk action) starts a job: the button says "We'll let you know when it is ready" and never blocks the page.
- When it ends, a notification opens its job page: what was asked, progress, the result (Download, the first rows, rows, days kept), errors in plain words, Run again, Cancel.
- My exports and reports (avatar menu) lists the person's runs; Queue lists everyone's.

## Locked: system screens (P97)

- Logs, Queue, Scheduled tasks, Trash, Notifications and Permissions are core screens built as in the prototype (`parts_system.js`): list pages with details sheets, tabs in `?tab=`.
- Nothing personal is written to a log (no passwords, tokens or form answers); activity entries link to their records.
- Destructive actions (delete a job, delete for good, empty trash) use the delete check and the YES gate.
- Announcements live in Notifications (no separate Broadcasts module).

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
| List filters (P87) | `filters[field] = { operator, value }`; operators `eq neq in nin gt gte lt lte between contains begins ends null not_null`; allowlisted fields and sorts; `per_page` ≤ 100; `paginate=false` | A person's filter on a field replaces that field's default filter |
| Sync (P102) | `GET /sync/changes?since=&modules=` → `{ changes, cursor, has_more }`; `POST /sync/push { changes: [{ key, module, op, id, record, version }] }` → per change `done` · `conflict` (+ the server's record) · `refused` (+ reason) | Keys make a repeat harmless; permissions are checked per change |
| Form context (P100) | `GET /{module}/create/splash?prefill…&lock…&hide…&disable…` → the fields with locked, hidden and disabled flags, or 403 for a context the person may not use; `POST /{module}/create` → 422 when a locked or hidden field differs | The context is checked twice: when the form opens and when it saves |
| Actions (P84, P99) | `POST /{module}/{uuid}/{action}`; `POST /{module}/bulk-action { action, mode: ids, ids[] }` or `{ action, mode: filter, filters }` → `{ done, skipped: [{ uuid, label, reason }] }` or 202 with a job run | Gated by `{Module}.{action}` (and `{Module}.bulkAction`); each row checked, failures skipped with a reason |
| Child lists (P86) | `GET /{parent}/{uuid}/{child}/list` and the child's create, edit, delete under the same prefix | Scoped by the server, gated by the child's permissions |
| Related records (P85) | `{ uuid, label, sub, deleted }` | One eager load per list, soft-deleted included |
| Reports (P96) | `GET /reports/{id}/rows` (the list contract), `/aggregate` (every filtered row, and per group), `POST /reports/{id}/run` (export job), `/views` | Totals of every filtered row come from `/aggregate`, never from the page |
| Background work (P95) | `POST /{module}/export` → 202 + the run; `GET /job-runs/list`, `/job-runs/{uuid}/view`, `/download`; `POST /job-runs/{uuid}/rerun`, `/cancel` | The run carries params, status, progress, result, rows, errors, expires_at |
| Responses (P88) | Body `code` equals the HTTP status; 422 `errors: { field: [messages] }`; writes send `version`, a stale one gets 409 with the current record | API types generated for web and phone |

- Services validate before touching a model; only validated keys (plus server fields the service sets) reach `create`/`update` (P83).
- Permissions are checked by middleware with the same name the menu uses.

## Review checklist before merging a screen

- [ ] The module lives in its own folder with its manifest; no central file was edited to add it (P80–P82); its permissions, role defaults and detail pages are in the product registry (P110)
- [ ] Every related record is a `RecordLink` from the registry; checked without the permission, deleted and missing (P85); a plain click opens the record dialog, so the module declares `page` (P111)
- [ ] The implementation plan, the progress tracker and the build guide are updated in the same change (P91–P92)
- [ ] Checked at 360px and 1280px, light and dark; no horizontal page scroll
- [ ] Zero console errors and zero console warnings (e2e asserts it)
- [ ] Every menu, select, popover and tooltip is portalled and stays on screen
- [ ] Toolbar order is Refresh, Filters, Clear, Sort, then Export / Copy link / New; no cards/table toggle; Refresh keeps content visible
- [ ] Filters, sort, page and tab are in the URL and survive a reload
- [ ] Lists that show rows are one ListCard stacked toolbar · tabs · search · chips · header · rows · footer; columns fold by priority as the card narrows (dragged from 1280 to 360 with the sidebar open): identity and hero never fold, status folds right above the hero (under the title when the titles would not fit beside it, P112), `+N more` only when the meta line would overflow two lines, nothing scrolls sideways
- [ ] Tabs that show records use the module list with a scope (parent filter/column/search removed, own search, Export, Copy link, create with the parent locked)
- [ ] Top-bar search filters this module; "Search everywhere" works; top-bar actions sit at the right edge with or without search
- [ ] Activity, KPIs and lists show only the current organisation after a switch
- [ ] Create/edit form has drafts (or is listed as an exception with a reason)
- [ ] No native pickers; required asterisks are CSS; errors sit under fields
- [ ] Buttons and menus respect permissions; a direct URL without permission shows No access
- [ ] Delete uses the delete check and the YES gate
- [ ] A gated action's effect is its own `apply` / `reject` (P107) and its gate is given the record's `loc` (P108); the approvals engine was not edited
- [ ] Status pills come from the workflow lookup (P47); no code compares a label; filters and quick tabs follow the table's order
- [ ] Phone app: checked at 360, 390 and 411px, light and dark, with the keyboard open and with the system back gesture; every fixed element adds its safe-area inset
- [ ] Phone app: each movement in `PHONE_MODEL.md` has been tried (cold start, resume, kill, signal lost and back, 401, lock, permission asked and denied, back, keyboard, update) and nothing is lost or doubled
- [ ] Strings in English and Swahili
- [ ] Built only from components in `COMPONENTS.md`; new ones added to the library first
- [ ] Rule changes copied to the doc, `FRONTEND_RULES.md` and the Rules tab
