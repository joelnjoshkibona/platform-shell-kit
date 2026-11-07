# Mobile app template (P93)

The phone app of a product on this kit: **its own app, crafted for a phone**, in the shape of Hodie (`NATIVE-PHP/hodie`), never a
build of the web app. Copy this folder to `<product>/mobile/`, replace the placeholders, and follow the steps below.
Read `docs/platform/P93-the-phone-app-is-its-own-app.md`, `docs/mobile/PHONE_MODEL.md` and the product's phone prototype first.

| Placeholder | Example |
| --- | --- |
| `{{PRODUCT_NAME}}` | Shelui Tasks |
| `{{PRODUCT_SLUG}}` / `{{product_slug}}` / `{{PRODUCT_SLUG_UPPER}}` | shelui-tasks / shelui-tasks / SHELUI_TASKS |
| `{{APP_ID}}` | com.blutrixx.shelui |
| `{{DOMAIN}}` | tasks.shelui.co.tz |

## What is here

```
mobile/
  routes/web.php                 every path that is not /api returns public/spa/index.html (the interface)
  routes/api.php                 the phone's own work: /api/native/*, /api/drafts, /api/cache, /api/log (the list is in the file)
  app/Http/Controllers/Native/   (you add) the controllers for routes/api.php; Hodie's are the working example
  resources/spa/                 the interface: its own Vite project, Vue 3, strict TypeScript, Tailwind, everything bundled
    src/main.ts                  start-up
    src/app/                     not a module: start-up, loader, session, the phone's behaviour (P57–P79), the frame
    src/components/              the phone kit's pieces
    src/modules/{module}/        the modules the phone shows: module.ts, screens/, sheets/, composables/, locales/, tests/
  scripts/build-web.sh           type-checks and builds resources/spa into public/spa (the API URL and app version baked in)
  scripts/make-images.mjs        draws the icon and splash from the product mark (P55)
  scripts/release.sh             builds, signs with a key kept outside the repo and the app, and publishes (P68)
  tests/Feature/InterfaceBuildTest.php   every path returns the interface; /api paths do not
  .env.example                   app id, version, min SDK 26, the API URL; never 127.0.0.1
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

## Steps

1. Create the app: `composer create-project laravel/laravel mobile`, `composer require nativephp/mobile:^4` and the plugins the product
   uses (`blutrixx/nativephp-device-utils`, `nativephp-alarms`, `nativephp-mobile-updater`; see `docs/mobile/PLUGINS.md`). Copy this
   template over it.
2. `cp .env.example .env`, `php artisan key:generate`, `php artisan native:install android`.
3. In the repo root, add `mobile/resources/spa` to the npm workspace (`templates/shared/package.json`) and `npm install`.
4. `./scripts/build-web.sh`, then `php artisan native:run android <serial>`.
5. Build `src/app/` from its README (Hodie's parts are the working example), then the modules, screen by screen against the phone prototype.
6. First release: create the key outside the repo (see `scripts/release.sh`), `./scripts/release.sh "First release"`.
