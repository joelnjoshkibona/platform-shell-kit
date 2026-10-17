# Fomu component library

> Generated from the prototype Design system page (specs) and components_api.json (API). Do not edit by hand; change the source and rebuild. Read with FRONTEND_RULES.md.

Use these components; never hand-roll a control that exists here. Missing one? Add it to the library first (spec + API + demo), then use it.

## Index

- **Actions**: Button
- **Forms**: Input, Select, Checkbox · Switch · Radio, Pin input (OTP), Locked field, File picker · Media library, API select, Rich text, Date picker, Accent picker
- **Display**: Badge · Status pill, Card · KPI tile
- **Navigation**: Tabs, Sidebar item, Core module page, Top-bar search, Organisation switcher
- **Overlays**: DropdownMenu, Dialog · Sheet
- **Feedback**: Tooltip · Toast, Empty · Skeleton · No access, Drafts, View as banner
- **Data**: List rows, Charts, List toolbar · Filters, List card, Approval steps

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
| Variants | default, secondary, outline, destructive, warning; Live/Draft/Closed/Archived pills |
| Used in | Form status, invite status, roles, violations. |

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'secondary' \| 'outline' \| 'destructive' \| 'warning' \| 'success'` | `'default'` |  |
| `status` | `string` | – | StatusPill: key into the module's status map (label, dot, class) in lib.ts |

**Slots:** `#default` One or two words

- Do: Status pill = dot + word; map lives in the module lib.ts
- Do: warning token for 'approaching a limit'
- Don't: Colour without a word
- Don't: Raw coloured spans

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
