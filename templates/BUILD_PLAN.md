<!-- TEMPLATE from the platform shell kit. Fomu's build plan (phases 3–5 are Fomu modules; phases 0–2 and 6–7 are platform) is the worked example: keep the platform parts, replace the product parts, delete this line. -->

# Build plan

The work is delivered in phases, **one PR per phase**. Each PR stops for review; don't start the next phase until it is merged. Every phase ends with the same **Definition of done** (bottom of this file).

Screens and their screenshot names are in `docs/design/SCREENS.md`. Behaviour rules are in `docs/frontend/FRONTEND_RULES.md`. Tables are in `docs/architecture/ERD.md`.

---

## Phase 0: Foundation (no product screens yet)

**Backend (`api/`)**
- Make the Cobley backend {{PRODUCT_NAME}}'s.
  - Rename the app (`APP_NAME={{PRODUCT_NAME}}`) and update the README to describe {{PRODUCT_NAME}}, not SYSTEM_SHELL/Cobley.
  - Keep `laravel/framework ^13` (D45).
- Remove modules {{PRODUCT_NAME}} does not use. Delete their migrations, seeders, routes, menu rows, permissions, registry entries and tests:
  - `System/Inventory`, `System/Payments`, `System/Purchasing`, `System/Sales`, `System/Stock`;
  - `app/Project/_Src/SaleType.php` and anything that references sale types;
  - `packages/laravel-totalvfd` and its composer entry (the TRA EFD integration);
  - anything that only those modules use.
- Keep these modules:
  - `Core/*`: Access, Drafts, Locations, Media, Menus, Notifications, Statuses, Trash, Users, MobileReleases, Reports;
  - `System/Approvals`, `System/Analytics`, `Dev/Translations`.

  The Mobile Releases and Reports menus are in the {{PRODUCT_NAME}} sidebar. If you are unsure about one, ask in the PR before deleting it.
- Add `organizations` and organisation membership as in the ERD (section 01).
  - Add `organization_id` to every tenant table.
  - Add a global scope plus a middleware that resolves `/{org}` and checks membership.
  - Pest tests prove one organisation can't read another's rows.
- Seeders reproduce the prototype's demo data, so local screens match the screenshots:
  - organisations Kilima Retail, Kilima Wholesale and Pwani Agro Dealers;
  - their users and roles, the location tree, and the approval requests.
- CI (GitHub Actions) runs Pint and Pest for the API, and type-check, lint, unit tests and visual tests for the web app.

**Frontend (`web/`)**
- Scaffold Vue 3 + Vite + TypeScript + Vue Router + Pinia + Tailwind + shadcn-vue, with Lucide icons, the Geist font and vue-i18n (English + Swahili).
- Port the design tokens exactly from the prototype into `web/src/styles/tokens.css` and `tailwind.config.ts`. Read them from `docs/design/prototype/index.html`, specifically the `:root` and dark blocks and the tailwind config:
  - colours, `--radius`, chart colours c1–c5 (with opacity support), curtain colours, shadows and fonts;
  - light, dark and system themes.
- Build the **whole component library** in `COMPONENTS.md` / `components_api.json` before any screen:
  - Button, Input, Select, Checkbox, Switch, Radio, Badge, Card, Tabs, Tooltip, DropdownMenu, Dialog/Sheet (portalled; Escape closes the top-most only), Toast;
  - DatePicker (month/year switchers inside the card; popover on desktop, modal on phone);
  - ApiSelect (D36), FilePicker + MediaLibraryDialog, RichText, DraftBanner/DraftStatus, DeleteDialog, RelatedLink;
  - RefreshButton, ListToolbar, FiltersDialog, HeaderSearch, the KPI tile, Spark, SaveBar + useLeaveGuard (D42).

  Props, emits and slots must match `components_api.json`.
- Rebuild the prototype's **Design system page** at `/design` (dev builds only): tokens, type, components with live demos, and the rules. This is the living parity check.
- Visual test harness:
  - Playwright in `web/tests/visual/` with the same viewports and themes as `tools/prototype-shots/shoot.js`;
  - screenshots are named exactly like `docs/design/screenshots/index.json`;
  - a script that runs `tools/prototype-shots/compare.js`.

