# Core screens (platform)

Every screen in the prototype, where it lives in the real app, what gates it, and which phase builds it. Screenshots are in `screenshots/` (`{name}__{desktop|phone}-{light|dark}.png`); the full list with titles is `index.json`. Open `prototype/index.html` in a browser to click through everything (the bottom-left **Screens** pill jumps between screens; it is prototype-only).

> App paths are the agreed shape: path-based tenant (`/{org}`), tabs in `?tab=`, never nested routes for tabs (FRONTEND_RULES → Details pages). Filters, sort, page and tab live in the URL.

## Screen map

| Screen | App path | Prototype component | Permission | Phase (Fomu) |
| --- | --- | --- | --- | --- |
| Sign in | `/login` | AuthView (parts_shell.js) | `—` | 1 |
| Two-step verification | `/login/2fa` | AuthView | `—` | 1 |
| Choose organisation | `/orgs` | AuthView | `—` | 1 |
| Dashboard | `/{org}` | DashboardPage (parts_list.js) | `— (home)` | 1 |
| Users | `/{org}/users` | MembersPage | `Users.list` | 2 |
| Roles list | `/{org}/roles` | RolesPage (parts_shell.js) | `Roles.list` | 2 |
| Role details (Editor) | `/{org}/roles/{id}?tab=` | RolePage | `Roles.list (edit: Roles.manage)` | 2 |
| Locations list | `/{org}/locations` | LocationsPage (parts_loc.js) | `Locations.list` | 2 |
| Location details (Arusha) | `/{org}/locations/{uuid}?tab=` | LocationPage | `Locations.list (edit: Locations.manage, assign: Locations.assign)` | 2 |
| Approvals inbox | `/{org}/approvals` | ApprovalsPage (parts_appr.js) | `Requests.list` | 6 |
| Approval workflows | `/{org}/approval-workflows` | RequestTypesPage | `RequestTypes.list` | 6 |
| Delegations | `/{org}/delegations` | DelegationsPage | `Delegations.list` | 6 |
| Media library | `/{org}/media` | MediaPage (parts_comp.js) | `Media.list` | 2 |
| Settings | `/{org}/settings` | WorkspacePage (parts_shell.js) | `Settings.manage` | 2 |
| Menu management | `/{org}/menus` | MenusPage (parts_shell.js) | `Menus.manage` | 2 |
| Design system (tokens, components, rules) | `/design (dev builds only)` | DesignPage (parts_shell.js) | `—` | 0 |

## Core screens (platform) and their states

### Sign in  ·  `/login`

Email, phone or username + password. Show/hide password, remember device, errors under fields.

- **Sign in** — [desktop-light](screenshots/login__desktop-light.png), [desktop-dark](screenshots/login__desktop-dark.png), [phone-light](screenshots/login__phone-light.png), [phone-dark](screenshots/login__phone-dark.png)

### Two-step verification  ·  `/login/2fa`

TOTP 6-digit code boxes; "Trust this device for 30 days"; recovery code link.

- **Two-step verification** — [desktop-light](screenshots/twofa__desktop-light.png), [desktop-dark](screenshots/twofa__desktop-dark.png), [phone-light](screenshots/twofa__phone-light.png), [phone-dark](screenshots/twofa__phone-dark.png)

### Choose organisation  ·  `/orgs`

Choose organisation after sign-in; shows role per org; create organisation.

- **Choose organisation** — [desktop-light](screenshots/orgpick__desktop-light.png), [desktop-dark](screenshots/orgpick__desktop-dark.png), [phone-light](screenshots/orgpick__phone-light.png), [phone-dark](screenshots/orgpick__phone-dark.png)

### Dashboard  ·  `/{org}`

KPI strip, charts, recent activity. Top-bar search is GLOBAL here (D30).

- **Dashboard** — [desktop-light](screenshots/dashboard__desktop-light.png), [desktop-dark](screenshots/dashboard__desktop-dark.png), [phone-light](screenshots/dashboard__phone-light.png), [phone-dark](screenshots/dashboard__phone-dark.png)
- **Global search results** — [desktop-light](screenshots/dashboard--global-search__desktop-light.png), [phone-dark](screenshots/dashboard--global-search__phone-dark.png)

