# P98 · The user guide (Help and guides)

Status: **decided** (kit 1.17.0). The owner, 2026-11-07: "We could also have a user guide too since the system needs to document its features and steps and actions on how to complete something with screenshots markers 1, 2, 3 etc. that are explained in text." Then: in the app **and** as HTML. Proposal `docs/proposals/P94-P98.md`.

The build guide (P91) is for the people who **build** the product. This guide is for the people who **use** it.

## Decision

- **One article per task** a person does ("Export a list", "Bring back something you deleted"), grouped by module. Each says what the task is for, **who can do it** (the permission in words), the steps, what happens next and related articles.
- **Numbered screenshots**: a step that shows a screen has a picture with markers ①②③ drawn on the exact buttons and fields, and a legend under it. The text uses the same numbers: "Tap **Export** ①".
- **Written in Markdown**, in `docs/help/articles/<lang>/<id>.md`, with front matter and a small shot spec:

```markdown
---
id: restore-from-trash
title: Bring back something you deleted
module: Trash
screens: trash
who: People with "Restore from trash"
related: find-records-in-a-list
---
Deleted records wait in the trash for 30 days …

::: shot route=trash
1 = main [role=tablist]  Show one module at a time
2 = main button[aria-label^="Filters"]  Filter by who deleted it, or when
3 = main button:has-text("Restore") || main button[aria-label^="Actions for"]  Bring it back
:::

1. Tap a module tab ① …
```

  - `route=` is a route or a link (`route=#/locations/ARU-01?tab=users`); `> click`, `> waitfor`, `> wait`, `> hash` lines run before the picture (open a tab, wait for a chart).
  - A marker is `N = <selector><two spaces><what it is>`; `A || B` gives a different selector on a phone (where a button may sit in a row's actions menu).
  - `phone=no` or `desktop=no` takes one picture only.
- **`tools/help/build.js`** opens each screen in the prototype (served offline like the screenshot tool), runs the steps, finds each marker, scrolls them into view, draws the rings and numbers, and saves `docs/help/shots/<id>-<n>__desktop.png` (1280, light) and `__phone.png` (390, dark). It writes:
  - `docs/help/help.json`: the articles as data (the app's Help reads it);
  - `docs/help/index.html`: one page with every article and a search, to share or print;
  - the prototype's `src/parts_help_data.js`, so the prototype's Help shows the same articles.
- **In the app**:
  - **Help and guides** (the link at the foot of the sidebar): a search, the articles by module, and an article page with its pictures (the phone picture on a phone), the legend, "Who can do this" and "See also";
  - a **How do I…** button in the top bar on every screen: a sheet listing the articles whose `screens:` include this screen, and a link to all of Help;
  - each article has an address: `#/help/<id>`.
- **Kept true by checks**:
  - `node tools/help/build.js --check` fails when a marker's element is missing, the markers do not fit on one screen, a picture is missing or an output is out of date. `tools/help/test/run.sh` proves it fails, naming the marker.
  - P92's `tools/guide/check.sh` now also fails a pull request that changes a screen (`web/src/modules/*/pages/`, `mobile/resources/spa/src/modules/*/screens|sheets/`) without changing `docs/help/`, unless a commit says `Help: no change` and why. It runs the `--check` whenever articles, the help tool or the prototype change.
- **Languages**: English first. Another language is another folder (`docs/help/articles/sw/`), and the app shows the person's language.
- **In a product**: `docs/help/` holds the kit's core articles (copied with the kit) plus the product's own, and the product's implementation plan gives each screen step its article. Once the real app runs, the same specs take the pictures from the app (Playwright against the running app), so they show real screens.

## Extension point

`docs/help/articles/<lang>/*.md` (an article's `screens:` lists the routes whose How do I… offers it); `tools/help/build.js`.
