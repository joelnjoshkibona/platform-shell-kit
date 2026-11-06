# Android plugins on NativePHP v4 (P68)

The shared plugins (`blutrixx/nativephp-device-utils`, `-mobile-updater`, `-escpos-printer`, `-fcm`) were built for
NativePHP Mobile v3. Checked on 2026-10-18 against v4.6: all four install, validate, register and compile, and an app with
all four builds, installs and launches on the emulator, after four small changes to the packages (not to the app):

| Package | Change | Why |
| --- | --- | --- |
| all four | `composer.json`: `"nativephp/mobile": "^3.3 \|\| ^4.0"` | the constraint stopped v4 |
| all four | `nativephp.json`: `android.min_version` (26) and `ios.min_version` | `native:plugin:validate` fails without them |
| device-utils | `composer.json`: `extra.nativephp.manifest = "nativephp.json"` | the validator wants it named |
| fcm | `nativephp.json`: `android.dependencies.implementation = ["platform(com.google.firebase:firebase-bom:33.7.0)", "com.google.firebase:firebase-messaging"]` | v3's core supplied Firebase; v4's does not, so the service failed to compile ("Unresolved reference 'messaging'") |

Registering in the app: `composer require` each, `php artisan vendor:publish --tag=nativephp-plugins-provider`, then
`php artisan native:plugin:register <package>` once per plugin (one argument each), then `native:plugin:validate`.

Still needed for push (P66), not for the build: the product's Firebase project and its `google-services.json` at the app
root (without it the app logs "FirebaseApp initialization unsuccessful" and push does not arrive; nothing else breaks).
The FCM package should declare `project_files` and `gradle_plugins.apply_to` for it (v4's `LegacyFirebaseConfig` covers
older plugins only while no plugin claims them).

## What DevBiz found building receipts (2026-10-18, Phase 12e)

- **v4's core has no `Share`.** `Native\Mobile\Share::file()` still calls the bridge function `Share.File`, which v4 no
  longer registers (the app logs "Function 'Share.File' not found" and nothing opens). A plugin has to answer it: DevBiz's
  `blutrixx/share-file` registers `Share.File` and `Share.Url` and shares through the app's own `FileProvider` (its
  `file_paths.xml` serves the cache folder, so the plugin copies the file there first).
- **The shared `escpos-printer` plugin is not enough for a shop.** It connects to the *first* paired Bluetooth device that
  accepts, whichever it is, bundles one company's logos in the app and reads receipts as the DantSu text markup (so a
  product named `[C]` is a printer command). DevBiz's own copy writes plain ESC/POS to the printer this phone chose, takes the
  server's job and logo, and keeps the choice on the phone. The shared package should be changed the same way before another
  app prints (the choice by address, no bundled logos, plain text).
- **A plugin's functions are callable from the web view** with `POST /_native/api/call {method, params}` (the answer is
  `{status, data}`); the web needs no PHP in the app for them. The functions that need the activity (a permission question,
  the share list) declare `"android_params": ["activity"]`, the others `["context"]`.
- **Same version, same bundle.** Reinstalling with the same `NATIVEPHP_APP_VERSION` keeps the old unpacked web bundle and
  PHP; the Kotlin is new. Bump the version for every build you test.

## What Hodie found (2026-11-05, three own plugins in one app)

| Package | What it does now | Notes for a product |
| --- | --- | --- |
| `blutrixx/nativephp-device-utils` v1.8.0 | insets, file picker and files kept across a kill, camera with the reason it failed, voice notes, Save/Open file into Downloads, **keyboard height** (P71), **app log, crash capture and export** (P72) | `useKeyboard()`, `useAppLog()` and the `/device/*` routes need no PHP or JS of the app's own |
| `blutrixx/nativephp-geo-location` v1.1.0 | foreground-service location recording into a buffer file; GPS plus network before Android 12 (P73) | writes its start, stop and errors to the app log by reflection |
| `blutrixx/nativephp-alarms` | exact reminders that ring with the app closed, restored after a restart or update (P74) | logs each firing to the app log by reflection |

- **A nested list arrives in a bridge function as a `JSONArray` of `JSONObject`, not as a `List` of `Map`.** Parse both, or the first call that sends a list writes empty rows (the app log did, once).
- **A plugin can start work with the process.** Declare a content provider in `nativephp.json` (`android.providers`, fully qualified `name`, `authorities` with `${applicationId}`, `exported: false`); its `onCreate` runs before anything else of the app, which is where the app log and its crash handler start.
- **Plugins can use each other without depending on each other:** `Class.forName("com.blutrixx.device.utils.AppLog").getMethod("write", ...)` and do nothing when it is not there.
- **Share without a `FileProvider`:** copy the file into Downloads/<app> through `MediaStore` (no permission) and hand its `content://` URI to `ACTION_SEND` with `FLAG_GRANT_READ_URI_PERMISSION` (this is how the log export shares). DevBiz's `share-file` plugin does it through the app's own `FileProvider` instead; either works.
- **The plugin's PHP keeps working off the phone** when its class falls back (the app log writes a file under `storage/app/applog` when there is no bridge), so a development server and the tests run the same screens.
- **Test a plugin by its dex:** after `native:package`, `cat classes*.dex | grep -ac "<function name>"` shows the Kotlin really went into the build (a cached build does not prove it).
