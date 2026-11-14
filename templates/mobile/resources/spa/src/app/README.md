# src/app

Everything in the phone app that is not a module, as files (no sub-folders by job). Written in the first product's phone app, then
lifted here. Bootbox's `mobile/` is the working example of each piece. The files that are already here import the others by the
names in this table (`./bridge`, `./log`, `./lock`, `./data`, `./Dialog.vue`, `./ShellHeader.vue`, `./toast`, and
`@/components/Btn.vue`, `Icon.vue`, `BrandMark.vue`); a product whose pieces are named differently changes the import lines only.

| File | What | P |
| --- | --- | --- |
| `boot.ts`, `App.vue`, `modules.ts` | start-up; `defineModule` and the glob loader over `../modules/*/module.ts` (**here**: a module may declare `health`, P119, `reminders`, P74, and `home: true` to own the first screen, P120; menu links take `badge` and `count`) | P81, P82, P120 |
| `i18n.ts`, `session.ts`, `api.ts` | languages; the stored session; the API client from `packages/shared` with the token from secure storage | P57 |
| `bridge.ts` | native calls: the listener registered before the call, a timeout, never throws; also `IS_APP`, `APP_VERSION`, `APP_BUILD` (baked in by build-web.sh) | |
| `network.ts`, `lifecycle.ts` | the phone's network state plus failed calls; pause, resume, kill | P58, P59 |
| `backstack.ts` | Back closes the top layer, then goes back, then asks twice | P61 |
| `secureStore.ts`, `lock.ts`, `permissions.ts` | the token; the device lock; asking at the moment of need | P57, P63, P65 |
| `writes.ts`, `links.ts` | idempotency keys; notification taps open the record | P60, P66 |
| `updates.ts` (**here**) | the update flow: feed (the phone's server reads the download page) or server (the API), decided on version codes, Later kept per code, the offer once per launch, the in-app download and installer | P53, P67, P79 |
| `AppUpdateOffer.vue`, `AppUpdateRequired.vue` (**here**) | the short offer dialog ("<product> X is ready", summary and size, Later \| Update; "Updated to X" after an update) and the screen below the minimum. The shell registers the offer with `setOfferOpener` in every data mode; Update opens `modules/updates` | P79 |
| `health.ts`, `healthSources.ts` (**here**) | `HealthCheck`, `HealthSource`, `readHealth`, the shared auto-start check (`autostartCheck`: the maker's path, Open settings, I allowed it; proven, confirmed or blocked; kept per build); the sources: each module's `health`, plus the reminders' when a module has reminders | P119 |
| `reminders.ts`, `RemindersRuns.vue` (**here**) | the reminders over the alarms plugin, their checks (notifications, exact alarms, battery, auto-start) and what runs (the last and next reminder, test buttons) | P74, P119 |
| `locales/{en,sw}/phoneApp.json`, `phone-health.json` (**here**) | the words of the update flow and of Background health (`phone-*.json` merge into the `phone` namespace) | |
| `hiddenSpace.ts` | a hidden space's locks (`guardHiddenSpace`: on leaving its routes and in the background) and search's first step (`tryOpen`) | P121 |
| `textParts.ts` (**here**) | characters and SMS parts for a composer: GSM 03.38 160/153 (extension characters count twice), anything else 70/67 | P120 |
| `keyboard.ts`, `log.ts` | the keyboard height as `--kb` (lifted from `blutrixx/nativephp-device-utils`); the app log | P71, P72 |
| `drafts.ts`, `media.ts` | drafts written as typed and resumed after a kill; photos, files and voice notes kept until the server has them | P58, P75 |
| `Shell*.vue`, `Sheet.vue`, `Dialog.vue`, `Toast.vue`, `DatePicker.vue`, `Search.vue`, `PhoneStates.vue` | the frame: header, bottom bar, drawer, sheets lifted by the keyboard, dialogs, the no-signal, update and lock states | P56, P62 |

Each `.ts` file is plain TypeScript with unit tests.
