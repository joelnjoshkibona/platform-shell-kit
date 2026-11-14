# The phone app

A product's phone app is its own app, crafted for a phone only (360 to 430 pixels wide) (P93). It is not the web app squeezed or rebuilt. It talks to the same API and follows the same rules for data, permissions and modules; it has its own shell, components and screens, and its own small Laravel inside the app for the phone's own work.

```
mobile/
  app/Http/Controllers/Native/   insets, keyboard, Back, files, camera, voice, alarms, updates, drafts, app log
  routes/web.php  routes/api.php the interface for every path · /api/native/*, /api/drafts, /api/cache
  resources/spa/src/
    app/                         start-up, session, the phone's behaviour, the frame (bars, drawer, sheets)
    components/                  the phone kit's pieces
    modules/{module}/            module.ts, screens/, sheets/, locales/, tests/
  scripts/build-web.sh           builds resources/spa into public/spa
```

## What is the same as the web

- The modules: `mobile/resources/spa/src/modules/{module}/`, under the same names as the API and web modules, only for the modules the phone shows.
- Shared code: only `packages/shared` (talking to the API and its types, permission names, statuses, formatting). Never the web app's screens or components. A phone usually shows fewer modules (a task tracker: my work, tasks, tickets, alerts).
- Links: a `RecordLink` on the phone opens a bottom sheet.
- Strict TypeScript, the convention tests, the plan, tracker and guide.

## Where the data lives (P102)

The phone app works in one of three ways, chosen when the product is made:

- **connected**: the server's API is the truth. Without signal, the app shows the last data and saves nothing.
- **on the phone**: there is no server; the phone's own Laravel and database are the backend, with backups to a file.
- **sync**: the phone keeps a working copy and a queue of changes. People keep working without signal; the changes go to the server when it is back, each with a key so nothing is applied twice. If someone else changed the same record, the app shows both versions side by side and the person chooses.

The screens never know which one is on: they read and write through one data layer (`src/app/data.ts`), so a module is written once.

## Talking to the backend (P117)

Every remote call goes through one **backend adapter**, the phone's twin of the web's (P105): sign-in and the code step, a password reset
by code, the profile and permissions, organisations, the menu, lists and errors. The kit's own API is the default. A product whose API
already exists writes `mobile/resources/spa/src/backend/index.ts` with `defineBackend({...})` and maps its answers to the kit's shapes
there; nothing else in the app knows a path. The adapter also says what the backend can do (organisations, notifications, approvals,
push, sync, forgot password …); what it cannot do is left out of the app instead of shown broken.

## How it moves (P118)

The phone follows the web's motion rules (P116) and adds its own: the splash opens into the app as soon as it is ready, a record slides
in from the right and Back slides it away, tabs fade, wizard steps slide by direction (only the step moves; the header and the steps stay still), lists rise once, and a write that matters (an
order made, goods out, stock received) ends in a done moment with the number and what happens next instead of a toast. A document's
lines are added from an item catalogue with a quantity sheet (P115). Reduced motion turns all of it off.

## What is the phone's own (P51 to P79)

- **A phone moves.** The app keeps the person signed in without a signal, saves the open form when it goes to the background, comes back where it was after Android closes it, never repeats a save it is unsure about, and shows "No connection" honestly.
- **The keyboard.** On some phones the screen does not shrink when the keyboard opens; sheets lift by the keyboard's height (P71).
- **The Back key** closes the top layer first (a sheet, a dialog, the menu), then goes back, then asks twice before leaving.
- **Updates** come from a download page or the product's API; the app checks, downloads, verifies and installs (P53, P67, P79). The app's own server reads the page's `latest.json`, so the address of the file never reaches the screen. A new version opens one short dialog (Later or Update); Update opens the update page, one card that does each step. `scripts/release.sh` publishes a release to the page and waits until it is live.
- **Background health** (Profile) lists what can stop the app working while it is closed. Each module that runs in the background brings its own checks (`defineModule({ health })`); on phones whose maker keeps its own auto-start list, one shared card says where to allow it, with Open settings and I allowed it (P119).
- **The app log** records what went wrong on a real phone so it can be followed up (P72). **Everything you build writes to it (P113):** a new feature's PHP uses `AppLog`, its page `useAppLog`, its plugin `AppLogBridge`; not `Log::` (that file is not exported) and not logcat alone. Log starts and ends with counts, every call out with its answer code, every failure with its reason, waits and give-ups; never content. List the lines in the feature's spec and test that the main one lands in the exported log.

Read `docs/mobile/PHONE_MODEL.md` (what a phone is, how it moves) and draw the phone prototype before writing phone code.
