<!-- TEMPLATE from the platform shell kit. Fomu's product brief (the Platform core and Look and feel sections are inherited) is the worked example: keep the platform parts, replace the product parts, delete this line. -->

# {{PRODUCT_NAME}}: product brief

> {{PRODUCT_NAME}} is a placeholder name (D15). Decision numbers (D#) point to the decision log at the end of `docs/architecture/ERD.md`.

## What it is

{{PRODUCT_NAME}} is a multi-tenant SaaS form builder in the spirit of Google Forms, built for organisations with many locations, such as a Tanzanian retail group with zones, branches and warehouses. Organisations use it to:
- build forms;
- share them publicly or privately;
- collect responses under strict integrity rules;
- read the results as summaries and as individual responses.

It runs on the **Cobley platform core** (D18): users, locations, roles, menus, statuses, drafts, media and approvals, each scoped by `organization_id`.

## Who uses it

| Person | What they do |
| --- | --- |
| Owner / Admin | Runs the organisation: users, roles, locations, settings, menus, approval workflows |
| Editor | Builds and publishes forms, reads results, exports (subject to approvals) |
| Viewer | Reads results and reports |
| Location roles (custom) | e.g. Branch supervisor, Zone manager. Given at a location and everything below it, added on top of the main role (D19, D21) |
| Respondent | Anyone with the link (public) or an invited email (private). Verifies their email by OTP. Never has an account |

## Tenancy and URLs

- **Path-based tenants:** `/{org}/…` for the admin app, `/{org}/f/{formSlug}` for respondents.
- **Membership:** one user can belong to several organisations, with a role in each. They choose at sign-in and switch from the sidebar; switching plays the page curtain and reloads every list.
- **Locations:** each organisation has a location tree (organisation → zones → branches → warehouses). Forms can be owned by a location (D23); a private form is shared only with that location's people or with invited respondents.

## Forms (v1)

- **Question types:** choice-only, with no typing. That means multiple choice, checkboxes, dropdown, true/false, and the other choice types in the builder.
- **Builder:** inline Google-Forms-style cards in a denser layout. A form has sections, and conditional logic per option ("go to section"), required toggles, and duplicate/delete/reorder.
- **Storage:** hybrid. Versioned JSON definitions (`form_versions.definition`) plus one row per answer. A published form is never edited in place; publishing makes a new version.
- **Settings:**
  - responses: accepting, one per person, edit after submit (off when timed), email me new responses;
  - timer: off, whole form, or per section; when the respondent closes the tab, resume or auto-submit (D2);
  - integrity: single tab, fullscreen, block copy/paste, and the violation policy (warn and log, auto-submit after N, or void);
  - sharing: anyone with the link, or invited emails; bot protection;
  - schedule: opens/closes;
  - presentation: the form's accent colour (tenant-overridable).
- **Templates:** new forms can start from a template.

## Respondent flow

1. One card: email, then a 6-digit OTP (email verification), then a rules screen. Fullscreen is requested when required.
2. Answering:
   - section by section, with a countdown pill and a 1-minute alert;
   - the server keeps time, so changing the device clock has no effect;
   - one session per tab.
3. Violations (tab switch, fullscreen exit, copy attempt) show a blocking overlay with a counter. The form's policy decides what happens.
4. Edge screens: not open yet, closed, response limit reached, already responded, earlier attempt voided (D1: a voided attempt uses up the one-response chance), not invited, device blocked (iPhone/iPad Safari can't do fullscreen), open in another tab, resume a timed attempt, left the tab so it was auto-submitted.
5. IP, browser and integrity data are kept for the life of the response (D3).

## Results

- **Summary:** a KPI strip, then a chart per question.
  - Chart views have three levels: built-in per type, an organisation default per type (Settings), and a per-question override (D6).
  - Charts use one shared palette (c1–c5, then Other) and animate in.
- **Individual:** a table of responses (status, duration, violations), each opening in a side sheet with a timeline.
- **Filters:** by answer, date range and status.
- **Owner actions:**
  - **Export** to XLSX/CSV;
  - **void** a response;
  - **reset a respondent** ("allow another attempt");
  - an **accepting** toggle.

  Export and reset go through approval workflows when one is active (D41).

## Platform core (from Cobley)

- **Sign-in (D7):** email, phone or username plus password, then TOTP 2FA. Optional 30-day trusted device; organisations can require 2FA.
- **Users:** each has one **main role** (Owner, Admin, Editor, Viewer). Custom roles are given at locations. Direct grants and denies are kept as JSON overrides (D20). The effective permission is main role + custom roles at the location chain + granted − denied, and a deny wins (D21).
- **Roles:**
  - a list page plus a details page (D39);
  - permissions grouped by module, plus a menu-visibility tree;
  - edits are staged behind a save bar, with a leave guard (D42);
  - "Preview this role" (D37).
- **Permissions:** named `Module.action`. `Module.list` gates menus, and a hidden menu reached by URL shows a No access page (D8, D12, D28).
- **Menus:** stored in the database.
  - Display modes are dropdown (always accordion), panel or section, and each mode has its own animation (D14, D16).
  - A parent menu is visible if any child is; an empty parent is hidden.
  - Menu Management is information-only, with drag-to-reorder and a gear that opens settings.
- **Locations:** a tree list plus details with the tabs Overview, Details, Users, Forms and History (D26).
- **View as (D24, D37):**
  - read-only, in two modes: a real person, or a role preview;
  - a banner shows who or what is being viewed, and everything is audited;
  - there is no "Act as".
- **Search (D29, D30):** inside a module, the top-bar search filters that module. On the Dashboard it is global, grouped by module, with "See all in X".
- **Lists:** Refresh, Filters (simple/advanced), Clear, Sort, then the module's own actions (D31, D32, D38).
- **Shared form behaviour (D33):**
  - server-side drafts with autosave;
  - API select with paging and label resolution (D36);
  - the file picker plus Media library;
  - rich text (Tiptap);
  - delete with a dependency check and a YES gate.
- **Approvals (D25, D34, D40–D44):**
  - workflows per action, with steps, approvers, Any/All and a count;
  - routing along the location chain, with escalation;
  - delegations;
  - a capacity rule;
  - notifications on in-app, email, SMS (NJIWA) and push, with reminders and quiet hours;
  - email links to the request only, so approvers sign in to decide.

## Look and feel

- **Visual base:** shadcn-vue in a neutral zinc base with one brand accent (teal) that tenants can override. Font: Geist.
- **Every screen:**
  - works in light and dark, and responsive from 360px to desktop;
  - has the page-transition curtain (bright teal in light, deep green in dark);
  - small, compact and polished cards, with tabular numbers;
  - charts that match the palette.
- **The prototype is the visual source of truth (D17, D27).** Where Cobley's old frontend disagrees, the prototype wins.

## Out of scope for v1

- Typed-answer questions (short/long text), file-upload questions.
- One-click approve/reject from email (D44).
- "Act as" impersonation (D37).
