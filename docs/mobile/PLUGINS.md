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
