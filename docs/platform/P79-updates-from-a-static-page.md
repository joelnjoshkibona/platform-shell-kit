# P79 · Updates from a static page

Status: **decided** (kit 1.12.0), **built** in kit 1.33.0. Decided on a phone app on device (Telpo M1K, Android 12); built in a product's
phone app with no server of its own (`APP_DATA_MODE=phone`, P102) and lifted into `templates/mobile/`. Amends P53 and P67.

## Why

- An app with no backend (or one that should not depend on its backend to update) still has to update itself. A public download page
  costs nothing to host and holds no source and no keys: a `latest.json` and the signed APKs as GitHub Releases.
- The phone app first asked an API that did not exist and never found an update. The check has to be read where it works in every data
  mode: the app's own Laravel.
- A page is public. If the interface took the APK's address from it, a changed page could point the installer anywhere; reading the feed on
  the phone's server, and again at the moment of the download, keeps the address and hash out of the interface.
- Version names lie (a replaced release, a lower name with a higher code); Android decides on the integer version code, so the app does too (P67).

## Decision

| Part | What it is |
| --- | --- |
| The feed | `latest.json` on the product's download page: `{ app, versionCode, versionName, minimumCode, apk, sha256, size, date, notes, changes: [{ type, text }] }`, `type` one of NEW, IMPROVED, FIXED, SECURITY, ISSUE. |
| The check | `GET /api/native/update/check` on the app's own Laravel (`App\Update\UpdateFeed`, `Native\UpdateController`): reads the feed with no cache, checks it, compares the installed code (read from the package, P67) with `versionCode` and `minimumCode`. |
| The download | `POST /api/native/update/download` reads the feed again and hands its own address, size and SHA-256 to the mobile-updater plugin; `cancel` and `install` pass through to the plugin. Off the phone they answer 409 (`phone`). |
| The source | `APP_UPDATE_FEED` set (always for phone mode): `feed`. Empty: the product's API (`GET /app/version`, P53): `server`. Baked into the build as `VITE_UPDATE_SOURCE`; the interface and its words follow it. |
| The offer | `AppUpdateOffer.vue`: one short dialog. |
| The update page | `modules/updates`: one card. |
| The required screen | `AppUpdateRequired.vue`: below `minimumCode`. |
| The page and the release | `download-page/index.html`, `scripts/make-download-page.mjs`, `scripts/release.sh` (feed mode). |

## Behaviour

**Locked**

- **The check** runs at launch, every hour while open and on return after 15 minutes, never from a cache (a query parameter and no-store on
  both hops). It answers a state: `off` (no feed), `current`, `available`, `required` (below `minimumCode`: Later cannot put it off),
  `offline` or `error`; with the installed name and code, the newest version's code, name, minimum, size, date, summary and changes, and the page.
  It never answers the APK address or the SHA-256.
- **The feed is checked**: it must name this app (`app` equal to the app id), `versionCode` and `size` must be positive integers, `sha256` 64 hex
  characters, the feed and the APK https (plain http only on a local or testing build). Anything else is `error`, and the last good answer is kept.
  Changes with an unknown type are dropped; text is cut to a length.
- **Codes decide, never names.** A lower name with a higher code is newer.
- **The offer** opens once per launch at the first calm moment (never on the hourly check), and only for a version not put off:
  "**<product> X is ready**", the release's summary, "**It is N MB. Your data stays.**", then **Later** and **Update** side by side. Later is
  remembered by version code; the dot on the avatar and Profile > Check for updates bring it back. The first launch of a newer version shows
  "Updated to X" with what changed and Got it. The shell registers the offer in **every data mode** (the first product's offer never opened in phone
  mode because it was registered after the no-server return). On the phone this dialog takes the place of P53's banner.
- **The update page is one card**: an icon and headline for the step with "Checked at <time>"; **Installed, Newest, Released, Size** (with the
  build numbers); the release's changes, each with its kind's icon; **one button** for the step (Download X, a progress bar with Cancel, Install,
  Install again, Open settings for Android's install-unknown-apps permission, Try again, or Check now when there is nothing to do); under it the
  hint for the step (Tap Install on the next screen, and **if Google Play Protect says "App scan recommended", tap More details, then Install
  without scanning**). Under the card a privacy line for the source: the feed's ("asks one public page for the newest version number; sends nothing
  about you or this phone") or the server's. On arriving it looks at the phone first: a downloaded file installs, a download in progress shows its
  progress, an older file is cleared and downloaded again. Leaving the page does not stop the download.
- **A file that does not match the SHA-256** is refused with "The downloaded file did not match this release", never "check the connection".
- **The required screen** fills the app (layer 110, Back does nothing, P61): "Update <product> to keep going", then, in feed mode, "This version has
  to be updated before it can be used again" (never a word about a server), the button for the step, and "Version X (build N) · needs build M or newer"
  when only a code is known.
- **The install never gets stuck**: the return from Android's installer is read from visibility and window focus; after a few seconds without the
  app being replaced the page offers Install again.
- **The log** records the check (codes only), the start of the download, the installer's answer and a cancel (P72, P113).

**Constrained**

- The page's words come from `.env`: `APP_NAME`, `APP_TAGLINE` (one line under the name), `APP_DATA_KEPT` (what an update keeps, in the product's
  words). Its colours are the shell's tokens, or `download-page/colours.json`; its icon is the app icon (`public/icon.png`, P55).

## The release (`scripts/release.sh`, feed mode)

With `APP_UPDATE_FEED` and `APP_DOWNLOAD_REPO` (`owner/<product>-download`, Pages on) in `mobile/.env`, and `gh` signed in:

1. Clones the page repo and **refuses a version code that is not newer** than the published one.
2. Builds as a release: `APP_ENV=production`, `APP_DEBUG=false` in the `.env` bundled into the APK (debug-only screens stay out, the feed must be
   https); the original `.env` comes back on exit.
3. Signs (P68), creates the GitHub Release `v<version>` with `<product>-<version>.apk`.
4. Writes `latest.json` from the notes: **the first note without a type is the summary**, `TYPE: text` notes are the changes, **`--mandatory` makes
   this release the minimum** (else the previous minimum stays).
5. Regenerates the page (`make-download-page.mjs`), commits and pushes, and **waits until the page serves the new code** (or says to check the
   repo's Pages settings).

```bash
scripts/release.sh "Faster start" "NEW: Search in every list" "FIXED: The draft after a restart" [--mandatory]
```

## Tests

`tests/Feature/UpdateFeedTest.php`: a newer code is available and the APK address and hash stay on the server; the same code is current and
below the minimum is required; names do not decide; a feed for another app or with a bad field is an error; a release build refuses plain http;
no connection is offline; no feed is off and sends nothing; off the phone the offer follows `APP_UPDATE_OFFER` and the download needs the phone.

## Open

- A test that the check's line reaches the exported app log (P113) needs the device-utils log fake; the product's phone test reads it by hand.
- The web prototype's Design system still draws P53's banner for the web shell inside an app (`AppUpdateBanner`); the phone prototype draws P79.