### Users  ·  `/{org}/users`

Users list, invite dialog (main role + locations), direct grants (amber tags), View as.

- **Users** — [desktop-light](screenshots/members__desktop-light.png), [desktop-dark](screenshots/members__desktop-dark.png), [phone-light](screenshots/members__phone-light.png), [phone-dark](screenshots/members__phone-dark.png)

### Roles list  ·  `/{org}/roles`

List page (D39): KPIs, All/Main/Custom tabs, toolbar, coverage bar, holders.

- **Roles list** — [desktop-light](screenshots/roles__desktop-light.png), [desktop-dark](screenshots/roles__desktop-dark.png), [phone-light](screenshots/roles__phone-light.png), [phone-dark](screenshots/roles__phone-dark.png)
- **Role details overview** — [desktop-light](screenshots/roles--zone-manager-overview__desktop-light.png), [phone-dark](screenshots/roles--zone-manager-overview__phone-dark.png)

### Role details (Editor)  ·  `/{org}/roles/{id}?tab=`

Overview / Permissions / Menus / People / History; staged edits + save bar + leave guard (D42); Preview this role (D37).

- **Role details (Editor)** — [desktop-light](screenshots/role__desktop-light.png), [desktop-dark](screenshots/role__desktop-dark.png), [phone-light](screenshots/role__phone-light.png), [phone-dark](screenshots/role__phone-dark.png)
- **Role details overview** — [desktop-light](screenshots/roles--zone-manager-overview__desktop-light.png), [phone-dark](screenshots/roles--zone-manager-overview__phone-dark.png)
- **Staged permission edits + save bar (D42)** — [desktop-light](screenshots/role--save-bar__desktop-light.png), [phone-dark](screenshots/role--save-bar__phone-dark.png)
- **Leave without saving dialog** — [desktop-light](screenshots/role--leave-guard__desktop-light.png), [phone-dark](screenshots/role--leave-guard__phone-dark.png)

### Locations list  ·  `/{org}/locations`

Tree table with expand/collapse, filters incl. API-select location filter with "and below" (D38).

- **Locations list** — [desktop-light](screenshots/locations__desktop-light.png), [desktop-dark](screenshots/locations__desktop-dark.png), [phone-light](screenshots/locations__phone-light.png), [phone-dark](screenshots/locations__phone-dark.png)

### Location details (Arusha)  ·  `/{org}/locations/{uuid}?tab=`

Overview / Details / Users / Forms / History; drafts on edit (D33); delete check + YES gate. The Users tab is a scoped list card (P39): own search, All / Here / From above, filters, sort, Export, Copy link, Assign person; its view is in the link (`?tab=users&q=…&f[from][op]=in…`).

- **Location details (Arusha)** — [desktop-light](screenshots/location__desktop-light.png), [desktop-dark](screenshots/location__desktop-dark.png), [phone-light](screenshots/location__phone-light.png), [phone-dark](screenshots/location__phone-dark.png)
- **Location users tab** — [desktop-light](screenshots/location--users__desktop-light.png), [phone-dark](screenshots/location--users__phone-dark.png)
- **Location users tab, scoped list card (P39)** — [desktop-light](screenshots/location--users-scoped__desktop-light.png), [phone-dark](screenshots/location--users-scoped__phone-dark.png)
- **Location details tab** — [desktop-light](screenshots/location--details__desktop-light.png), [phone-dark](screenshots/location--details__phone-dark.png)

### Approvals inbox  ·  `/{org}/approvals`

Inbox: Waiting for me / My requests / All (or My locations).

- **Approvals inbox** — [desktop-light](screenshots/approvals__desktop-light.png), [desktop-dark](screenshots/approvals__desktop-dark.png), [phone-light](screenshots/approvals__phone-light.png), [phone-dark](screenshots/approvals__phone-dark.png)
- **Request details (two-step publish)** — [desktop-light](screenshots/request--details__desktop-light.png), [desktop-dark](screenshots/request--details__desktop-dark.png), [phone-light](screenshots/request--details__phone-light.png), [phone-dark](screenshots/request--details__phone-dark.png)
- **Request notifications tab (D43)** — [desktop-light](screenshots/request--notifications__desktop-light.png), [phone-dark](screenshots/request--notifications__phone-dark.png)
- **Short step, Owner completes (D40)** — [desktop-light](screenshots/request--short-step__desktop-light.png), [phone-dark](screenshots/request--short-step__phone-dark.png)

