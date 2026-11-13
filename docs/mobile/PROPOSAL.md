# Mobile kit: proposal

Status: **approved in direction** by the owner (18 Oct 2026, the direction is in section 5). Built since as P56–P70.
Evidence: one product's phone app (a spike and its first real-phone test) and an investigation of three other NativePHP
apps built on the same chassis. The apps are called "the four apps" below; which product each is does not matter to the kit.

## 1. What the four apps show

All four are the same chassis (a Vue single-page app in NativePHP's Android web view, the data on a remote API), copied
from one app to the next. Each rediscovered the same bugs; none wrote the rules down as rules.

**Learned four times (these are rules already):**

| Rule | Where it bit |
| --- | --- |
| Hash routing, so the web view's history is the Back key | three apps (the fourth: a history guard) |
| Safe areas from the injected `--inset-*` with `env()` behind them, and the injected body padding overridden or the header doubles | all four |
| A web view caches GETs: bust with a query parameter, never with `Cache-Control` request headers (CORS preflight) | three apps; the fourth found it on 1.0.1 (the update banner never came) |
| The keyboard resizes the view on most phones (`100dvh`, scroll the focused field into view after a delay) but **not on Android 10**: ask the plugin for its height (P71) | three apps (resize); a later app on Android 10 (no resize) |
| A native answer can arrive before the HTTP response that asked: register the listener first | two apps |
| The system installer freezes JS timers: re-read state on `visibilitychange`, not on a timer | all three updater copies |
| `native:package` bakes the version code before it bumps `.env`: read the code from the built APK | three apps (the fourth: a release script) |
| The bundler zips the whole working tree: secrets live outside it, release tools are dev-only | two apps |
| Permissions: just in time, never block start, never throw; hardware `required=false` | two apps |

**Missing in all four (the gaps the kit should fill):**

1. **No real connectivity state.** None uses the Network API or online/offline events; no timeouts; manual retry only.
   (One has P51 No connection, driven by failed calls only.)
2. **Opening with no signal logs the person out.** One app's `initializeAuth` cleared the session on any `/profile`
   failure; two others the same by design or accident.
3. **Nothing reacts to the phone's movements:** pause/resume are ignored, polling continues in the background,
   nothing refreshes on return, and a killed process loses an unsaved cart (two apps).
4. **Credentials in plain storage**, `allowBackup=true`, no lock, and logout leaves the cart/drafts of the last person. Two apps kept the sign-in token in `localStorage`. Two sent a shared API key baked into the web bundle (`VITE_API_AUTH_KEY`, hashed hourly) on every request, and kept the user record and `client_id` in `localStorage` (checked 2026-10-18); anyone can read that key out of the APK. `allowBackup="true"` in all of them.
5. **The Back key** closes nothing but the page: full-screen pickers, the sidebar and even the "mandatory update" dialog
   can be left with Back (two apps; a third fixed layers, not yet the rest).
6. **A write that may or may not have happened** (a timed-out sale) can be repeated: no idempotency key anywhere but a
   double-tap flag. One app alone wrote the right rule (never replay automatically; keep the form; say "check recent
   ... before trying again").
7. **Push, deep links, share, call/SMS/WhatsApp:** One app has push registration; nobody opens a record from a
   notification, calls a customer, or shares a receipt.
8. **No device test discipline:** a CDP runbook per app, hand run; no checks that run on a phone.
9. **Documentation drift:** READMEs promise offline modes, plugins and files that do not exist (all three). A kit must
   say only what is built.

## 2. The idea: a phone is a device that moves

Two tables the kit owns, from which every rule follows.

**What a phone is (device facts, asked once, never assumed):** Android version and arm64; network (none / data / Wi-Fi);
notch and gesture bar (insets); keyboard (open/closed, height); permissions (camera, Bluetooth, notifications, install
unknown apps: each *unasked / allowed / denied / denied for good*); hardware present (camera, Bluetooth, biometric,
vibrate); installed version and code; battery saver / low memory (the process may be killed).

**How it moves (events, each with one rule):**

| Movement | The rule (proposed P-number) |
| --- | --- |
| Cold start | P57: show the curtain; keep the stored session; validate it *if* there is a network, else open read-only with the last data |
| Back pressed | P61: close the top layer; then go back; first screen asks twice (P52); never on a forced screen |
| App to background | P58: stop polls; save drafts and the cart; start the lock timer (P65) |
| App to foreground | P58: refresh what is on screen; recheck the session, the update (P67) and the network (P59) |
| Process killed | P58: reopen where they were with their cart/draft back |
| Network lost / back | P59: banner or page (P51); reads retry on return; writes are never replayed (P60) |
| A write times out | P60: keep the form, say "check before you try again"; an Idempotency-Key makes the retry safe |
| Keyboard opens | P62: the field stays visible; the primary button stays reachable |
| A permission is asked | P63: say why first, ask at the moment of need; denied: say what stops working and offer Settings |
| Notification tapped / link opened | P66: open the record (or the sign-in, then the record) |
| Leave for the system (installer, Settings, share, call) | P67/P64: expect to come back; re-read state on return |
| Update appears | P67: banner; below the minimum, nothing else (Back cannot leave it) |
| Phone handed to someone else | P65: lock after N minutes away; sign-out wipes cart, drafts and caches |

## 3. Proposed decisions (P56 on; P51–P55 stay)

| P | Title | New or amends |
| --- | --- | --- |
| P56 | Quiet header on a phone (menu, title, search, avatar; the rest in the avatar menu) | new (built in one app first) |
| P57 | Boot and session: stored session kept; offline cold start opens read-only; 401 is not "no network"; token in secure storage | new |
| P58 | Phone lifecycle: pause/resume/kill; refresh on return; polls stop in the background; cart and drafts survive a kill | new |
| P59 | Connectivity: the Network API plus failed calls; timeouts; reads retry with backoff; the P51 screens | amends P51 |
| P60 | Uncertain writes: no automatic replay; Idempotency-Key on money writes; double-tap guard; the "check first" message | new |
| P61 | Back stack: layers, sidebar, pickers, camera overlay, forced screens | amends P52 |
| P62 | Safe areas and keyboard: one contract; bottom sheets clear the gesture bar; focused field visible | new (one app's fix generalised) |
| P63 | Permissions: just in time, rationale first, denied and denied-for-good states, never blocks | amends P54 |
| P64 | Phone actions: call, SMS, WhatsApp, share, copy; camera and barcode scan; printer pairing, choice kept | new |
| P65 | Device lock: optional biometric/PIN, lock after N minutes away, wipe on sign-out | new |
| P66 | Notifications and links: register after sign-in, rotate, unregister before sign-out; tap opens the record | new |
| P67 | Updates: compare the installed integer code; resumable, verified; stale download cleared; forced screen not escapable | amends P53 |
| P68 | Releases and channels: key outside the repo; app id, name and icon badge per channel; code read from the APK | new |
| P69 | Debugging: the CDP runbook; web debugging off in release builds (decide) | new |
| P70 | Phone tests: a checklist per movement; a harness that drives a real web view over CDP | new |

## 4. What goes in the kit (platform-shell-kit, one minor bump, 1.8.0)

- `docs/mobile/`: this proposal becomes `PHONE_MODEL.md` (the two tables), the P56–P70 specs under `docs/platform/`,
  `MOBILE_RULES.md` (Locked / Constrained / Free, with the review checklist), `DEVICE_TESTING.md` (the CDP runbook).
- `prototype/src/parts_phone.js` (extends `parts_appshell.js`): the phone states as screens (offline cold start, session
  expired, permission rationale and denied, lock, forced update, update ready, printer pairing) **and a "Phone
  movements" panel** in the prototype that triggers each movement (airplane mode, background/foreground, kill, deny a
  permission, slow network, keyboard) so a product sees its screens in each state. Screenshots for each.
- `templates/mobile/`: the app skeleton one app's `mobile/` already was (catch-all route, `build-web.sh`,
  `make-images.mjs`, `release.sh`, `.env.example`, a host-contract test) plus the web-side module `src/phone/`:
  `bridge` (native calls with the listener registered first, timeouts), `lifecycle`, `network`, `backstack`,
  `secureStore`, `lock`, `actions`, `permissions`, each small, plain TypeScript, unit tested.
- A short list of the Android plugins products take from Composer (`blutrixx/*`: device-utils, mobile-updater, escpos
  printer, fcm), with the rule "never fork per app", and a contract test that every listed plugin exists.

## 5. The owner's direction (18 Oct 2026)

1. **Tolerant, not offline-first:** the app opens with the last data and never logs a person out for lack of signal; a
   sale or payment is never lost or doubled. A true offline queue stays for later (it came later as P102's sync mode).
2. **A lock the organisation can switch on** (fingerprint or PIN; off by default; locks after a few minutes away;
   sign-out clears the cart and drafts).
3. **Phone actions, in this order:** call/WhatsApp a customer, scan a barcode, print receipts over Bluetooth, push alerts.
4. Web debugging off in release builds; NativePHP v4 is the target and the Android plugins are checked on v4.
5. An existing phone app is rebuilt on this layer in place (same app id), so phones keep updating.