**Accept when**
- `api` boots, migrates and seeds; the removed modules are gone; the tenancy tests pass.
- The `/design` page matches `design__*.png` in all four viewport/theme combinations.

---

## Phase 1: Shell, sign-in, organisations, dashboard

**Screens:** `login`, `twofa`, `orgpick`, `dashboard`, `dashboard--global-search`, `user-menu--notification-settings` (the sheet's UI; its wiring comes in Phase 6), the No access page.

**Includes:**
- Fortify-style sign-in by email, phone or username, then TOTP 2FA, an optional 30-day trusted device, and org-required 2FA (D7).
- Sidebar from the `menus` table:
  - modes dropdown/panel/section with their animations (D14, D16);
  - permission gating with the OR rule for parents (D8);
  - hamburger with "Menu" under it; a left sheet on phones; "Recent" forms.
- Organisation switcher (portalled, D9) and New organisation dialog; switching plays the curtain and reloads lists.
- Page-transition curtain on first load and every page change, with the loader after 300ms; skipped under reduced motion (D13).
- Top bar:
  - contextual search (D29, D30) with `GET /search?q=` grouped results, recent searches and the phone full-screen mode;
  - View as (eye; person or role, D24/D37) with banner, read-only and audit;
  - notifications bell; theme toggle; user menu.
- No access page with Request access (D12).
- Dashboard: KPI strip, charts, activity.

**API:** auth, 2FA, trusted devices, orgs and membership, menus for the user, global search, view-as sessions (`impersonation_sessions`, D37).

---

## Phase 2: Core administration

**Screens:** `members`, `roles`, `role` (+ `roles--zone-manager-overview`, `role--save-bar`, `role--leave-guard`), `locations`, `location` (+ `location--users`, `location--details`), `media`, `workspace`, `menus`, `forms--filters-dialog` (the shared filters dialog).

**Includes:**
- Users: invite with main role and locations, direct grants/denies, View as.
- Roles list + details (D39):
  - permissions by module with Applied/Not applied filter and search; the menu-visibility tri-state tree;
  - People tab; History tab;
  - staged edits with a save bar and leave guard; one `PUT /roles/{id}/permissions` (D42);
  - Copy permissions from (staged), Duplicate, Delete custom roles (blocked while held);
  - main role names are fixed.
- Locations:
  - tree list; details with Overview, Details (edit with drafts, D33), Users (assign roles, overrides), Forms, History;
  - delete check + YES gate;
  - the location filter is an API select with "and below" (D38).
- Media library + FilePicker; Settings, including quiet hours (D44) and chart view defaults (D6); Menu Management (D16).
- List toolbar everywhere (D31), Refresh everywhere (D32); filters, sort, page and tab in the URL.

**API:** Cobley's list/select/drafts/media/delete-check contracts (FRONTEND_RULES → Backend contract), the effective permission rule (D21) as a tested service, menu visibility, roles CRUD with holders, and location assignments.

---

## Phase 3: Forms and builder

**Screens:** `forms`, `templates`, `builder`, `builder--settings`.

**Includes:**
- Forms list: cards grid with table toggle, status tabs as quick filters, card actions (D10), tables on phones (D11).
- Builder:
  - inline question cards and sections; logic per option; required; duplicate, delete and reorder; autosave ("Saved just now");
  - section timers;
  - Settings: Responses, Timer, Integrity, Sharing, Schedule, Presentation;
  - Publish creates a new `form_versions` row; "Request to publish" applies when a workflow is active (D41 pattern).
- Templates.

**API:** forms, versions (JSON definition, ERD section 07), templates, sharing/invites, location ownership (D23), publish/close.

---

## Phase 4: Respondent

**Screens:** `respondent` and every `respondent--*` state: answering, the 10 gates, the 3 violation overlays, and the timer warning.

**Includes:**
- Email + OTP in one card (with rate limits and bot protection), then the rules screen and fullscreen request.
- Server-side timers: whole form or per section; resume or auto-submit on tab close (D2).
- One session per tab (second-tab gate).
- Violation detection and policy: warn/log, auto-submit after N, or void (D1).
- Edge gates; IP/UA/integrity retention (D3).
- Phones and iPhone Safari (the device gate).

**API:** respondents (global, D5), attempts, integrity events, answers (one row per answer), OTP, submission. See ERD sections 03–05 and the async jobs in section 10.

---

## Phase 5: Results

**Screens:** `responses`, `responses--individual`, `responses--response-sheet`, `responses--export-needs-approval` (that one completes in Phase 6).

**Includes:**
- KPI strip; a chart per question with the 3-level view defaults (D6); the shared palette; animations.
- Filter by answer, date range and status.
- Individual table + side sheet (timeline, violations).
- Void a response.
- Export XLSX/CSV as a queued job with notification and a 24-hour link.
- Reset a respondent ("Allow another attempt").

**API:** aggregates, response list, export jobs (ERD section 10), void/reset.

---

## Phase 6: Approvals and notifications

**Screens:** `approvals`, `request--details`, `request--notifications`, `request--short-step`, `request-types`, `request-types--editor`, `delegations`, `user-menu--notification-settings`, `responses--export-needs-approval`.

**Includes:**
- Inbox tabs; request page with the steps timeline, approve/reject (a reason is required to reject), delegation labels, cancel, and outcome banners.
- Workflow editor:
  - steps, approvers (custom role at the location or above, main role, permission, person), Any/All, count;
  - a preview at a location;
  - the capacity rule (D40): Save is blocked and the workflow can't be switched on; existing failing workflows show "Can't be met".
- Runtime: escalation to owners/admins; a short step adds the Owner; "Complete step as Owner" (D40).
- Gated actions (D41): Publish, Export responses and Reset respondent open "This needs approval"; an open request for the same subject blocks a duplicate.
- Notifications (D43, D44):
  - channels: in-app (always), email (link only), SMS via NJIWA, push;
  - events: waiting, reminder (every N hours up to M), escalation/short step, decision;
  - each step can override channels and mark them required;
  - personal opt-outs;
  - quiet hours hold SMS and push;
  - a `notification_deliveries` row per send;
  - the request's Notifications tab;
  - "Send a reminder now".
- Delegations.

**API:** request types and steps (with `notify_settings`, `notify_channels`, `notify_required`), requests, approvals (`is_owner_override`), delegations, notification channels as Laravel notifications, the reminder scheduler, quiet-hours release, and user notification preferences.

---

## Phase 7: Remaining menus and hardening

- Build the menu items that aren't designed (SCREENS.md → "In the menu but not designed") with the standard list + details pattern.
- Complete the Swahili strings.
- Accessibility pass: focus order, labels, contrast in both themes, reduced motion.
- Performance: list pagination, select paging (D36), chart rendering.
- End-to-end tests for the main journeys:
  - sign in, then build, publish, respond and read results;
  - an approval round trip.

---

## Definition of done (every phase)

- [ ] Every screen in the phase has a visual test, and `compare.js` shows it matches the prototype in **desktop-light, desktop-dark, phone-light, phone-dark** (or the two combos the screenshot set has). List the remaining differences in the PR and justify each one.
- [ ] The `FRONTEND_RULES.md` review checklist (bottom of that file) is ticked for every screen.
- [ ] Zero console errors or warnings; no horizontal scroll at 360px; tap targets at least 40px on phones.
- [ ] Permissions: the menu, route, endpoint and buttons all agree (D12).
- [ ] Pest tests for services, permissions and tenant scoping; web unit tests for composables.
- [ ] English and Swahili strings.
- [ ] Any new behaviour is recorded as a new decision in `docs/architecture/erd_data.py` (then run `python3 build.py`). Any new component is added to `COMPONENTS.md` / `components_api.json`.
- [ ] The PR description has the screens built, the endpoints added, the decisions touched, the screenshots or compare summary, and open questions.
