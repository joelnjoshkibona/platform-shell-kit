# P42 · Settings is one page of tabs

Status: **decided when this note merges**, from SOMA D14 (built and tested in the SOMA prototype: 11 tabs, organisation defaults with per-stage overrides, checked at 1280px light and 390px dark).
Builds on P11 (core modules: Settings), P26 (details tabs in `?tab=`) and P39 (every view has an address).

## Decision

- Settings (`/{org}/settings`, `Settings.manage`) is **one page with tabs**, not one long column of cards.
- Tab order is fixed: **General** first, then the **product's tabs** in the order the product declares them, then the core **Notifications** and **Security** tabs last.
  - General: organisation name, address, time zone, branding (logo, email footer), brand colour (P41).
  - Notifications: quiet hours (P36). Notification channels and reminders join here when they get organisation settings.
  - Security: require two-step verification, sign out after inactivity.
- The tab is in the link as `?tab=<key>` (P39). General is the bare address. Back/forward, reload and pasted links reopen the tab.
- A product tab is a component that renders its own cards. It may need a permission (`perm`); without it the tab is not shown, and a link to it opens General. It may ask for the wide layout (`wide: true`, 1000px instead of 820px) when it has a side column such as a scope picker.
- One lock banner under the tabs when the person cannot manage settings; every field in the tab is read-only for them (one `fieldset`).
- On phones the tab strip scrolls sideways inside its own row; the page never does.
- Fields save as they change (no Save bar). A tab that needs a confirm step (for example a reset) uses the normal dialog.

## Why

Every product adds its own rules (SOMA: grading, attendance, fees, admission numbers, SMS templates, nine groups in all). One long page buried the core settings under product ones, needed scrolling to find anything, and could not be linked to. Tabs keep the core settings in the same two places in every product and give each product group its own page and address.

## Contract

- **Prototype:** `parts_shell.js` → `SETTINGS_TABS` (array of `{ value, label, icon, comp, perm?, wide? }`) and `WorkspacePage` (renders the tabs). The kit ships Fomu's *Results* tab (`ResultChartSettings`, result chart defaults) as the worked example; a product replaces the array.
- **Web:** `pages/settings/index.vue` with `<Tabs>` bound to the route query; one component per tab under `pages/settings/tabs/`; the product registers its tabs in one file (`settings/tabs.ts`).
- **API:** unchanged. Product settings stay in `organizations.settings.<group>` (JSON) with the product's own validation per group.

## Amends

- **P11 (core modules):** Settings is the tabbed page above; the chart defaults card moves to Fomu's own *Results* tab.
