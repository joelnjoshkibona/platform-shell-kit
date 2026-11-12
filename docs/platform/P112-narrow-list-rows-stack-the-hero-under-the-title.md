# P112 · On a narrow list, the status and hero sit under the title

Status: **decided** (kit 1.26.0). Amends P40. The owner's review of Max Yield's prototype on a phone, 2026-11-11 ("this display looks worse"). Tested in Max Yield's copy of `parts_listcard.js` (`ListRows`) and ported here with P107–P111.

## Why

P40 folds columns as a list gets narrower, but the **hero** (for example the total) and the folded **status** always kept a column on the right. On a phone, and more so in a list card inside a details tab, that column (a pill such as "Awaiting payment" over "TZS 22,500,000") takes about 130px. The title was left with about 110px, so a record number broke mid-word (`MXOR261` / `0-0003`) and the meta line broke inside a code (`MXPF2610-0` / `003`).

## Decision

- **A tight row is measured, not guessed.** The widest title on the page is compared with the room left beside the widest status pill or hero (and the identity must keep at least 170px beside them). When the title does not fit, the row **stacks**:
  - line 1: the title, with its badges;
  - line 2: the status pill, then the hero (semibold, tabular figures);
  - then the meta line and "+N more", as before.
- A stacked row has no right-hand column; the chevron (or the actions, P50) stays level with the title. The header row then shows only the identity heading.
- Wide rows are unchanged. One decision per list, so all its rows look the same.

## Extension point

None: it is `ListRows` behaviour; modules declare columns as before (P40, P87).

## In the kit

At 360px and 390px, the lists whose titles are long (Locations, Approvals, Scheduled tasks, Trash, My exports and reports; Users and Queue at 360px; Trash also at 430px) now stack; lists whose titles fit beside the status keep the right-hand column. Desktop widths are unchanged.

## Tests (kit check)

- At 360px and 390px, a list with long titles (Scheduled tasks) shows its status and hero on a line under each title, with no right-hand column.
- A list whose titles fit (Queue at 390px) keeps the right-hand column; at 1280px no list stacks.
- No horizontal scroll at any width.

`tools/prototype-shots/decisions.test.js` runs them in the browser.
