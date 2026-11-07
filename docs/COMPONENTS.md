# Fomu component library

> Generated from the prototype Design system page (specs) and components_api.json (API). Do not edit by hand; change the source and rebuild. Read with FRONTEND_RULES.md.

Use these components; never hand-roll a control that exists here. Missing one? Add it to the library first (spec + API + demo), then use it.

## Index

- **Actions**: Button
- **Forms**: Input, Select, Checkbox · Switch · Radio, Pin input (OTP), Locked field, File picker · Media library, API select, Rich text, Date picker, Accent picker
- **Display**: Badge · Status pill, Card · KPI tile, App icon and splash
- **Navigation**: Tabs, Sidebar item, Record link, Core module page, Top-bar search, Organisation switcher
- **Overlays**: DropdownMenu, Dialog · Sheet
- **Feedback**: Tooltip · Toast, Empty · Skeleton · No access, Drafts, Job progress · Job page, View as banner
- **Data**: List rows, Charts, List toolbar · Filters, List card, Report table · Chart builder, Approval steps
- **Phone**: Phone foundations, Lock screen, Session ended, Permission ask, Action sheet, Scan view, Printer picker, Freshness stamp, Bottom bar, No connection, App updates, Back key hint

## Actions

### Button

`src/components/ui/button (shadcn-vue)`

| Spec | Value |
| --- | --- |
| Heights | default 36 · sm 32 · lg 40 · icon 36×36 · icon-sm 32×32 |
| Padding | default 16px x · sm 12px x · lg 32px x |
| Font | 14px / 500 (sm: 12px) |
| Radius | rounded-md |
| Icon gap | 8px |
| Variants | default, secondary, outline, ghost, destructive, link |
| Used in | Everywhere. One primary (default) button per view. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive' \| 'link'` | `'default'` | Visual weight. One default (primary) button per area. |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon' \| 'icon-sm'` | `'default'` | icon sizes need an aria-label |
| `type` | `'button' \| 'submit'` | `'button'` | Always explicit inside a <form> |
| `disabled` | `boolean` | `false` |  |

**Emits:** `click` (MouseEvent)

**Slots:** `#default` Icon first, then text

- Do: Icon + visible text for every primary action
- Do: Cancel on the left (outline), primary on the right
- Don't: Icon-only primary actions
- Don't: Two default-variant buttons side by side
- Don't: Omit type inside a form (it submits)

## Forms

### Input

`src/components/ui/input`

| Spec | Value |
| --- | --- |
| Height | 36px (auth screens 40px) |
| Padding | 12px x, 4px y; 32px left with a leading icon |
| Font | 14px |
| Border | 1px input token, focus ring 1px ring token |
| Radius | rounded-md |
| Variants | with leading icon, with trailing button, line-input (builder titles) |
| Used in | Settings, search, sign-in, builder. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | – | v-model |
| `type` | `'text' \| 'email' \| 'tel' \| 'number' \| 'password' \| 'search'` | `'text'` | Never date/time/file |
| `id` | `string` | – | Pair with <Label for> |

**Emits:** `update:modelValue` (string)

- Do: Raw Input + Label + error <p> for plain text fields
- Do: Required = CSS asterisk on the Label
- Don't: type=date|time|file (use DatePicker, TimeField, FilePicker)

### Select

`src/components/ui/select (wrapped as Select)`

| Spec | Value |
| --- | --- |
| Trigger | 36px (sm 32px), 12px x padding, chevron 16px at 50% opacity |
| Content | portal, min-width 12rem, max-height 18rem, 4px padding, collisionPadding 8 |
| Item | 6px y · 8px left · 32px right (check) |
| Radius | rounded-md |
| Variants | default, sm, with icons, grouped |
| Used in | Question type, permissions, filters, roles. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | – | v-model |
| `options` | `{ value, label, icon?, disabled?, group? }[]` | – | Static options only; server data uses ApiSelect |
| `placeholder` | `string` | `'Select'` |  |
| `size` | `'default' \| 'sm'` | `'default'` |  |
| `align` | `'start' \| 'end'` | `'start'` | Popover alignment |
| `disabled` | `boolean` | `false` |  |

**Emits:** `update:modelValue` (value)

- Do: Portal + collision padding 8 (D9)
- Do: Size it with class (class="w-28") on its root wrapper; in a web port whose root renders no element (reka SelectRoot), add a wrapper div so class and style land, and pass other attributes to the trigger
- Don't: Native <select> or NativeSelect
- Don't: More than ~15 static options (use ApiSelect)

### Checkbox · Switch · Radio

`src/components/ui/checkbox, switch, radio-group`

| Spec | Value |
| --- | --- |
| Checkbox | 16×16, rounded-sm, 1px primary border, check 12px stroke 3 |
| Switch | 36×20 track, 16px thumb, moves 16px |
| Radio | 16×16 circle, 8px dot |
| Hit area | wrap in a label row ≥ 36px tall (44px on respondent forms) |
| Variants | checked, unchecked, indeterminate (tree parents), disabled |
| Used in | Permissions, settings, grant dialog, respondent answers. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | Checkbox/Switch v-model |
| `disabled` | `boolean` | `false` |  |

**Emits:** `update:modelValue` (boolean)

- Do: Switch for settings that apply immediately
- Do: Checkbox for choices submitted with a form
- Don't: Switch inside a form that needs Save

### Pin input (OTP)

`src/components/ui/input-otp`

| Spec | Value |
| --- | --- |
| Box | 48×48 (44 wide on phones), 18px / 600 tabular, rounded-md |
| Focus | accent border + 2px ring at 30% |
| Behaviour | auto-advance, backspace goes back, paste fills all, submit on 6th digit |
| Variants | respondent email code (form accent), admin 2FA (primary) |
| Used in | Respondent verification, two-step sign-in. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string` | – | 6 digits |
| `length` | `number` | `6` |  |

**Emits:** `complete` (string)

- Do: Paste fills all boxes
- Do: inputmode=numeric
- Don't: Store OTPs in drafts

### Locked field

`app LockedField`

| Spec | Value |
| --- | --- |
| Use | a parent value set by the page you came from (create from a scoped tab) |
| Look | muted box, value + optional sub line, lock icon; not focusable, not editable |
| Label | same label as the field it replaces |
| Variants | with sub line · without |
| Used in | Create from a details tab (DevBiz: New sale, Take payment, Receive stock, Move money) |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | `–` | Same label as the field it replaces |
| `value` | `string` | `–` | The parent's display name |
| `sub` | `string` | `–` | Optional second line (code, number) |

- Do: Show the parent a form was opened for, instead of its select
- Do: Keep it read-only; the form sends the parent id
- Don't: An editable select that happens to be prefilled
- Don't: Hiding the parent completely: people must see what the record belongs to

### File picker · Media library

`app FilePicker, MediaLibraryDialog`

| Spec | Value |
| --- | --- |
| Sources | Upload (drop, browse, paste, camera on phones) or Media library |
| Limits | types, max size and max files shown before choosing |
| Row | thumb 40px, name, type · size, progress bar 6px, Cancel / Retry + reason |
| Value | media ids; uploads land in Media at once |
| Library | searchable grid, type chips, single or multi select |
| Variants | single · multiple · image only · PDF only |
| Used in | Location photo, workspace logo, Media page |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string \| string[]` | – | media_id or ids |
| `multiple` | `boolean` | `false` |  |
| `accept` | `'any' \| 'image' \| 'pdf'` | `'any'` |  |
| `maxSize` | `number (MB)` | `10` |  |
| `maxFiles` | `number` | `5` | multiple only |
| `label` | `string` | – |  |
| `required` | `boolean` | `false` |  |
| `help` | `string` | – |  |

