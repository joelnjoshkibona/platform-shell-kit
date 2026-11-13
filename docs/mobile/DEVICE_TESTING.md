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
- [ ] keyboard open on the longest form and on every sheet (the field and the action in view; on an Android 10 phone too, P71); Back at every layer and on forced screens
- [ ] the log: Settings, Logs shows the run; Export and share saves a file and opens the share list; a forced crash is offered for export at the next start (P72)
- [ ] each new feature's lines are in the exported log after it was tried: its start and end with counts, a forced failure (signal off, server down) with its reason, and no personal content (P113)
- [ ] the map: a real outdoor walk shows a path and the stops, tiles load with a network and say so without one, Delete the trail asks first (P77); Phone status shows the live reading and a history that grows, with the app closed too (P76); the log shows no `db` reset warnings (P78)
- [ ] location recording: a real outdoor walk, indoors gives no fix (P73); a reminder rings with the app closed (P74); a photo taken, the app killed, the photo back in the form (P75)
- [ ] update banner and required screen; install over the old version keeps the session
- [ ] light and dark, 360 / 390 / 411 wide, gesture and 3-button navigation

## Other tooling worth having

- `log-app.sh`: logcat filtered to the app's pid plus the on-device Laravel log (`adb shell run-as <id> …`).
- A host-contract test (PHP): every plugin the provider lists exists, native events post OK.
- Emulator camera: `-camera-back virtualscene`; a seeded gallery needs `adb push` and a media-scanner broadcast; headless
  emulators cannot draw the camera preview or permission dialogs: use a real phone.

## Learned on a real phone (Hodie, 2026-11-05)

- **A release build cannot be debugged and its web view console is not in `logcat`.** The app's own log (P72) is how you see what happened. For facts the log does not hold, `adb backup -f x.ab -noapk <app id>` works on Android 10 (tap "Back up my data" on the phone): the `.ab` is a zlib stream after a 4 line header, a tar inside has `shared_prefs/` and the SQLite database.
- **`am crash <app id>` kills the web view's renderer, which the Java crash handler never sees**, and the process dies. It tests the "died while open" marker, not the handler. `adb shell am kill` does nothing while a foreground service runs or while the app is on screen: stop the service and put another app on top first.
- **Never `pm revoke` and `pm grant` a runtime permission on a test phone.** After Deny it left a uid-level app-op `CAMERA: mode=ignore` that beats the package's `allow` (black camera, "disabled by policy"). Repair: `adb shell appops set --uid <app id> CAMERA allow`. Use the system dialogs and `uiautomator dump` to find their buttons.
- **A phone that sleeps shows a white screenshot.** `adb shell svc power stayon usb` keeps it awake while plugged in (set it back with `false`). A phone with a secure lock must be unlocked by its owner.
- **Android 10 USB:** if `adb devices` says "no permissions" the USB id is `0e8d:201c`; `adb kill-server` and a few seconds, or re-plug.
- **Mock GPS (emulator)** only emits when `set-test-provider-location` is called: send the position again every 30 s. Indoors a real phone gives no GPS fix: test location outdoors.
- **Doze:** `dumpsys deviceidle force-idle` and `unforce` (the exact-alarm result differs with and without the permission, P74). Put the clock in the page tests: a test that depends on the time of day breaks on the next day.
- **Same version, same bundle (P68):** every test install gets a new version code. `native:package` writes the manifest first and then bumps `NATIVEPHP_APP_VERSION_CODE` in the bundled `.env`, so the code the app reads is one more than the one Android knows.
- **A phone in use:** taps sent with `adb input` land on whatever is on screen. Take a screenshot before and after every step, and never tap blind after an install (the app needs about 15 seconds to be ready).

## Learned on a real phone (Hodie, 2026-11-06)

- **A POS terminal (Telpo M1K, Android 12) is a good test of the safe areas and a poor test of location.** It has a real 96 px navigation bar whose first inset answer was 0 (P62), and no position source indoors: the network provider is off and the fused provider gives nothing, so it cannot make a trail. Use it for layout, use a phone that is carried for the walk (P77).
- **It sleeps although `stay_on_while_plugged_in` is set**: wake it and swipe up before every screenshot. **A shared test phone** can have another session start a different app: read `dumpsys window | grep mCurrentFocus` before every tap, and take a screenshot after.
- **A blind tap lands on whatever moved.** After the Settings list grew, a coordinate tap hit a destructive row; only its confirmation (Delete the trail asks first) saved the data. Destructive rows need a confirmation, and tests find rows by their text.
- **Page tests of a map:** serve the app with `php artisan serve`, seed the trail with `tinker --execute`, block the tile host in the browser and answer with a stand-in PNG so the test does not depend on the network; check that the tile error notice appears when the stand-in is removed.
- **`pkill -f` or `pgrep -f` with a string that also appears in your own command kills your own shell** (exit 144). Find the server with `ss -ltnp | grep :<port>` and `kill` the pid.
- **A change that only runs on the phone needs a phone before it is done.** The update check passed 10 PHP tests and a browser suite and still failed on the M1K (the `nativephp_call` argument count, P79 and PLUGINS.md); the app's own log on the phone named the cause in one line.
- **Testing updates needs two published versions.** Install version N on the phone, publish N+1 (build it as the same signed APK you will ship), and run the update from inside the app: offer, download, check, permission, installer, Play Protect, open. A test install of N+1 over N with `adb` proves none of it.
- **Android's own screens are part of the flow:** "Install unknown apps" for the app, the installer's "Do you want to update this app?", and Play Protect's "App scan recommended" (Scan app sends the file to Google; "Install without scanning" is under More details). Check which screen has focus (`dumpsys window | grep mCurrentFocus`) before each tap.
- **A phone that sleeps launches the app with no layout.** Starting the app while the screen was off left the tab bar under the three buttons once (insets 0, not reproduced when the screen was on); wake the phone first.
- **A published tag is never moved, and a shared plugin may have moved on:** `git fetch --tags` before tagging; a second session had already published `v1.1.0` of the updater, so the fix went out as 1.1.1.
