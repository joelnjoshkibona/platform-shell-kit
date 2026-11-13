# P93 · The phone app is its own app

Status: **decided** (kit 1.13.0). The owner, 2026-11-07: "make sure the mobile is carefully crafted to be a mobile and not a phone build. [an existing phone-first app] is our perfect example." Replaces the 1.12.1 wording of P80 (phone screens inside the web modules, built by a phone-only entry) and the "web shell inside the app" of `templates/mobile` up to 1.12.1. Returns to the mobile kit's own rule: a phone app is crafted for a phone.

## Decision

- A product's phone app is crafted for a phone: its own shell, screens, components and design (the kit's `prototype-phone/`), never the web app narrowed or rebuilt.
- `mobile/` is a complete NativePHP 4 app in the template's shape (`templates/mobile/`):

```
mobile/
  app/Http/Controllers/Native/   the phone's own work: insets, keyboard, Back, files, camera, voice, alarms,
                                 the update feed, drafts, media staging, the app log, the last-data cache
  routes/web.php                 every path that is not /api → public/spa/index.html
  routes/api.php                 /api/native/*, /api/drafts, /api/cache (on the phone only)
  database/migrations/           drafts, cache, alarm plan (the phone's SQLite; one write at a time, P78)
  resources/spa/                 the interface: its own Vite project (Vue 3, strict TS, Tailwind; fonts and icons bundled)
    src/main.ts
    src/app/                     not a module: start-up, loader, languages, session, the phone's behaviour
                                 (P57–P79: network, lifecycle, Back, secure store, lock, permissions, writes, links,
                                 updates, keyboard, log, drafts, media), the frame (bars, drawer, sheets, dialogs)
    src/components/              the phone kit's pieces (rows, tick, pills, rich text on Tiptap, …)
    src/modules/{module}/        only the modules the phone shows: module.ts, screens/, sheets/, composables/, locales/, tests/
  scripts/  build-web.sh (resources/spa → public/spa) · make-images.mjs · release.sh
packages/shared/                 used by web/ and mobile/: the API client and types, permission names,
                                 status workflows, formatters, module keys
```

- The interface calls the remote API directly with the token from secure storage (P57); the embedded Laravel never stands between them for data.
- `web/` and `mobile/` share only `packages/shared`. No screens, components or layouts cross; a test checks it (P90).
- The repo root is an npm workspace: `web`, `mobile/resources/spa`, `packages/*`.

## Why

A narrowed web app behaves like a web page on a phone. An app built for the phone from the first line is what people experience as an app: the keyboard never covers what you type, Back does what Android users expect, work survives Android closing the app, it opens with no signal. Sharing only the API client, types and rules keeps the two apps agreeing on data without tying the phone to desktop layouts.

## Extension point

`templates/mobile/` (the app) and `templates/shared/` (the shared package and the workspace). An existing phone app moves to this shape the next time it is worked on.