### Approval workflows  ·  `/{org}/approval-workflows`

Workflow cards + editor sheet: steps, approvers, capacity rule (D40), notifications (D43).

- **Approval workflows** — [desktop-light](screenshots/request-types__desktop-light.png), [desktop-dark](screenshots/request-types__desktop-dark.png), [phone-light](screenshots/request-types__phone-light.png), [phone-dark](screenshots/request-types__phone-dark.png)
- **Workflow editor with notifications + capacity error (D40, D43)** — [desktop-light](screenshots/request-types--editor__desktop-light.png), [phone-dark](screenshots/request-types--editor__phone-dark.png)

### Delegations  ·  `/{org}/delegations`

Delegate approvals for a date range, optionally per workflow.

- **Delegations** — [desktop-light](screenshots/delegations__desktop-light.png), [desktop-dark](screenshots/delegations__desktop-dark.png), [phone-light](screenshots/delegations__phone-light.png), [phone-dark](screenshots/delegations__phone-dark.png)

### Media library  ·  `/{org}/media`

Media library; the same library opens from the FilePicker.

- **Media library** — [desktop-light](screenshots/media__desktop-light.png), [desktop-dark](screenshots/media__desktop-dark.png), [phone-light](screenshots/media__phone-light.png), [phone-dark](screenshots/media__phone-dark.png)

### Settings  ·  `/{org}/settings`

Org identity, security (2FA, timeout), quiet hours (D44), chart view defaults.

- **Settings** — [desktop-light](screenshots/workspace__desktop-light.png), [desktop-dark](screenshots/workspace__desktop-dark.png), [phone-light](screenshots/workspace__phone-light.png), [phone-dark](screenshots/workspace__phone-dark.png)

### Menu management  ·  `/{org}/menus`

Information-only parent/child tree, drag to reorder, gear opens settings popup (display mode, animation).

- **Menu management** — [desktop-light](screenshots/menus__desktop-light.png), [desktop-dark](screenshots/menus__desktop-dark.png), [phone-light](screenshots/menus__phone-light.png), [phone-dark](screenshots/menus__phone-dark.png)

### Design system (tokens, components, rules)  ·  `/design (dev builds only)`

Tokens, type, components inventory, layout rules. Build it in web/ as the living style guide and parity check.

- **Design system (tokens, components, rules)** — [desktop-light](screenshots/design__desktop-light.png), [desktop-dark](screenshots/design__desktop-dark.png), [phone-light](screenshots/design__phone-light.png), [phone-dark](screenshots/design__phone-dark.png)

### Shared overlays

- **Personal notification settings (D43)** — [desktop-light](screenshots/user-menu--notification-settings__desktop-light.png), [phone-dark](screenshots/user-menu--notification-settings__phone-dark.png)

## In the menu but not designed

These menu items exist (with permissions) but the prototype shows a placeholder. Build them in Phase 7 with the standard list + details pattern from `FRONTEND_RULES.md`, using Cobley's backend behaviour for the module. Raise a question in the PR if a screen needs more than the pattern gives.

| Menu | Permission |
| --- | --- |
| Permissions | `Permissions.list` |
| Countries | `Countries.list` |
| Mobile Releases | `MobileReleases.list` |
| Reports | `Reports.list` |
| Logs | `Logs.list` |
| Scheduled Tasks | `ScheduledTasks.list` |
| Notifications | `Notifications.list` |
| Notification settings (system) | `NotificationSettings.manage` |
| Broadcasts | `Broadcasts.send` |

## Prototype-only (do not build)

- The bottom-left **Screens** pill and its Desktop/Phone frame toggle.
- The **Prototype states** sheet on the respondent screen (scenario jumps, simulate violations, timer jumps).
- Demo data (Kilima Retail, Kilima Wholesale, Pwani Agro). Reuse it as seeders for local development and visual tests so screenshots match.
