# P110 · A product registry, loaded before the shell

Status: **decided** (kit 1.26.0). Proposed by Max Yield (kit 1.25.0), tested in its copy of the prototype (its access registry, `assemble.py` and `parts_shell.js`) and ported here with P107–P112.

## Why

Two things a product must give the shell could only be given by editing the shell's own file:

1. **Its detail pages.** The shell decides which routes are its own pages (rendered inside the shell, with a breadcrumb and Back) and what each page's title is, from **hard-coded lists in `parts_shell.js`**. Max Yield's key account, proforma, order and payment pages had to be added to those lists.
2. **Its permissions and role defaults.** The README's extension points were the `PERMS` and `ROLES` arrays *inside* `parts_shell.js`, and the shell builds its menus and role lists from them as it starts. A product that edits them there loses its edits, or has to re-apply them, on every kit update (products pull kit changes, P94).

## Decision

- **A product keeps one registry file**, `parts_product.js` (prototype) or `web/src/product/registry.ts` (app). It is **loaded before the shell builds anything**, and declares:
  - `permissions`: its `Module.action` catalogue (P21), merged into `PERMS` (before the core ones);
  - `roles`: `{ <role id>: { perms, desc? } }`, what each role gets of the product's permissions by default, merged into `ROLES` before the role's core permissions, and how the product describes the role. The Owner gets everything. An id the shell does not have is added as a role (`{ name, desc, system?, perms }`);
  - `detailRoutes`: `[{ route, title(G), parent? }]`, its pages that live inside the shell. The shell's route check and page titles read this list; `parent` is the menu route the page belongs to (highlighted in the sidebar, and its permission applies).
- **The shell's access and route code names no product route, permission or role default.** With an empty registry the shell runs with the core modules only.
- The kit's own core modules (Users, Roles, Locations, Approvals, Reports, …) keep registering themselves as they do now (P81/P82); the registry is for the product. `form` (P100's form opened as a page) is a core route and stays in the shell.
- In the app this is what module manifests already do (P81). The prototype gets the same shape, so a module is added to both the same way.

## Extension point

`parts_product.js` (prototype; `assemble.py` puts it first, inside the shell module) / `web/src/product/registry.ts` (app).

## Fomu

Fomu's permissions (`Forms.*`, `Templates.list`, `Responses.*`) and its role defaults (and the words its roles are described with) moved from `parts_shell.js` into Fomu's `parts_product.js`. Fomu has no detail page inside the shell (its builder, results and respondent views are full-screen, outside it), so its `detailRoutes` is empty. Fomu behaves the same: the permission catalogue, the roles and each role's permissions are unchanged.

Still in `parts_shell.js`, as before P110 and outside its scope: Fomu's `MENU` items and its Forms list and Templates pages (README: "Sidebar menu items", "Pages per route").

## Tests (kit check)

- With an empty registry, the shell runs with only the core modules (core catalogue, no product menu item, no errors).
- A route in `detailRoutes` opens inside the shell with its title and its parent's menu item; one not listed does not.
- The registry's role words and defaults are the ones the shell shows.
- `parts_shell.js`'s permission catalogue, roles, route check and page titles name no product route or permission; `assemble.py` loads `parts_product.js` first, inside the shell module.

`tools/prototype-shots/decisions.test.js` runs the first three in the browser; `tools/kit-check.py` checks the last.
