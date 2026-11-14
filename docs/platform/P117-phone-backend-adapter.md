# P117 · The phone app on a backend it did not come with

Status: **decided** (kit 1.34.0). Amends P93 (the phone "calls the remote API directly"), P102 (the connected data layer) and P105 (its
closing line, "the phone app is not covered").

## Why

P105 lets the web app run on an API that already exists. The phone app had no such seam: its sign-in, profile, organisation and menu
stores, its list fetcher and about a dozen screens called the kit's API paths directly. A product whose phone app replaces an older phone
app on an existing API (the API stays, the old screens retire) had to fork those stores, and every kit update then conflicted. The same
product also needed things the kit's own API does not have: a code by SMS after the password, a password reset by code, one organisation
per account, permissions read from flags, and an envelope that reports errors inside a 200.

## Decision

**The phone app reaches its backend through one adapter, and only through it**, the phone's twin of P105 with **the same interface**, so a
product that has written a web adapter writes the phone one the same way and screens never know which backend they run on.

| Part | What the adapter answers |
| --- | --- |
| Headers | `contextHeaders(ctx)`: what every call carries (a bearer token, an organisation, a location, or the backend's own headers). |
| Sign-in | `login(input)` → a session or a pending step (`totp`, `email_otp`, `sms_code`); `confirm(step, input)`; `resend(step)`; `logout()`. |
| Password reset | Optional `forgotPassword` capability: `sendResetCode(login)` → `resetPassword(login, code, password)`; without it the screen links out (`forgotPasswordUrl`) or is hidden. |
| Profile | `profile()` → `{ user, permissions, view_as }`. Permissions are the backend's own keys; a backend with flags maps them to keys here. |
| Organisations | `organizations()`, `enter(slug, openLast)`. A backend with one organisation per account returns one; the picker is then skipped (P57). |
| Menu | `menus()` when the backend serves one; otherwise the phone builds it from the modules' own entries and the permissions (P81). |
| Lists | `list(endpoint, query, signal)` → the list answer (P87): rows, page, per page, total. |
| Errors | `check(status, json)` → an `ApiError` (P88) for a backend that reports a refusal inside a 200; field errors keep their keys. |
| Records | P102's connected `DataLayer` (`list`, `view`, `save`, `remove`, `action`) is built from the adapter, so module data goes the same way. |
| Capabilities | `organizations`, `serverMenus`, `notifications`, `approvals`, `push`, `sync`, `forgotPassword`, `twoFactor`, `drafts`, `media`. |

**Locked**

- **The default adapter is the kit's own API**, so a product that keeps the kit's API changes nothing.
- A product whose API already exists supplies its adapter from **product code**, `mobile/resources/spa/src/backend/index.ts`, found like
  `module.ts` (P82); kit files stay untouched, so kit updates keep applying (P94). `defineBackend(overrides)` starts from the default.
- **Only the adapter knows paths.** Stores, composables and screens call `backend()`, never the HTTP client with a path of their own;
  a convention test (P90) fails on a direct call outside `app/backend/` and `app/data/`.
- **The token stays in secure storage** (P57), written and read by the adapter's session helpers, never in `localStorage`. A 401 clears it
  and opens Session ended (P57); the adapter decides what a 401 is when the backend says it another way (`check`).
- **What a backend cannot serve is hidden, never shown broken.** The shell reads the capabilities: no organisation picker or switcher
  without `organizations`, no notification bell and inbox without `notifications`, no Approvals without `approvals`, no push registration
  without `push`, no sync mode without `sync` (P102 falls back to connected), no "Forgot password?" without `forgotPassword` or a URL.
- The code step is one screen for every kind (`OtpBoxes`, the length from the step, resend with a countdown, the platform's one-time-code
  autofill); the step says where the code went (an app, an email, a phone ending in …).
- The phone keeps its own small Laravel for the phone's own work (P93); the adapter only changes where the **remote** calls go.

**Constrained-creative**: what the sign-in screen says about the product's backend (the field label "Username" or "Email or phone"); the
code length; the copy of the code step.

**Free**: how the product's adapter maps its envelope, flags and pagination.

## The prototype

The phone prototype's Picker has a **Backend** switch (kit / another), like the data mode switch (P102). "Another" draws the same screens
on a backend with an SMS code after the password, a password reset by code, one organisation (no picker), the menu built from permissions,
and no notifications capability (no bell). States: `backend-other-signin`, `backend-other-code`, `backend-other-forgot`,
`backend-other-home`.

## Checks

- A unit test per adapter mapping: sign-in with and without a step, profile → permissions, one organisation, list answer, `check` → an
  `ApiError` with field errors, 401 → session cleared.
- The convention test: no direct API path outside `app/backend/` and `app/data/`.
- Connected e2e runs with the default adapter and with a fake second adapter that has fewer capabilities; the hidden parts are absent.
