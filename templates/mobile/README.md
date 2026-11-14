# Mobile app template (P93)

The phone app of a product on this kit: **its own app, crafted for a phone**, in the shape of Bootbox's `mobile/`, never a
build of the web app. Copy this folder to `<product>/mobile/`, replace the placeholders, and follow the steps below.
Read `docs/platform/P93-the-phone-app-is-its-own-app.md`, `docs/mobile/PHONE_MODEL.md` and the product's phone prototype first.

| Placeholder | Example |
| --- | --- |
| `{{PRODUCT_NAME}}` | Task Tracker |
| `{{PRODUCT_SLUG}}` / `{{product_slug}}` / `{{PRODUCT_SLUG_UPPER}}` | task-tracker / task-tracker / TASK_TRACKER |
| `{{APP_ID}}` | com.example.tasks |
| `{{DOMAIN}}` | tasks.example.com |

## What is here

```
mobile/
  routes/web.php                 every path that is not /api returns public/spa/index.html (the interface)
  routes/api.php                 the phone's own work: /api/native/*, /api/drafts, /api/cache, /api/log (the list is in the file)
  app/Http/Controllers/Native/   the controllers for routes/api.php: UpdateController.php is here (P79); you add the others,
                                 Bootbox's `mobile/` has the working example
  app/Update/UpdateFeed.php      reads the download page's latest.json, checks its shape and app id, decides on version codes (P79)
  config/app-update.php          APP_UPDATE_FEED (empty: updates come from the product's API, P53), APP_UPDATE_PAGE, APP_UPDATE_OFFER
  download-page/index.html       the public download page's template, filled by scripts/make-download-page.mjs (P79)
  resources/spa/                 the interface: its own Vite project, Vue 3, strict TypeScript, Tailwind, everything bundled
    src/main.ts                  start-up
    src/app/                     not a module: start-up, loader, session, the phone's behaviour (P57–P79), the frame
    src/components/              the phone kit's pieces
    src/modules/{module}/        the modules the phone shows: module.ts, screens/, sheets/, composables/, locales/, tests/
  scripts/build-web.sh           type-checks and builds resources/spa into public/spa (the API URL, app version and code, and
                                 where updates come from, VITE_UPDATE_SOURCE: feed or server, baked in)
  scripts/make-images.mjs        draws the icon and splash from the product mark (P55)
  scripts/release.sh             builds, signs with a key kept outside the repo and the app, and publishes (P68): to the product's
                                 server, or, with APP_UPDATE_FEED set, to the download page's repo (P79)
  scripts/make-download-page.mjs writes the download page (index.html, icon) from the template, .env and the colours (P79)
  tests/Feature/InterfaceBuildTest.php   every path returns the interface; /api paths do not
  tests/Feature/UpdateFeedTest.php       the feed is read here, checked, compared by code, and never hands out the APK address
  .env.example                   app id, version, min SDK 26, the API URL (never 127.0.0.1), the update feed and the download page
```

The interface calls the product's API directly with the token from secure storage (P57). It shares only `packages/shared`
with the web app (from `templates/shared/`): the API client and types, permission names, statuses, formatters, module keys.
Never import a web screen or component.

## Data mode (P102)

Set `APP_DATA_MODE` in `.env` (`tools/new-product` asks):

- **connected**: the interface calls the API; the phone keeps only drafts, the last data and the log.
- **phone**: the phone's own Laravel holds the modules' tables and services (`/api/local/*`), with backups to a file. No server.
- **sync**: `/api/local/*` on a working copy, a `sync_queue` of changes sent in order with keys, and the server's `/sync/changes` and `/sync/push`.

Screens use `src/app/data.ts` only, so they work the same in every mode.

## Updates (P79) and background health (P119)

Built in the first product's phone app and lifted here (`docs/platform/P79-updates-from-a-static-page.md`,
`docs/platform/P119-background-health-from-modules.md`):

- **Updates.** With `APP_UPDATE_FEED` set (always for `APP_DATA_MODE=phone`, which has no server), the app's own Laravel reads
  `latest.json` on the product's public download page (`GET /api/native/update/check`) and starts the download itself
  (`POST /api/native/update/download|cancel|install`), so the APK's address and hash never reach the interface. Without it the
  interface asks the product's API (`GET /app/version`, P53). `src/app/updates.ts`, the offer dialog, the required screen and
  `src/modules/updates/` (one card) work the same for both. Release: `scripts/release.sh "Summary" "FIXED: …" [--mandatory]`
  creates the GitHub Release, writes `latest.json`, regenerates the page and waits until it serves the new code.
- **Background health.** A module that runs anything with the app closed supplies its checks with `defineModule({ health })`
  (`src/app/health.ts`); `src/modules/health/` lists every module's checks, with the shared auto-start card on makers that keep
  their own list. Link it from Profile, with the count of checks that need attention.

## Steps

1. Create the app: `composer create-project laravel/laravel mobile`, `composer require nativephp/mobile:^4` and the plugins the product
   uses (`blutrixx/nativephp-device-utils`, `nativephp-alarms`, `nativephp-mobile-updater`; see `docs/mobile/PLUGINS.md`). Copy this
   template over it.
2. `cp .env.example .env`, `php artisan key:generate`, `php artisan native:install android`.
3. In the repo root, add `mobile/resources/spa` to the npm workspace (`templates/shared/package.json`) and `npm install`.
4. `./scripts/build-web.sh`, then `php artisan native:run android <serial>`.
5. Build `src/app/` from its README (Bootbox's `mobile/` is the working example), then the modules, screen by screen against the phone prototype.
6. First release: create the key outside the repo (see `scripts/release.sh`), `./scripts/release.sh "First release"`.
