# P111 · A related link opens the record's details page in a dialog

Status: **decided** (kit 1.26.0). Amends P85. The owner's decision while reviewing Max Yield's prototype on kit 1.25.0, 2026-11-11: "we should open a modal that pulls the details page of the selected record". Tested in Max Yield's copy of `parts_comp.js` (`RecordLink`) and ported here with P107–P112.

## Why

P85 opens a plain click on a related link as a small **preview in a side sheet**, a separate component (`preview`) that each module draws in addition to its details page. The preview shows less than the page, so people open the full page anyway. And the platform already has a better way to show another record without leaving your page: the **record dialog** of P101. Until now that dialog opened only when the link named a tab.

## Decision

- **A plain click on a `RecordLink` opens the record's own details page in the P101 record dialog**, on Overview, or on the link's `tab` when it names one. It has the record's tabs, ⤢ Full screen, **Close** and **Open full page**, and it stacks, closes and goes into the link exactly as P101 says. On a phone it is full screen (P101).
- **A module with no details page** (`page` not declared in `defineModule`) keeps the P85 side-sheet preview. Every product module that has a details page declares `page`.
- Unchanged from P85: the link is a real `href` to the full page, a modifier or middle click opens a new tab, and the cases for no permission, empty, deleted and missing stay as they are.
- The link's icon is `PanelTop` (opens in a dialog) and its label is "Open …"; `PanelRightOpen` / "Preview …" remains only for the sheet fallback.
- The **phone app** (P93) keeps its bottom sheet until it has a record dialog of its own.

## Extension point

None new: `defineModule({ page, tabs })` (P81, P101).

## In the kit

Locations and Roles declare `page`, so their links (a request's location, a location's parent, a role) open the dialog. Approval requests have no dialog page, so a link to one still opens its preview sheet. Fomu has no module of its own behind a `RecordLink`.

## Tests (kit check)

- A plain click on a link to a module with `page` opens a record dialog on Overview, and no sheet.
- A link with `tab` opens that tab.
- A module without `page` still opens the sheet preview.
- Ctrl/Cmd-click is not intercepted.

`tools/prototype-shots/decisions.test.js` runs them in the browser.
