# Testing on a phone (P69, P70)

The phone app is the product's web in an Android web view. Everything that is only true on a phone is checked on one: an
emulator for the routine, a real phone before a release.

## Driving the web view from the desk (CDP over adb)

1. Find the web view's socket: `adb -s <serial> shell pidof <app id>` for the pid; the socket is `webview_devtools_remote_<pid>`.
2. `adb -s <serial> forward tcp:9333 localabstract:webview_devtools_remote_<pid>` (repeat after every app restart: the pid changes).
3. Connect a script to `http://localhost:9333` (Playwright `chromium.connectOverCDP`, or any CDP client). With two devices
   attached always pass the serial.
4. Rules that save hours:
   - read the DOM (`innerText`) after every action; "clicked" proves only that the click was sent;
   - click by visible text or role, never by Tailwind classes;
   - Vue `v-model` inputs need the native value setter and an `input` event (Playwright `fill` does this);
   - the keyboard covers the on-screen Sign in button: submit with Enter;
   - `adb shell input text` can mistype passwords: fill through the page instead;
   - native views (the camera overlay, Android permission dialogs, the system installer) are not in the DOM: use
     `adb shell uiautomator dump` and `adb shell input tap`, or check on a real phone;
   - `adb logcat | grep PHPMonitor` and the server's log, not only the DOM, say what happened.
5. Release builds turn web debugging off (P69); inspect a debug build.

## Before each release (P70)

Run the phone movements checklist (`PHONE_MODEL.md`) on the emulator and on one real phone:

- [ ] cold start signed in; cold start with the signal off (opens read-only, not signed out)
- [ ] to the background and back (refreshes, "Updated just now"); killed and reopened (cart and draft back)
- [ ] signal lost and back; a write cut off mid-save (one record after a deliberate retry)
- [ ] 401 (Session ended, then back where they were); lock after time away; five wrong PINs
- [ ] camera asked, allowed, denied, denied for good; scan; type the code; print; call, WhatsApp, SMS from a number
- [ ] keyboard open on the longest form (the field and the action in view); Back at every layer and on forced screens
- [ ] update banner and required screen; install over the old version keeps the session
- [ ] light and dark, 360 / 390 / 411 wide, gesture and 3-button navigation

## Other tooling worth having

- `log-app.sh`: logcat filtered to the app's pid plus the on-device Laravel log (`adb shell run-as <id> …`).
- A host-contract test (PHP): every plugin the provider lists exists, native events post OK.
- Emulator camera: `-camera-back virtualscene`; a seeded gallery needs `adb push` and a media-scanner broadcast; headless
  emulators cannot draw the camera preview or permission dialogs: use a real phone.