**Emits:** `update:modelValue` (string | string[])

- Do: Uploads go to Media first (POST /media/create)
- Do: Show limits before choosing
- Do: Per-file reason on failure
- Don't: <input type=file> outside this component
- Don't: Send File objects with the record form

### API select

`app ApiSelect + useSelectLabels store`

| Spec | Value |
| --- | --- |
| Paging | page numbers for small tables, cursor (after=) for big or busy ones; 20 per page; has_more, no totals |
| Load more | invisible marker 120px before the end triggers the next page; "Loading more…" row; Retry on failure |
| Search | from 2 letters, 300ms after typing stops; new search cancels the old request; exact → starts with → contains |
| Selected label | a) record sends { id, label, sub } · b) one batched ids[] lookup per module per tick · c) shared label store |
| Pinned | current choices first under "Selected", left out of later pages |
| Stale | archived = greyed + (archived); restricted = lock + "Restricted record"; deleted = "Deleted record"; warning under the field; never cleared silently |
| Cache | same module + filters + search reopens instantly, refreshes in the background (60s) |
| Phone | bottom sheet with Done |
| Variants | single · multiple · cursor · with labels from the record · stale values |
| Used in | Location parent and ward, invite locations, delegations, new request |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string \| string[]` | – | v-model (ids) |
| `module` | `string` | – | GET /select/{module} |
| `multiple` | `boolean` | `false` | Chips in the trigger, +N with a tooltip |
| `selectedOptions` | `{ value, label, sub?, status? }[]` | `[]` | Layer a: labels the record already carried; no lookup request |
| `exclude` | `id[]` | `[]` | exclude[] |
| `filters` | `Record<string, any>` | `{}` | filter[key]=value |
| `perPage` | `number` | `20` |  |
| `label` | `string` | – |  |
| `placeholder` | `string` | `'Select'` |  |
| `required` | `boolean` | `false` |  |
| `help` | `string` | – |  |
| `error` | `string` | – |  |
| `disabled` | `boolean` | `false` |  |

**Emits:** `update:modelValue` (id | id[]), `create` (query string)

**Slots:** `#option` Custom option row (optional)

- Do: Load the next page when the end marker scrolls into view (IntersectionObserver), with a 'Loading more…' row and Retry
- Do: Use page= for small tables and an opaque after= cursor for big or busy ones; trust has_more, never totals
- Do: Search from 2 letters, 300ms debounce; cancel the previous request
- Do: Labels: record sends { id, label, sub } → batched ids[] lookup per module per tick → shared label store
- Do: Pin current choices under 'Selected' on page 1 and exclude them from later pages
- Do: Keep archived, restricted or deleted values, flagged, with a warning under the field
- Don't: Load a whole table into a static Select
- Don't: Clear a value silently because it is no longer listed
- Don't: One lookup request per picker

### Rich text

`app RichText (Tiptap)`

| Spec | Value |
| --- | --- |
| Toolbar | B I U · H2 H3 quote · lists · link · clear; 32px buttons, sticky, scrolls on phones |
| Shortcuts | "- " list, "1. " numbered, "> " quote, "## " heading, Ctrl+K link |
| Paste | cleaned to the allowlist |
| Output | HTML, sanitised again on the server |
| Limit | counter turns red past the limit |
| Variants | with limit · without |
| Used in | Location directions, invitation footer |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string (HTML)` | – | v-model |
| `label` | `string` | – |  |
| `max` | `number` | – | Character limit with counter |
| `placeholder` | `string` | – |  |
| `required` | `boolean` | `false` |  |
| `help` | `string` | – |  |

**Emits:** `update:modelValue` (string)

- Do: Same allowlist client and server (HtmlSanitizerService)
- Do: Images only through FilePicker
- Don't: v-html of unsanitised input

### Date picker

`app DatePicker (Popover + Calendar)`

| Spec | Value |
| --- | --- |
| Trigger | looks like an input with a calendar icon and clear X |
| Header | inside the card: ‹ · Month ▾ · Year ▾ · ›; switchers swap the day grid for a 3×4 month or year grid in the same width |
| Calendar | Monday first, today bold, selected filled, 32px cells (40px in the phone modal) |
| Keys | arrows move a day/week, PageUp/PageDown a month, Enter picks, Esc backs out |
| Surface | popover 288px on desktop; bottom-sheet modal on phones |
| Footer | Today · Clear |
| Variants | single · range (two pickers) · min/max |
| Used in | Filters, schedules |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string (YYYY-MM-DD)` | – | v-model |
| `label` | `string` | – | Modal title on phones and accessible name |
| `placeholder` | `string` | `'Pick a date'` |  |
| `min` | `string (YYYY-MM-DD)` | – | Earlier days disabled |
| `max` | `string (YYYY-MM-DD)` | – | Later days disabled |
| `size` | `'default' \| 'sm'` | `'default'` |  |
| `align` | `'start' \| 'end'` | `'start'` | Desktop popover alignment |

**Emits:** `update:modelValue` (string)

- Do: Month and year switchers live inside the card, in the calendar header
- Do: Popover on desktop, bottom-sheet modal on phones
- Do: Ranges = two pickers, From and To, with min/max linking them
- Don't: <input type=date>
- Don't: Month/year selects outside the calendar card

### Accent picker

`src/components/app/AccentPicker.vue`

