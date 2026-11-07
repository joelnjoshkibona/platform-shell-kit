# The phone app

A product's phone app is its own app, drawn for a phone only (360 to 430 pixels wide). It is not the web app squeezed. It talks to the same API and follows the same rules for data, permissions and modules; it has its own shell and screens.

## What is the same as the web

- The modules: `phone/src/modules/{module}/`, with a `module.ts` that says which screens and actions the phone offers. A phone usually shows fewer modules (Shelui Tasks: my work, tasks, tickets, alerts).
- Links: a `RecordLink` on the phone opens a bottom sheet.
- Strict TypeScript, the convention tests, the plan, tracker and guide.

## What is the phone's own (P51 to P79)

- **A phone moves.** The app keeps the person signed in without a signal, saves the open form when it goes to the background, comes back where it was after Android closes it, never repeats a save it is unsure about, and shows "No connection" honestly.
- **The keyboard.** On some phones the screen does not shrink when the keyboard opens; sheets lift by the keyboard's height (P71).
- **The Back key** closes the top layer first (a sheet, a dialog, the menu), then goes back, then asks twice before leaving.
- **Updates** come from a download page; the app checks, downloads, verifies and installs (P79).
- **The app log** records what went wrong on a real phone so it can be followed up (P72).

Read `docs/mobile/PHONE_MODEL.md` (what a phone is, how it moves) and draw the phone prototype before writing phone code.
