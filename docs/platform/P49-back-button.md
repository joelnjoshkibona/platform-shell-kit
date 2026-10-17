# P49 · Back on every record page

Status: **decided** (kit 1.5.0). From DevBiz, whose shop pages had `BackButton` while the platform's own record pages
(role, location, approval request) had only a breadcrumb.

## Decision

- Every record page starts its breadcrumb with **Back**: outline `h-7` button, ArrowLeft and the word "Back",
  `aria-label` "Back to <screen>".
- Back returns to the screen the person came from: a list with its filters and sort, another record and its tab, Home.
  The shell keeps that trail; it is not the browser's history, so it still works in the phone app and after links
  inside the app.
- With no trail (a pasted link, a reload) Back goes to the record's list (`BACK_PARENT`).
- The crumbs stay: Back is the one control a phone user can reach without the browser's own button.

## Why

On a phone the breadcrumb's first crumb is small and means "the list", not "where I was". In the phone app there is
no browser back button at all.

## Extension point

`BACK_PARENT` in `parts_links.js`: record route → its list. A product adds its own records. A product with its own
trail rule (DevBiz: `?back=` on links into a record) keeps the same button, look and place.