| Spec | Value |
| --- | --- |
| Swatches | six presets + Custom, 36px round, radiogroup; selected = 2px foreground ring + check |
| Custom | hex field (mono, #RRGGBB) with live chip + 12 suggested colours; no native colour picker |
| Derived | dark shade, button text and curtain pair come from the one colour |
| Adjusted | warning-tint note with before → after chips when the light colour had to darken |
| Preview | light and dark panels: button, link, focus ring, curtain, the six contrast ratios with their minimums |
| Variants | full (Settings) · compact (create organisation) |
| Used in | Settings › Brand colour, Create organisation |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string` | `product accent` | A preset key (teal, blue, violet, rose, amber, slate) or '#rrggbb' |
| `compact` | `boolean` | `false` | Swatches and hex field only, no preview (create organisation) |

**Emits:** `update:modelValue` (string), `change` (string)

- Do: Save the value the owner picked; the API derives and stores the tokens and returns them
- Do: Show the adjusted note whenever the light colour had to change
- Do: Keep the preview in both themes next to the picker
- Don't: Let anyone type a foreground or curtain colour: they are always derived
- Don't: Use the accent for status, chart or background colours
- Don't: Use a native colour input

## Display

### Badge · Status pill

`src/components/ui/badge + app StatusPill`

| Spec | Value |
| --- | --- |
| Badge | 12px / 600, 8px x · 2px y, rounded-md |
| Pill | 11px / 500, 8px x · 2px y, rounded-full, 6px dot |
| Colour | state colour at 15% fill, text in text token (never series colour) |
| Variants | default, secondary, outline, destructive, warning, success; StatusPill (P47) reads label and tone from the workflow lookup |
| Used in | Form status, request status, invite status, roles, violations. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'destructive' \| 'warning' \| 'success'` | `'default'` |  |
| `workflow` | `string` | – | StatusPill (P47): the workflow key, e.g. 'request', 'booking' |
| `code` | `string` | – | StatusPill (P47): the record's status code; label, Swahili and tone come from the workflow's lookup table |

**Slots:** `#default` One or two words

- Do: Status pill = dot + word; label and tone from the workflow lookup (P47)
- Do: warning token for 'approaching a limit'
- Do: Compare codes in code, show labels to people
- Don't: Colour without a word
- Don't: Raw coloured spans
- Don't: if (status.label === …): labels are editable

### Card · KPI tile

`src/components/ui/card + app KpiTile`

| Spec | Value |
| --- | --- |
| Card | rounded-xl, 1px border, card fill, shadow-sm; padding 16px (sm: 20px) |
| KPI tile | 14px padding, label 12px/500, value 24px/600 tabular, icon chip 24×24 rounded-md |
| Gap | 8px between tiles, 12px between cards |
| Motion | rise-in 420ms, stagger 60ms, count-up 700ms |
| Variants | plain, with top accent strip (4px), KPI with sparkline or meter |
| Used in | All dashboards and lists. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | – | KpiTile |
| `value` | `string \| number` | – | tabular figures |
| `icon` | `string` | – | Lucide name in a 24px chip |
| `hint` | `string` | – | One muted line, or pass a sparkline/progress in the slot |

**Slots:** `#default` Card body, `#footer` KpiTile: sparkline or progress bar

- Do: 2 columns on phones, 4 on desktop
- Do: kpi class for the rise-in stagger
- Don't: More than 4 KPIs in one strip

### App icon and splash

`AppIcon, AppSplash`

| Spec | Value |
| --- | --- |
| Icon | the product mark (BrandMark) on the default brand colour; adaptive icon, mark at 46% of the tile, corner 22% |
| Splash | the closed boot curtain: --curtain background, the mark in a 15% tile, "Loading <product>…" |
| Sizes | 512 store · 192 · 96 · 48 launcher |
| Variants | icon, splash |
| Used in | The phone app only (P55). The splash, the first frame and the web view's first paint are one picture. |

## Navigation

### Tabs

`src/components/ui/tabs (app DetailsTabs for records)`

| Spec | Value |
| --- | --- |
| Track | 36px, muted fill, 4px padding, rounded-lg |
| Trigger | 12px x, 4px y, 14px / 500, active = background + shadow |
| Count | 11px pill inside the trigger |
| Overflow | wrapper scrolls sideways on phones |
| Variants | inline, full width (phone header row) |
| Used in | Builder tabs, results sub-tabs, roles detail, status filters. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string` | – | v-model; DetailsTabs binds it to ?tab= |
| `items` | `{ value, label, count? }[]` | – |  |
| `full` | `boolean` | `false` | Stretch to full width (phones) |

**Emits:** `update:modelValue` (string)

- Do: Wrap in overflow-x-auto on phones
- Do: Quick-filter tabs sync with the Filters dialog
- Don't: Nested routes for tabs
- Don't: Curtain transition between tabs

### Sidebar item

`src/components/ui/sidebar + app SideNav`

| Spec | Value |
| --- | --- |
| Width | 240px expanded, 64px rail |
| Item | 36px tall, 10px x, 10px icon gap, icon 16px; sub-item 32px |
| Active | accent fill + 500 weight |
| Group label | 11px / 600 uppercase, 16px above |
| Variants | link, dropdown (accordion), panel (push), section, rail + flyout |
| Used in | Main navigation, configured in Menu Management. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `menus` | `Menu[] from GET /menus/list` | – | Database-driven |
| `collapsed` | `boolean` | `false` | 64px rail with flyouts |

- Do: One permission per child; parent shows if any child does (D8)
- Don't: Hard-coded menu items

### Record link

`src/components/app/RecordLink.vue`

| Spec | Value |
| --- | --- |
| Look | primary text, PanelRightOpen 13px, underline on hover |
| Click | plain: the module preview in the side sheet with View full page · modifier or middle: new tab |
| Address | a real href #/{path}/{id}; View full page keeps ?tab= and stamps ?back= |
| No permission | plain text + lock, the reason in the tooltip |
| Empty / deleted / missing | – · label struck through + Deleted · No longer exists |
| Variants | link · no permission · deleted · missing · empty |
| Used in | Location parent, approval request location; every foreign key on every page |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `module` | `ModuleKey` | – | A registered module key (defineModule); a typo fails the type check |
| `id` | `string` | – | The related record's uuid |
| `label` | `string` | `the registry's find()` | The label the API sent with the row ({ uuid, label, sub, deleted }) |
| `deleted` | `boolean` | `false` | Soft-deleted: label struck through, Deleted badge, read-only preview |
| `tab` | `string` | – | The tab View full page opens |

- Do: Use it for every value that points at another record: list cells, overview fields, child rows, activity lines (P85)
- Do: Let a modifier or middle click open the full page in a new tab
- Do: Show the reason when the person cannot open it
- Don't: Show a related record as plain text or a raw id
- Don't: Keep a hand-made map of routes for links; register the module with defineModule
- Don't: Open a summary that is not the module's own preview

### Core module page

`app DetailsPanelHeader, DetailsTabs, RelatedRecordLink, ActivityHistoryCard, DeleteRecordModal`

| Spec | Value |
| --- | --- |
| Header | breadcrumb · icon tile 44px · title 24px · code + type + status |
| Buttons | Refresh · Edit · primary action · More (⋮); delete lives in More |
| Tabs | Overview first, History last; state in ?tab= |
| Overview | icon + label + value grids in cards; Timeline card with created/updated and by whom |
| Related | link opens the target panel in a sheet with View full page |
| Delete | dependency check, then type YES |
| Variants | full page · embedded preview |
| Used in | Locations (reference), every core module |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `loading` | `boolean` | – | Header |
| `embedded` | `boolean` | `false` | Preview mode: View full page, no back |
| `tabs` | `{ key, label }[]` | – | Overview first, History last |
| `endpoint` | `string` | – | ActivityHistoryCard: /{module}/{uuid}/activity |
| `nameField` | `string` | `'name'` | DeleteRecordModal |

**Emits:** `refresh`, `update:activeTab` (string), `navigate` (RouteLocation)

**Slots:** `#icon`, `#title`, `#actions` Only Edit is promoted, `#more-menu` Delete and rare actions; menu hides when empty

- Do: Back = ?back= else list
- Do: Terminal-state banner explains missing actions
- Do: Delete = check, then type YES
- Don't: router.back()
- Don't: Raw ids for related records

### Top-bar search

`app HeaderSearch + SEARCH_SCOPE map + GET /search`

| Spec | Value |
| --- | --- |
| Box | max 384px, 36px, scope chip on the right (Forms, Users…) |
| List mode | filters the list in place; strip shows the match count + Search everywhere |
| Parent mode | details pages: top matches of the parent module |
| Global | Dashboard: groups of 5 with See all |
| Phone | icon → full-width bar; global results full screen |
| Keys | ↑ ↓ Enter Esc, Ctrl/⌘K |
| Variants | list · parent · global · phone |
| Used in | Top bar on every searchable page |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `phone` | `boolean` | `false` | Full-width bar variant |

- Do: Register each list route in SEARCH_SCOPE (mode list | parent | global)
- Do: List pages read the search from the route and report the match count
- Don't: A second search box inside a list page
- Don't: Global search outside the Dashboard (offer 'Search everywhere' instead)

### Organisation switcher

`app OrgSwitcher`

| Spec | Value |
| --- | --- |
| Trigger | avatar 32px, name 14/600, role · address 12px |
| Popover | 288px, portalled, opens right of the rail when collapsed |
| Row | avatar, name, role · form count, check or ⌥n shortcut |
| Footer | Create organisation |
| Variants | expanded · rail |
| Used in | Sidebar top |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `collapsed` | `boolean` | `false` | Rail: opens to the right |

- Do: Portalled popover (D9)
- Do: Alt+1…9 shortcuts
- Do: Switch plays the curtain and resets search
- Don't: Absolute positioning inside the sidebar

## Overlays

### DropdownMenu

`src/components/ui/dropdown-menu`

| Spec | Value |
| --- | --- |
| Content | portal, min-width 13rem, 4px padding, rounded-md, shadow-md, collisionPadding 8 |
| Item | 8px x · 6px y, 14px, icon 16px at 70% |
| Label | 14px / 600 |
| Motion | 120ms pop |
| Variants | items, checked items, destructive item, separator, label |
| Used in | Row actions (⋮), theme, user menu, create menu. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `{ id, label, icon?, destructive?, checked?, separator?, disabled? }[]` | – | App wrapper; raw shadcn parts allowed for custom content |
| `align` | `'start' \| 'end'` | `'end'` |  |
| `label` | `string` | – | Optional heading |

**Emits:** `select` (item)

**Slots:** `#trigger` The button that opens it

- Do: Portalled; never absolute inside scroll containers (D9)
- Do: Destructive items last, after a separator
- Don't: Primary actions only reachable from a menu

### Dialog · Sheet

`src/components/app-dialog (AppDialog), ui/sheet`

| Spec | Value |
| --- | --- |
| Dialog | max-width 512px, 24px padding, 16px gap, rounded-xl (bottom sheet on phones), max-height 100dvh − 2rem, scrolls |
| Overlay | black 70% |
| Sheet | right: full width → 512px; left (nav): 300px; 220ms slide |
| Footer | buttons right-aligned; stacked reversed on phones |
| Variants | confirm, form, destructive confirm; sheet right/left |
| Used in | Publish, grant access, gear popup, response detail, mobile nav. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Owned by the modal host when opened with useModal() |
| `title` | `string` | – | Required |
| `description` | `string` | – | Falls back to an sr-only copy of the title |
| `size` | `'sm' \| 'md' \| 'lg' \| '3xl'` | `'md'` |  |
| `side` | `'right' \| 'left'` | `'right'` | Sheet |

**Emits:** `update:open` (boolean)

**Slots:** `#default` Body, `#footer` Cancel left, primary right

- Do: Open with useModal().openModal(Component, props)
- Do: Bottom sheet on phones
- Do: Escape closes only the top-most dialog or sheet, and only when no popover inside it consumed the key first
- Don't: Local ref(false) + static instance
- Don't: Dialog without a title/description

## Feedback

### Tooltip · Toast

`src/components/ui/tooltip, vue-sonner`

| Spec | Value |
| --- | --- |
| Tooltip | primary fill, 12px text, 12px x · 6px y, 300ms delay, portal |
| Toast | max-width 384px, 14px padding, title 14px/500, description 12px, icon 16px, 3.4s |
| Position | toasts bottom-centre on phones, bottom-right from lg |
| Variants | default, danger (timer) |
| Used in | Icon buttons, confirmations after every action. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `content` | `string` | – | Tooltip text |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Pick a side that stays on screen |

**Slots:** `#default` Trigger

- Do: Tooltip on every icon-only button
- Do: Toast: title + optional one-line description + icon
- Don't: Essential information only in a tooltip
- Don't: Toasts for errors that need action (use inline errors)

### Empty · Skeleton · No access

`app EmptyState, ui/skeleton, app NoAccessPage`

| Spec | Value |
| --- | --- |
| Empty | dashed border, 40–56px y padding, 48px icon circle, title 18px/600, one primary action |
| Skeleton | muted/70 fill, pulse, same radius as the real element |
| No access | lock circle, names the missing permission, Request access |
| Variants | empty list, filtered empty, loading, 403 |
| Used in | New organisation, search with no results, org switching, hidden pages. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `icon` | `string` | – | size-6, muted 60% |
| `title` | `string` | – | Specific: 'No forms match.' |
| `action` | `{ label, onClick }` | – | Only when it is not already in the toolbar |

- Do: Lighter empty state inside details sub-lists (text only)
- Don't: 'No data.'
- Don't: A second New button

### Drafts

`composables/useFormDraft + app DraftBanner, DraftStatus, MyDraftsSheet`

| Spec | Value |
| --- | --- |
| Autosave | 4s after the last change, to the server |
| Footer | Saving… / Draft saved 12:41 / Unsaved changes + Save draft |
| Create | "You have 2 drafts" → picker: Resume, Delete |
| Edit | warning banner: unsaved changes from 2 hours ago · Discard · Restore |
| Never | secrets, one-shot dialogs, wizards |
| Variants | create · edit |
| Used in | New location, location details; every create/edit form |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `draft` | `FormDraft` | – | Return value of useFormDraft({ module, uuid?, getPayload, applyPayload, exclude }) |

- Do: arm() after the form is hydrated
- Do: flush() on every close that is not a save
- Do: discardOnSuccess() on save
- Do: DraftBanner at the top of the form, DraftStatus next to Cancel
- Don't: Drafts in wizards or one-shot dialogs
- Don't: Store passwords, tokens or OTPs

### Job progress · Job page

`src/components/app/JobProgress.vue, src/app/jobs/JobPage.vue`

| Spec | Value |
| --- | --- |
| Start | the button starts a job; toast "Export started · We'll let you know" |
| Progress | 8px bar with the percent; "You can leave this page" |
| Done | file card (name, rows, size, days kept) + Download + the first rows |
| Failed | plain-words summary, then one line per problem (Row 7 · …) |
| Actions | Run again on done, failed, expired; Cancel while running |
| Variants | waiting · running · done · failed · expired · cancelled |
| Used in | My exports and reports, every export, report run and import |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | `0` | Progress in percent while a job runs |
| `run` | `JobRun` | – | The run shown on the job page (params, status, result, errors) |

- Do: Start any export, report, import or big bulk action as a job and tell the person they can keep working (P95)
- Do: Show what was asked, the result with Download and the first rows, and errors in plain words
- Do: Offer Run again on done, failed and expired runs
- Don't: Block the page with a spinner while a file is built
- Don't: Download a large export in the request itself
- Don't: Show a stack trace to the person who started the job

### View as banner

`app ViewAsBanner, ViewAsDialog (person | role)`

| Spec | Value |
| --- | --- |
| Banner | warning tint, 36px, eye icon, who · role · location · read-only, Exit |
| Header | Exit view button stays visible while scrolling |
| Dialog | person list with role and primary location, start location select, audit note |
| Variants | — |
| Used in | Everywhere while viewing as |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `G.viewAs` | `{ kind: 'person' \| 'role', email, name, role, loc }` | – | Global state; 'role' uses a synthetic member that is never listed |

- Do: Two modes: a real person, or a role built from main role + custom role at a location
- Do: Roles page offers 'Preview this role'
- Do: Banner above the header + Exit view in the header
- Do: canEdit()/canManage() return false while active
- Do: Audit every session: who, what was viewed, location, duration
- Don't: Any write, email or OTP while viewing
- Don't: Show the synthetic preview member in lists, counts, pickers or approvers
- Don't: 'Act as' (signing in as someone with write access); not part of Fomu (D37)

## Data

### List rows

`app ListRows (prototype/src/parts_listcard.js) inside ListCard (P40)`

| Spec | Value |
| --- | --- |
| Grid | one CSS grid per row; identity minmax(40% of card, 1fr), other columns at their min, 16px gaps, chevron column 16px |
| Header | 12px / 500 muted, 36px tall, bottom border; unfolded columns only; sortable headers clickable |
| Row | 16px x · 8px y, min 56px, hover accent/60, whole row clickable; identity cell = 40px icon tile + title line + meta line |
| Numbers | hero right-aligned, 600, tabular; one-word sub-label when not tight |
| Folding | by the card's own width (ResizeObserver), highest priority number first: status → badge over the hero; identity badges → title line; meta → meta line (two lines) then +N more |
| Tight | identity minmax(0,1fr), hero max-content, row actions under the meta line, title wraps, identity cell top-aligned, toolbar icon-only |
| Variants | full table, partly folded, folded row, expanded (+N more strip), empty state |
| Used in | Every list that shows rows: Users, Roles, Locations, Approvals, product modules. Not Logs or Queue (report tables). |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `ListColumn[]` | – | key, label, short?, identity?, hero?, status?, priority, fold: 'badge' | 'meta', min (px), sort? (a list.sorts value), text(row), variant?(row), mono?, right?, muted?, sub?, indent?(row) for trees |
| `rows` | `array` | – | From useList() |
| `list` | `useList() object` | – | Header sort; folded columns stay sortable through the Sort control |
| `rowKey` | `(row) => string` | `r => r.id` |  |
| `baseMeta` | `(row) => string` | `() => ''` | The module's always-on meta text (unit, customer, job); folded meta columns follow it |
| `clickable` | `boolean` | `true` | false for lists with no record page (Users): no link role, no chevron |
| `rowClass` | `(row) => string` | `() => ''` | Extra classes per row (dimmed tree matches, inherited rows) |
| `actionsWidth` | `number` | `40` | Width of the #actions column, the same on every row whether or not it has actions (each row is its own grid); when tight the actions move under the meta line |
| `empty` | `string` | `'Nothing matches.'` | Empty-state line when no slot is used |

**Emits:** `open` (row)

**Slots:** `#icon` 40px tile or avatar per row (#icon="{ row }"), `#cell-<key>` Grid cell for one column; a status column's slot is reused where it folds, `#actions` Row actions above the link; under the meta line when tight

- Do: One identity column (never folds, 40% floor) and at most one hero (never folds, right-aligned, tabular)
- Do: Fold by the card's own width, highest priority number first; status folds right above the hero; identity badges fold to the title line; meta columns fill two lines then a +N more chip
- Do: Header shows unfolded columns only; header click sorts
- Do: Top-align the identity cell when the title can wrap; keep the icon level with the first line
- Do: Status columns: give them a #cell-<key> slot if they use a custom pill; it renders in the column and in the folded position
- Don't: A table/cards switch, a view toggle or per-user view memory
- Don't: Sideways scroll inside a ListCard (report tables with no identity are not ListCards)
- Don't: A column that hides without folding (every value stays reachable: meta line, strip or details)
- Don't: Expand state in the URL

### Charts

`app ChartCard + views (Bars, Donut, Columns, Rating, Stacked, Heatmap)`

| Spec | Value |
| --- | --- |
| Bars | ≤ 20px thick, 4px rounded end, square at baseline, 700ms grow, 40ms stagger |
| Palette | c1 teal, c2 amber, c3 blue, c4 rose, c5 violet; max 5 then grey "Other" (validated) |
| Text | labels and values in text tokens, never series colour |
| Hover | tooltip on every mark; table view always available |
| Variants | bars, donut, columns, 100% stacked, heatmap, rating summary, table |
| Used in | Results summary, sparklines in KPI tiles and form cards. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `view` | `'bars' \| 'donut' \| 'columns' \| 'rating' \| 'stacked' \| 'heatmap'` | – | Defaults per question type (D6) |
| `data` | `{ label, value }[]` | – |  |

**Emits:** `update:view` (string)

- Do: Palette c1–c5 then Other
- Do: Animate in once; respect reduced motion
- Don't: More than 5 coloured series
- Don't: Colour as the only label

### List toolbar · Filters

`app ListToolbar, FiltersDialog, RefreshButton + useServerTable/useListFilters/useListSort`

| Spec | Value |
| --- | --- |
| Order | Refresh · Filters (n) · Clear n · Sort … grid/list toggle (card grids only) · New |
| Bar | card, 6px padding, rounded-xl; buttons ghost sm |
| Filters | Simple = natural operator; Advanced = operator per field; one request on Apply |
| Chips | one chip per active filter + the search, each removable |
| Phone | icons with counts; dialog becomes a bottom sheet |
| Variants | with quick-filter tabs above · with layout toggle |
| Used in | Card grids: Forms (cards view), Media, Delegations (lists that show rows use List card, P39) |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `list` | `ServerTable & ListFilters & ListSort` | – | The whole composable object, not decomposed props |
| `filterFields[].type` | `'text' \| 'number' \| 'date' \| 'boolean' \| 'select' \| 'select_paginated'` | – | select = short fixed sets (≤ 10, e.g. status); select_paginated = anything that grows (locations, people, forms) and renders a multi API select with its module |

**Slots:** `#default` Right side: grid/list layout toggle for card grids only, Export/Import (only if routes exist), primary New

- Do: Order: Refresh · Filters (n) · Clear n · Sort
- Do: Filter fields come from the endpoint's filterFields
- Do: Search chip shows when the top-bar search is active
- Do: Location filters include the locations under the chosen ones by default (switch in the dialog); chips say 'and below'
- Don't: Per-page hand-rolled filter dialogs
- Don't: Export/Import buttons without backend routes
- Don't: Pill or static select filters for locations, people or forms
- Don't: A table/cards toggle: lists that show rows have one mode (P40)

### List card

`app ListCard + ListRows, ListShare + useList({ scope, query }), registerUrlList`

| Spec | Value |
| --- | --- |
| Rows | toolbar (filters, clear, sort / actions) · quick tabs (own scrollable row, only when declared) · search (own row) · chips · summary · header · rows · footer, in that order at every width (P40) |
| Card | one card for controls and rows; rounded-xl, border, shadow-sm |
| Width | one row shape; columns fold by priority as the card narrows (its own width, not the screen), see List rows (P40) |
| Search | own search box when scoped or on page-level tabs; otherwise the top bar (P22) shows as a chip |
| Scoped | parent filter, column and search removed; no Refresh (page header has it); create opens the form with the parent locked |
| Variants | list page · scoped details tab · page-level tab · with summary strip |
| Used in | Roles, Users, Approvals, Locations, Location › Users |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `list` | `useList() object` | – | The whole list object (rows, filters, sort, fields) |
| `tabs` | `{ value, label, count? }[]` | `–` | Quick tabs; counted within the scope |
| `quick` | `string` | `–` | v-model:quick — the active quick tab, kept in sync with the filters by the page |
| `search` | `string \| undefined` | `undefined` | v-model:search — pass a string for the list's own search box (scoped lists, page-level tabs); leave undefined to follow the top-bar search (P22) |
| `placeholder` | `string` | `'Search'` | Own search box placeholder |
| `refresh` | `boolean` | `true` | false inside details tabs: the page header refreshes |

**Emits:** `update:quick` (quick tab picked), `update:search` (own search typed)

**Slots:** `#actions` Right of the toolbar: ListShare (Export, Copy link), then the primary create button, `#tools` Extra ghost buttons after Sort (e.g. expand all), `#summary` Optional strip under the chips (e.g. a ledger's before / in / out / after), `#default` ListRows with the module's columns, then the empty state (P40)

- Do: Use it for every list that shows rows, on list pages and in details tabs
- Do: A details tab that shows records = the module's own list with useList({ scope: () => ({ fieldKey: parentId }) }): parent filter, column and search are removed
- Do: Create from a scoped tab opens the normal form with the parent shown as LockedField
- Do: Rows in a tab open the record's preview (P26), not a page change
- Do: Export = CSV of exactly the rows shown, parent in the file name (exportList)
- Do: Register the list with registerUrlList(LS, q, active?) so search, sort, filters and ?tab= are in the link
- Do: Stack: toolbar · quick tabs (own scrollable row, only when declared) · search (own row) · chips · summary · header · rows · footer, at every width (P40)
- Do: Quick tabs above search: coarse to fine
- Don't: A second hand-built table for a tab
- Don't: A removable chip for the parent scope
- Don't: Refresh or a context line inside a details tab
- Don't: Card grids inside the list card (forms, media, delegations keep ListToolbar)
- Don't: Search and tabs sharing a row
- Don't: A second layout for phones: the folded row is the same component

### Report table · Chart builder

`src/components/app/ReportTable.vue, ColumnsDialog.vue, GroupDialog.vue, ChartBuilder.vue, Chart.vue (inside ListCard)`

| Spec | Value |
| --- | --- |
| Page | a list page: Refresh · Filters · Sort · Group · Columns … Export; quick tabs, search, chips |
| Table | scrolls both ways in its card; header, pinned columns and totals row stay put |
| Totals | row under the table for the rows shown · strip at the top for every filtered row (server) |
| Group, Columns | dialogs like Filters: group by one field (start folded); show, order, pin, total per number column |
| Chart | Highcharts: column, bar, line, area, pie, scatter, number; X, measures, series, top N |
| Exports | table: Excel, CSV, PDF as a job · chart: PNG, SVG, PDF, data in the browser |
| Variants | paged · all rows · grouped · strip on |
| Used in | Reports |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `report` | `ReportDef` | – | The definition: fields, views |
| `view` | `ReportView` | – | Filters, columns, pins, groupBy, totals, chart |
| `rows` | `Row[]` | – | The page of rows (or all rows) |
| `aggregate` | `Record<string, number>` | – | Totals of every filtered row, from GET /reports/{id}/aggregate |

**Emits:** `update:view` (the person changed columns, pins, grouping, totals or the chart), `export` (format: xlsx · csv · pdf, starts a job (P95))

- Do: Keep the header row, pinned columns and totals row fixed while the table scrolls both ways
- Do: Take totals of every filtered row from the server
- Do: Use Highcharts only, loaded on report pages, with the kit's chart colours
- Don't: Total only the page and call it the total
- Don't: Build table exports in the browser
- Don't: Add a second chart library

### Approval steps

`app ApprovalSteps, ApprovalActions`

| Spec | Value |
| --- | --- |
| Step | 32px state circle (done teal, waiting amber, rejected red), name 14/500, rule 12px muted |
| Approvers | chips with initials + why (role at which location) |
| Escalation | amber chip when nobody holds the role at the location chain |
| Decision | tinted card: who, decision, delegated-by note, quoted comment |
| Compact | row dots, 20×6px each |
| Variants | full timeline · compact dots |
| Used in | Approvals inbox and request page |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `request` | `Request` | – | With steps, approvals and the resolved approvers |
| `compact` | `boolean` | `false` | List-row variant: dots only |

**Emits:** `approve` (comment), `reject` (reason (required))

- Do: Show who can act on the current step and why (role at which location)
- Do: Rejection needs a reason
- Do: Acting under a delegation is labelled
- Don't: Let a requester approve their own request

## Phone

### Phone foundations

`mobile/resources/spa/src/app/ (--sa-*, lifecycle, network, backstack)`

| Spec | Value |
| --- | --- |
| Width | designed at 390; checked at 360, 390, 768 and 1280. The layout is the web shell’s: the phone shows its own header and sheets below 640px |
| Header (P56) | below 640px only the menu, the title, search and the avatar; Notifications, View as and the theme live in the avatar menu, with a dot on the avatar when something is unread |
| Safe areas (P62) | one contract: --sa-top / -bottom / -left / -right = the injected inset in px, env(safe-area-inset-*) behind it. Everything fixed to an edge adds its inset: header, bottom bar, sheets, toasts |
| Keyboard (P62) | the view shrinks (100dvh); the focused field is scrolled to about 30% from the top after 300 ms; the primary action sits in a BottomBar above the keyboard |
| Layers (P61) | content 0 · header 30 · dialogs and sheets 50 · toasts 60 · action sheet 96 · back hint 100 · scan 108 · update required 110 · session ended 111 · lock 112 · curtain 120. Back closes the top one first |
| Touch | phone pieces: 48px buttons, 52px rows, 56px keypad keys. The web shell’s controls keep the sizes they are drawn at |
| Motion | short fades and rises (120 ms); nothing depends on a gesture; no pull to refresh (an explicit Refresh and the refresh on return, P58); reduced motion removes the movement |
| Variants | header · safe areas · keyboard · layers |
| Used in | Every screen on a phone. |

- Do: Add the safe-area inset to everything fixed to an edge
- Do: Use 100dvh and a BottomBar so the action rides above the keyboard
- Do: Let Back close the top layer first (layers table above)
- Do: Keep the phone header to the menu, title, search and avatar
- Don't: Hide a feature behind a gesture only
- Don't: Add pull to refresh (use Refresh and refresh on return)
- Don't: Use position: fixed for something that must clear the keyboard without a BottomBar
- Don't: Send Cache-Control request headers from the web view (CORS preflight): bust with a query parameter

### Lock screen

`src/components/app/phone-app/LockScreen.vue`

| Spec | Value |
| --- | --- |
| When | the owner turned the lock on and the app was away longer than her setting (default 5 minutes), or it was killed |
| Look | full screen over everything (layer 112): the mark in a 56px tile, "<Product> is locked", one line of help |
| Fingerprint | primary 48px button; "Use PIN instead" below it |
| PIN | 4 dots and a 3×4 keypad, 48px keys; wrong PIN shakes once and clears; five wrong PINs sign out |
| Always | Sign out as a small link at the bottom; unlocking returns to the same screen with its state |
| Sign out | clears the cart, drafts and caches of this phone (P57) |
| Variants | fingerprint · PIN |
| Used in | The whole app, when the lock is on. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `mode` | `'bio' \| 'pin'` | `'bio'` | Which way it opens; the person can switch |
| `inline` | `boolean` | `false` | Prototype/demo only: draw inside a phone mock instead of over the page |

**Emits:** `unlock`

- Do: Return to the same screen with its state after unlocking
- Do: Offer Sign out on the lock screen itself
- Do: Wipe cart, drafts and caches on sign out
- Don't: Lock while the system installer, a share sheet or a call is up (the app is only away)
- Don't: Keep the PIN anywhere but the secure store (hashed)
- Don't: Show business data behind a translucent lock

### Session ended

`src/components/app/phone-app/SessionExpired.vue`

| Spec | Value |
| --- | --- |
| When | the server answered 401: the session ended. Never for a lost signal (that is P59) |
| Look | full screen (layer 111): lock icon on a warning tint, "You were signed out", why, one 48px button |
| Promise | what was open (cart, drafts) is kept on the phone for this account and comes back after signing in |
| After | Sign in again opens the sign-in screen; the person lands where they were |
| Variants | one state |
| Used in | Any screen, when the session ends. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `inline` | `boolean` | `false` | Prototype/demo only |

**Emits:** `signin`

- Do: Show it only for a 401 (the server ended the session)
- Do: Say that what was open is kept for this account
- Don't: Show it for no signal (P51, P59) or a failed request
- Don't: Clear drafts or the cart when it appears

### Permission ask

`src/components/app/phone-app/PermissionAsk.vue (PermissionCard)`

| Spec | Value |
| --- | --- |
| When | at the moment of need (Scan asks for the camera), never at start; the reason comes first |
| Card | 48px icon circle, title, why, a muted line "Without it …" saying what still works, then Allow and Not now (48px) |
| Asked | Allow opens Android’s own prompt; the app never blocks on it and a denial never throws |
| Denied for good | warning icon, "<Thing> is off for <Product>", "Android will not ask again", Open Settings; the feature offers its fallback (type the code, share as text) |
| Kinds | camera · Bluetooth · notifications (and Install unknown apps, with the updater) |
| Variants | ask · denied for good |
| Used in | Scan, photo, printing, notifications, the updater. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `kind` | `'camera' \| 'bluetooth' \| 'notifications'` | `'camera'` | Which permission |
| `state` | `'ask' \| 'forever'` | `'ask'` | forever = Android will not ask again |

**Emits:** `allow`, `later`, `settings`

- Do: Ask at the moment of need, with the reason first
- Do: Say what still works without it
- Do: Offer the fallback (type the code, share as text)
- Don't: Ask at start
- Don't: Block the screen on the answer or throw on a denial
- Don't: Ask again in the same session after Not now

### Action sheet

`src/components/app/phone-app/ActionSheet.vue`

| Spec | Value |
| --- | --- |
| Use | the actions a phone has that a desktop does not: call, WhatsApp, SMS, copy, share |
| Look | bottom sheet, rounded top 16px, handle, title and a sub line (the number), rows 52px with a 36px icon tile, hint on the right, Cancel last (outline, 44px) |
| Behaviour | tap an action opens the other app (tel:, wa.me, sms:) and the app expects to come back (P58); Back and a tap outside close it |
| Safe area | bottom padding adds --sa-bottom |
| Where | a customer’s number anywhere it is shown, and Share on a receipt |
| Variants | call · WhatsApp · SMS · copy |
| Used in | Customers, receipts, suppliers. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | v-model:open |
| `title` | `string` | – | The person or thing (the customer’s name) |
| `sub` | `string` | – | A second line (the number) |
| `actions` | `{ id, icon, label, hint? }[]` | `[]` | Rows, in order |
| `inline` | `boolean` | `false` | Prototype/demo only |

**Emits:** `update:open` (boolean), `pick` ({ id })

- Do: Open tel:, wa.me and sms: links through the system, then expect to come back (P58)
- Do: Put Cancel last
- Do: Add --sa-bottom to the bottom padding
- Don't: More than six rows
- Don't: Put a destructive action here without confirmation

### Scan view

`src/components/app/phone-app/ScanView.vue`

| Spec | Value |
| --- | --- |
| Look | black, full screen (layer 108): close 40px round, title, light toggle; a 17rem × 9rem frame with four white corners and a primary line |
| Reading | reads by itself; a beep and a short vibration on each code; the same code twice in a second counts once |
| Several | stays open; the button says "Done · 3 scanned" |
| Always | Type the code instead (no permission, a worn label); denied camera goes to the Permission ask first |
| Back | closes the view and ends the scan; nothing is added |
| Variants | one · several |
| Used in | The till, receiving stock, counting. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `mode` | `'single' \| 'multi'` | `'single'` | multi stays open and counts |
| `count` | `number` | `0` | Codes read so far (multi) |
| `inline` | `boolean` | `false` | Prototype/demo only |

**Emits:** `close`, `type`, `done`

- Do: Ask for the camera first (Permission ask)
- Do: Always offer Type the code instead
- Do: Beep and vibrate once per code; count a repeat within a second once
- Don't: Keep the camera open in the background
- Don't: Size photos above 1280px before they cross the bridge (large base64 never arrives)

### Printer picker

`src/components/app/phone-app/PrinterPicker.vue (PrinterCard)`

| Spec | Value |
| --- | --- |
| Printers | only those paired in Android’s Bluetooth settings (no discovery); name and address; "Last used" badge |
| Choice | one radio row, 56px; Remember this printer (default on) keeps it for the next receipt |
| Actions | Test print (outline) and Use this printer (primary), 48px |
| Nothing paired | dashed empty state: "Pair it in Android’s Bluetooth settings first" and Open Bluetooth settings |
| Bluetooth off | same state, with Turn Bluetooth on |
| A failed print | says what to do (reconnect, switch the printer on) and retries once |
| Variants | list · none paired · Bluetooth off |
| Used in | Receipts, delivery notes. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `state` | `'list' \| 'none' \| 'off'` | `'list'` | list of paired printers, none paired, Bluetooth off |

**Emits:** `use` ({ id, remember }), `test`, `settings`

- Do: List only printers paired in Android
- Do: Remember the choice by default
- Do: Say what to do when it fails and retry once
- Don't: Connect to the first bonded device without asking
- Don't: Print without a connected printer

### Freshness stamp

`src/components/app/phone-app/StaleStamp.vue`

| Spec | Value |
| --- | --- |
| Fresh | a green dot and "Updated just now" after a return from the background or when the signal comes back, with Refresh |
| Offline | an amber dot and "Offline · showing data from 3 min ago": the page keeps its figures (P51 banner above it) |
| Refresh | 40px tap area; the page also refreshes by itself on return |
| Where | under the page header of pages that show figures (Home, lists) |
| Variants | fresh · offline |
| Used in | Home and list pages. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `ago` | `string` | `'just now'` | How old the data is |
| `offline` | `boolean` | `false` | Amber, "Offline · showing data from …" |

**Emits:** `refresh`

- Do: Refresh by itself on return from the background
- Do: Keep the figures on screen when offline
- Don't: Show empty lists or zero totals when a request got no answer (P51)

### Bottom bar

`src/components/app/phone-app/BottomBar.vue`

| Spec | Value |
| --- | --- |
| Use | the primary action of a form or a cart: it stays on screen above the keyboard and the gesture bar |
| Look | sticky at the bottom, top border, blurred background, optional one-line note (the total), padding adds --sa-bottom |
| Buttons | 48px; Cancel left (outline), primary right (one primary) |
| Keyboard | the view shrinks, so the bar rides above the keyboard; it never hides the focused field |
| Variants | with a note · without |
| Used in | The till cart, forms. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `note` | `string` | – | One line above the buttons (the total) |

**Slots:** `#default` The buttons: Cancel left, primary right

- Do: One primary 48px button
- Do: Add --sa-bottom to the padding
- Don't: Use position: fixed (it would not ride above the keyboard)
- Don't: Two primary buttons

### No connection

`src/components/app/states/ConnectionNotice.vue`

| Spec | Value |
| --- | --- |
| Page | a page that never got an answer: wifi-off icon in a 48px circle, "No connection", help, Try again; the page opens by itself when the signal is back |
| Banner | a page that had loaded: a muted note above its figures, "What you see may be out of date, and nothing can be saved until it is back", Try again |
| Source | the phone’s network state and any request that got no answer; a 401 or a 500 is not this |
| With it | the freshness stamp says how old the figures are; reads retry on return, writes are not queued |
| Variants | page · banner |
| Used in | Every page, in the app. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'page' \| 'banner'` | `'page'` | page = never loaded; banner = loaded, figures kept |

- Do: Drive it from the phone’s network state and calls that got no answer
- Do: Keep a loaded page’s figures on screen
- Don't: Show it for a 401 or a 500
- Don't: Queue writes behind it

### App updates

`src/components/app/phone-app/AppUpdateBanner.vue, AppUpdateRequired.vue`

| Spec | Value |
| --- | --- |
| Banner | below latest: a primary-tinted note above the page, "A new version of <Product> is ready", Later (hides it until the next version) and Update |
| Required | below minimum: full screen (layer 110), the mark in a 56px tile, "Update <Product> to keep going", one 48px Update now, both versions; nothing else is reachable and Back does nothing |
| Compare | the installed integer version code from the package; the server’s latest and minimum; never a cached answer (?_= and no-store) |
| Update | opens the download page; a resumable, SHA-256 checked download installs over the old app and keeps the session |
| Variants | banner · required |
| Used in | Home, any screen when required. |

- Do: Compare the installed integer version code
- Do: Ask with a fresh query; the server says no-store
- Don't: Let Back leave the required screen
- Don't: Trust a cached /app/version answer

### Back key hint

`src/components/app/phone-app/AppBackHint.vue`

| Spec | Value |
| --- | --- |
| Where | first screen: no layer open, no history behind, nothing above it in the module |
| Look | a dark pill, "Press back again to leave", 24px above the bottom, layer 100, for 2 seconds |
| Second press | inside 2 seconds sends the app to the background (not a kill) |
| Order | scan view, action sheet, dialog or sheet, menu or sidebar, picker, history, then this; forced screens swallow Back |
| Variants | one state |
| Used in | The first screen of the app. |

- Do: Close the top layer before showing it
- Don't: Show it on a forced screen
