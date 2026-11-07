# Mobile app template

The Android app of a product on this kit (P56–P79): a NativePHP Mobile v4 shell whose every path returns the product's web
build. Copy this folder to `<product>/mobile/`, replace the placeholders, and follow `README` below.

| Placeholder | Example |
| --- | --- |
| `{{PRODUCT_NAME}}` | DevBiz |
| `{{PRODUCT_SLUG}}` / `{{PRODUCT_SLUG_UPPER}}` | devbiz / DEVBIZ |
| `{{APP_ID}}` | com.blutrixx.devbiz |
| `{{DOMAIN}}` | devbusiness.blutrixx.com |

## What is here

| Path | What |
| --- | --- |
| `routes/web.php` | every path returns `resources/spa/index.html` (the web build); a missing build says so |
| `scripts/build-web.sh` | builds `../web` for the app (`VITE_APP=1`, the API URL and the app version baked in) and copies it in |
| `scripts/make-images.mjs` | draws the icon and splash from the product mark (P55) |
| `scripts/release.sh` | builds, signs with a key kept outside the repo and the app, and publishes (P68) |
| `.env.example` | app id, version, min SDK 26, the API URL; never 127.0.0.1 (inside the app that is the app's own server) |
| `tests/Feature/WebBuildTest.php` | the catch-all route (add the host-contract test: every plugin in the provider exists) |
| `web/src/phone/` | the web side of P57–P67 (below) |

## `web/src/phone/` (the contract; built in the first product, then lifted here)

`bridge` (native calls: the listener is registered before the call, with a timeout; never throws) · `network` (the
phone's state plus failed calls, P59) · `lifecycle` (pause, resume, kill, P58) · `backstack` (P61) · `secureStore`
(token, P57) · `lock` (P65) · `permissions` (P63) · `actions` (call, SMS, WhatsApp, share, copy, P64) · `writes`
(idempotency keys, P60) · `links` (P66) · `updates` (P67). Each is plain TypeScript with unit tests.

## Steps

1. `composer install`, `cp .env.example .env`, `php artisan key:generate`, `php artisan native:install android`.
2. `./scripts/build-web.sh` then `php artisan native:run android <serial>`.
3. First release: create the key outside the repo (see `scripts/release.sh`), `./scripts/release.sh "First release"`.
