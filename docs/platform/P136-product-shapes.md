# P136 — Product parts: the api, the web app and the phone app, in any combination

Status: decided 2026-11-24 (the owner), from what a product did by hand (its phone repository's commit `8205288`: "Keep
only the phone app, at the repository root"). Amended the same day: first two shapes (full, and a phone app for
another server), then any set of parts ("User can need api only or web only or phone only"). Amends the product starter
(`tools/new-product`), the generator engine and a build in the Project Generator; builds on the backend adapter (P117).

## Decision

1. **A product picks its parts**: any non-empty set of **api** (the server), **web** (the web app) and **phone** (the
   phone app). `full` names all three and `phone` the phone app alone, so products made with the first version of this
   decision still read.
2. **Where they sit.**
   - **One part** sits at the **repository root** (a phone app's Laravel at the root; the api's Laravel at the root; the
     web app's `package.json` at the root), with the shared code (`@bootbox/shared`) in `shared/`.
   - **Two or more parts** keep Bootbox's folders: `api/`, `web/`, `mobile/`, `packages/shared`.
3. **A part is self-contained in Bootbox.** Its own dependencies and lock, its own tests, the shared code found where it
   sits (`packages/shared` or `shared/`), and every file it needs at run time inside it (the api's help guide is in
   `api/resources/help`). A check that spans two parts (the default accent is the same in the web and the phone; the
   web's export strings are the api's copy) runs where both are and is skipped when one is absent. Every reach out of a
   part is listed with its reason, and a release check fails on a new one.
4. **A shape is a layout, not a fork.** Nothing Bootbox owns is edited after the copy beyond the product's name and its
   settings, so a product of any layout takes Bootbox's later changes as a patch at its own paths
   (`new_product.py --take product.json`).
5. **A screen app without the api** (web, phone, or both) is for another server:
   - it names that server's API URL (`VITE_API_URL`, `BOOTBOX_API_URL`);
   - it talks to it through its adapter in `src/backend/` (P117), each capability the server lacks turned off (the
     shell hides what is off) and the menus coming from the adapter;
   - a phone app keeps its data **connected** or **on the phone**, never sync (sync needs Bootbox's `/sync/*`);
   - it is the **shell only** and has **no generated modules** (they call Bootbox's endpoints): its modules are written
     by hand against its server;
   - it is checked by typecheck, unit tests, a build and an end-to-end start that needs no server.
6. **Generated modules need the api.** The engine writes a module's web screens when the product has the web app and
   its phone screens when it has the phone app; a part that is not there is skipped, not an error.
7. **An api without the web app is headless**: no web build is served (`FRONTEND_URL` empty: a page outside `/api`
   answers 404), and `deploy.sh` deploys the api alone.
8. **A phone app at the root** leaves out of its app bundle what only the repository needs (`docs`, `brand`, `tools`,
   `shared`, `.github`, `kit.json`, `product.json`, `CLAUDE.md`), since NativePHP bundles the whole app folder.
9. **Made by the starter and by a build.** `new_product.py --parts api,web,phone` lays a product out (`--shape full` and
   `--shape phone` still work). The Project Generator offers the parts on a project, refuses module specs without the
   api and builds what the parts allow. A release check makes each single part (and api with phone) and runs that
   part's own checks.

## Why

A product that needs one part had no way to start without carrying the others: a phone app for someone else's server
carried a server, a web app, deploy and CI it never uses; a server for another team's screens carried two apps. A product
removed them by hand; the next product would again. Keeping every part self-contained in Bootbox is what lets a reshaped
product still take Bootbox's fixes.

## Not decided here

Packages copied into a product (push, share-file, biometric, devserver, splashscreen, escpos-printer) move to their
own repositories and are installed by version; that is being done from a product and taken by Bootbox when the
versions exist.
