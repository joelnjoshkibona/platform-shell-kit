# P138 · Bundle updates: the app's own files without a new APK

Status: **decided** 2026-11-26 (the owner: "experiment how we can have bundle updates versus APK updates", then "build it"),
kit 1.61.0. Proven on a product's phone app first (staging: an APK, then a bundle that changed the sign-in screen, applied
on an emulator with nobody signed in). Amends P53, P67 and P79; uses the mobile-updater plugin 1.2.

## Why

- Most releases change only screens and PHP. An APK carries the native runtime too (about 36 MB against about 11 MB for the
  app's own files), goes through Android's installer and its permission and Play Protect screens (P79).
- NativePHP Mobile 4's Android core already applies `{storage}/updates/pending.zip` at a cold start: it replaces the
  `laravel/` tree, keeps the installed `.env` and the shell's version, and never touches `persisted_data`. A store or APK
  update with a new version code throws a queued or applied bundle away. Only the client was missing.

## Decision

1. **A bundle is a zip of the app's Laravel files for one APK.** It is the `laravel_bundle.zip` NativePHP built for that
   APK (`native:package`), with the product's changes and a `bundle.json` at its root: `{ code, bundle, version, notes }`.
   `code` is the APK's version code; `bundle` counts from 1 for that code. The APK's own files are bundle 0.
2. **It must be built with the APK's version and code**: core compares its `.version` (`<version>b<code>`) with the APK's
   and re-extracts the APK's own files when they differ, undoing the bundle. The release refuses a zip whose `.version` is
   not the APK's.
3. **Native changes need an APK.** Each APK release records a fingerprint of the native side (the PHP runtime lock, the
   installed `nativephp/*` and plugin packages, the NativePHP config, push config, the splash, the icon); a bundle release is
   refused when it changed since. The fingerprint is a script the product can extend.
4. **Where a bundle is offered**, beside the APK it belongs to:
   - **Feed (P79)**: `latest.json` gains `bundle: { forCode, number, url, sha256, size, date, notes }` (the zip as an asset
     of a GitHub Release `v<version>-bundle<n>`). As with the APK, the address and hash are read on the phone's server and
     never reach the interface.
   - **Server (P53)**: the API's version answer gains `bundle` with the same fields, from the release's bundles (a release
     has bundles: number, file, notes, active).
   - **A product with its own update feed** (another server) publishes the same object beside its APK entry.
   Only a bundle whose `forCode` is the installed APK's code and whose number is above the installed one is offered.
5. **The installed APK code is the package's** (P67): never `.env`, which `native:package` raises after writing the APK's
   code. The installed bundle is `bundle.json`'s number (none: 0).
6. **An APK update comes first.** While one is on offer or required, no bundle is fetched.
7. **The download is automatic and quiet**: the plugin's DownloadBundle (DownloadManager, Android's own download
   notification) checks the SHA-256 **before** the zip becomes `pending.zip`, so a cut or wrong file never reaches core. A
   bundle that failed is not fetched again until the app starts again.
8. **Then one question: Restart now, or Later.** "<product> X is ready / Restart the app to finish. It takes a few seconds
   and you stay signed in." Restart relaunches the app in a new process (a live process skips `pending.zip`); Later leaves
   it to apply the next time the app is opened. On the sign-in screens (P137) the card at the top says the same.
9. **A way back.** The feed can withdraw bundles for a code (`rollback: true`): the app drops a queued one, marks its files
   as not the APK's (core then re-extracts the APK's own files; deleting `.version` is not enough, because core falls back to
   `.env`) and asks the same Restart question. About shows "update N" beside the version, what changed in it, and "Return to
   the installed version".
10. **Releasing**: `scripts/release.sh --bundle "What changed" [...]` builds with the recorded APK version and code, checks
    `.version`, adds `bundle.json`, publishes, and checks as a phone would (the feed offers it, the file is that file, served
    at that size); `--bundle-rollback` publishes the withdrawal. The bundle number goes up by one; no version to raise.

## Measured (NativePHP Mobile 4.6, Android 16 emulator)

Bundle 10.7 MB against a 36 MB APK; the restart and the apply about 1.5 s; the sign-in token in the web view's storage
survives. A debug build whose version is `DEBUG` never applies a bundle (core skips it); a reinstall with the same version
code keeps the bundle.
