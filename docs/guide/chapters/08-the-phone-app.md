# The phone app

A product's phone app is its own app, crafted for a phone only (360 to 430 pixels wide), the way Hodie is (P93). It is not the web app squeezed or rebuilt. It talks to the same API and follows the same rules for data, permissions and modules; it has its own shell, components and screens, and its own small Laravel inside the app for the phone's own work.

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
- Shared code: only `packages/shared` (talking to the API and its types, permission names, statuses, formatting). Never the web app's screens or components. A phone usually shows fewer modules (Shelui Tasks: my work, tasks, tickets, alerts).
- Links: a `RecordLink` on the phone opens a bottom sheet.
- Strict TypeScript, the convention tests, the plan, tracker and guide.

## What is the phone's own (P51 to P79)

- **A phone moves.** The app keeps the person signed in without a signal, saves the open form when it goes to the background, comes back where it was after Android closes it, never repeats a save it is unsure about, and shows "No connection" honestly.
- **The keyboard.** On some phones the screen does not shrink when the keyboard opens; sheets lift by the keyboard's height (P71).
- **The Back key** closes the top layer first (a sheet, a dialog, the menu), then goes back, then asks twice before leaving.
- **Updates** come from a download page; the app checks, downloads, verifies and installs (P79).
- **The app log** records what went wrong on a real phone so it can be followed up (P72).

Read `docs/mobile/PHONE_MODEL.md` (what a phone is, how it moves) and draw the phone prototype before writing phone code.
