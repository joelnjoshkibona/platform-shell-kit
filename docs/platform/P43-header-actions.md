# P43 · Top-bar actions always sit at the right

Status: **decided when this note merges**, from SOMA (found while checking the Settings and Timetable screens at 1280px).
Builds on P2 (app shell: top bar) and P22 (contextual search).

## Decision

- The top bar is: Menu button · page title (left) · module search (when the page has one) · actions (right): View as, Exit view, theme, notifications, account.
- The **actions group is always pushed to the right edge**, whether or not the page has a search box. When a search box is there, the actions sit 8px after it.
- The title truncates before the actions move; the actions never wrap.

## Why

The actions used `margin-left: auto` on phones but a fixed 8px margin from 768px up, which only worked because the search box took the space. On pages without search (Settings, Design system, any product page with no list) the icons sat right after the title, so they jumped between pages.

## Contract

- **Prototype:** `parts_shell.js` → the actions `div` is `ml-auto` always, plus `md:ml-2` only when `SEARCH_SCOPE[G.view]` exists.
- **Web:** `AppHeader.vue`, same rule; a visual test shoots one page with search and one without at 1280px.
