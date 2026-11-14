# P119 · Background health from the modules

Status: **decided** (kit 1.33.0; numbered P119 after P116 on main and P117, P118 on the phone-backend branch, kit 1.32.0). Built in a product's phone app on device (an Infinix on Android 10, Transsion's own task killer), tested
there and lifted into `templates/mobile/`. Amends P74 (its auto-start note) and P93.

## Why

- Background health read the reminders plugin only. An app without reminders, but with other work that must run with the app closed (receiving
  messages, a location trail, a sync), showed nothing, and the checks that mattered for it had nowhere to go.
- Each module knows what can stop its own work (a role, a permission, notifications, the battery, a keep-alive service) and which plugin can tell.
  The screen should not.
- Auto-start is the same problem for every module on the makers that keep their own list, and Android cannot report it. One card, the same words
  everywhere, and one remembered answer, instead of each module asking in its own way.

## Decision

A phone module whose work runs with the app closed declares its checks with `defineModule({ health })`. Background health lists every module's
checks; the screen knows no plugin.

| Part | What it is |
| --- | --- |
| `HealthCheck` | `{ key, icon, title, why, ok, now, fix?, confirm?, undo? }`: unique key (`<module>.<check>`), already translated words, **what it is now in words**, the **one action that fixes it** (or reviews it when fine), for a setting Android cannot report a `confirm` ("I allowed it"), and an `undo` that takes the person's word back ("Not allowed? Ask again"). |
| `HealthSource` | `{ read(t), extra?, order? }`: reads the module's plugin and returns its checks in the order shown; `extra` is drawn under the checks (what it runs, test buttons); lower `order` first (default 50). |
| `readHealth(sources, t)` | Every source's checks in order; a source that fails is counted and skipped, the others still show. |
| `autostartCheck(…)` | The shared auto-start card (below), with the module's `proven` and `disproven`. `needsAutostart(maker)` says whether a maker keeps its own list; `confirmAutostart`, `autostartConfirmedAt` and `forgetAutostart` keep the answer (`{ build, at }`). |
| `healthSources()` | Each module's `health`, plus the reminders' source (P74) **only when a module has reminders**. |
| `modules/health` | The screen: Profile > Background health. |

## Behaviour

**Locked**

- **The screen**: a summary ("All good, <product> keeps working with the app closed" or "N things can stop <product> in the background"), then one
  card per check: icon, title, an **OK** or **Needs attention** pill, why it matters, "Now: …", and its buttons (the fix is primary while the check
  is not fine, outline once it is; with a confirm, the two sit side by side); an `undo` is a small link under them. Then each source's `extra`, then **Check now**.
- **It reads everything again** when the person comes back from Android's settings: on `visibilitychange` **and** on window `focus`, because a system
  dialog over the app (a permission, the battery exemption) gives back only the focus. A fix skips the app lock while Android's screen is in front (P65).
- **The Profile row** shows how many checks need attention, or "<product> works with the app closed".
- **Nothing to check** (no module has a source): says so. **In a browser**: says the page works in the phone app.
- **Auto-start** (on the makers with their own list: Transsion's Infinix, Tecno and itel, Xiaomi, Oppo, Realme, Vivo, Huawei, Honor, OnePlus):
  - why: "This phone does not start a closed app unless it is allowed to start by itself", then **the path in words** (on Transsion: Phone Master >
    Toolbox > Auto-start management > <product>; elsewhere: "<maker> keeps its own list …: allow <product> there");
  - **Open settings** opens the maker's list; **I allowed it** records the person's answer;
  - its state is **proven** ("Allowed: it started by itself after the last restart"), when the module passes its own evidence (for example, its boot
    receiver ran after the phone last started, which Android only sends to an app it lets start by itself); **confirmed** ("Allowed (you confirmed
    it). Restarting the phone will check it."), kept with when it was said and **for the installed build only**, since an update can reset the
    maker's list, with a **Not allowed? Ask again** link that takes it back; **disproven** ("Not working: after the last restart <product> did not
    start by itself. Allow it again."), when the module passes its evidence that the phone restarted after the confirmation and the app did not
    start by itself: the confirmation is withdrawn and I allowed it comes back; or **blocked** ("Blocked until you allow it");
  - proven or confirmed, the card has no I allowed it; only confirmed has the undo link.
- **The log** records each fix, confirm and undo by key (P72, P113).
- **The reminders' checks** (notifications, exact alarms on Android 14 and above, battery, auto-start; P74) are one source, ordered last, with what runs
  under them (the last reminder that fired, the next one, Test reminder and Test alarm). They are added only when a module declares `reminders`.

**Constrained**

- What a module checks, its icons, words and order are the module's. Keys start with the module's name.

## The worked example

The first product's messaging module (`modules/sms`, not in the kit) supplies, in this order: the default app for its role (fix: Android's role
dialog), its runtime permissions (fix: asks for the missing ones), notifications (asks once, then opens the app's notification settings), the battery
exemption (Android's "Let app always run in background?"), its keep-alive service (turns it on) and, on Transsion phones, auto-start, **proven** when
its boot receiver ran after the phone last started, and **disproven** when the phone restarted after the confirmation and the receiver did not run
within three minutes of that restart (a confirmation made after the restart, or none, is not judged; the wait lets the boot event arrive). That
judgement (`confirmationDisproven(status, confirmedAt, now)`) lives in the module, which reads `autostartConfirmedAt(build)`. Its `module.ts` is three lines: `defineModule({ key, modes: ['phone'], health: smsHealth })`.

## Files

`templates/mobile/resources/spa/src/app/health.ts`, `healthSources.ts`, `modules.ts` (`health?: HealthSource`), `reminders.ts` (`remindersHealth`),
`RemindersRuns.vue`, `locales/{en,sw}/phone-health.json`; `src/modules/health/`; `tests/unit/health.spec.ts`. Prototype: `prototype-phone`,
Profile > Background health (`src/78_system.js`).

## Open

- A module that can read a maker's auto-start state directly (some makers expose it to system apps only) would pass it as `proven`; none does yet.
