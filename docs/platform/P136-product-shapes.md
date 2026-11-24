# P136 — Product shapes: full, and a phone app for another server

Status: decided 2026-11-24 (the owner), from what the Jumla product did by hand (jumlaapp-nativephp `8205288`: "Keep
only the phone app, at the repository root"). Amends the product starter (`tools/new-product`) and builds a product in
the Project Generator; builds on the phone backend adapter (P117).

## Decision

1. **A product has a shape.**
   - **full** is the server (api), the web app and the phone app, the phone app in `mobile/` (today's layout).
   - **phone** is only the phone app, at the **repository root**, for a server that is not a Bootbox api (Jumla's is
     Ongeza).
2. **A shape is a layout, not a fork.** The phone app is self-contained in Bootbox: its own npm dependencies and lock,
   nothing borrowed from `web/`, and its shared code (`@bootbox/shared`) found through one path setting. So the same
   files serve both shapes, and a phone-only product takes Bootbox's later changes as a plain patch:
   `git diff <bootbox_commit> main --relative=mobile -- mobile`, then `--rename`.
3. **A phone-only product:**
   - names its server's API URL (`BOOTBOX_API_URL`);
   - talks to it through its adapter in `src/backend/` (P117), with each capability the server lacks turned off (the
     shell hides what is off);
   - keeps its data **connected** or **on the phone**, never sync (sync needs Bootbox's `/sync/*`);
   - has no Kernel or Core API modules and **no generated modules** (they call Bootbox's endpoints): its modules are
     written by hand against its server;
   - keeps the shared code in `shared/`;
   - leaves out of its app bundle what only the repository needs (`docs`, `brand`, `tools`, `kit.json`,
     `product.json`, `channels`), since NativePHP bundles the whole app folder;
   - releases through its release channels, not through a Bootbox api's Phone releases;
   - is checked by typecheck, unit tests, a `vite build`, `php artisan test` and the end-to-end tests that need no
     server (the start and the phone's own pages).
4. **Made by the starter and by a build.** `new_product.py --shape phone --api-url …` lays it out. The Project
   Generator offers the shape on a project, refuses module specs on a phone-only one and builds the shell only. A
   release check makes one and runs its checks, so a phone change that reaches outside the app is caught.

## Why

A phone app that talks to someone else's server had no way to start without carrying a server, a web app, deploy and
CI it never uses, and its packages borrowed from `web/`. Jumla removed them by hand; the next product would again.
Keeping the phone app self-contained in Bootbox is what lets a reshaped product still take Bootbox's fixes.

## Not decided here

Packages copied into a product (push, share-file, biometric, devserver, splashscreen, escpos-printer) move to their
own repositories and are installed by version; that is being done from the Jumla product and taken by Bootbox when the
versions exist.
