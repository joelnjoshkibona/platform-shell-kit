# P116 · Motion explains a change, never decorates

Status: **decided** (kit 1.31.0). Amends P8 (page curtain), P9 (sidebar motion), P11 (design-system motion tokens), P25 (Refresh), P40
(list rows) and P101 (tabs).

## Why

The web app gave little feedback when something arrived, left, changed or was refused: dialogs vanished on close, a new or deleted row
just appeared or disappeared, a refused form gave no sign where to look, and numbers, bars and charts appeared without telling the eye
what had moved. Motion fixes that when every motion answers one question, **what just happened**, and comes from one shared piece, so it
looks and times the same everywhere and can be switched off in one place.

## Rules

- Something **arrived, left, moved, changed or was refused**: those are the only reasons to move. Nothing loops (spinners aside), nothing
  moves on hover beyond colour.
- **First view and real changes only.** Data draws in the first time it is in view and again when its value really changes. A changed
  query (filter, sort, search, scope) moves nothing; a re-render moves nothing. Nothing plays behind the page curtain (P8).
- **Exits animate.** Nothing that leaves the screen vanishes; exits are faster than entrances and ease in.
- **One token set** (CSS, `assemble.py`): `--dur-fast` 120ms, `--dur-base` 180ms, `--dur-slow` 280ms,
  `--ease-standard` `cubic-bezier(.2,.8,.2,1)`, `--ease-exit` `cubic-bezier(.4,0,1,1)`.
- **Reduced motion** (`prefers-reduced-motion: reduce`): everything is off. Values show at once; nothing shakes, staggers or tweens;
  dialogs and rows appear and go without delay; everything still works. Code that holds an element while it leaves waits `motionMs(ms)`,
  which is 0 then.

## The nine motions

| # | Motion | Trigger | Timing | Where |
| --- | --- | --- | --- | --- |
| 1 | **Dialogs and sheets, in and out** | Open, close (button, Escape, overlay) | Dialog: scale .96→1 + fade, 160ms in, 120ms out (`--ease-exit`). Below 640px it slides up (280ms) and down (200ms). Sheets slide 280ms in, 200ms out. Overlay fades both ways | `Dialog`, the AppDialog stack (`closeDialog` plays the exit before removing), `Sheet`. Escape still closes the top-most only |
| 2 | **List rows** | Same query: first load, rows added, rows removed, a row's data changed (after Refresh, P25) | First load: 6px rise, 30ms stagger, first 8 rows. New: primary at 12% fading over 1.2s. Changed: one 1s flash. Deleted: height + fade collapse, 180ms. Reorder: 180ms | `useListMotion` inside `ListRows` (P40), so every list has it. A changed query, more than 5 added or 20 removed, or adds and removes at once animate nothing |
| 3 | **Tabs** | Choosing a tab | Pill slides 180ms; panel fades in 120ms (not on first render) | `Tabs` (every strip, P101), `TabPanel` on details pages |
| 4 | **Save bar** | Staged changes appear / are saved or discarded (D42) | Slides up 280ms; Save shows "Saved" 900ms, then slides away 200ms | The staged-edit save bar |
| 5 | **Refused submit** | A submit that returns field errors | The first field with an error shakes once (6px, 300ms) and gets focus; error text slides down 180ms | `motionInvalid(root)` from AppDialog footers, full-page forms, DocLines' line form, sign-in, 2FA and recovery |
| 6 | **Numbers** | A value changes | Tween 400ms ease-out, tabular figures; KPI tiles count up from 0 on first view (700ms) | `Num` on KPI tiles, tab counts, document totals |
| 7 | **Skeleton and collapse** | Loading → content; opening a collapsible part | Skeleton out 100ms, content in 180ms. Collapse opens 180ms, closes 135ms | Organisation switch, ApiSelect options, `Collapse` (e.g. a row's "+n more", advanced filters) |
| 8 | **Press** | Pressing a button or a clickable row | 80ms; buttons to 98%, rows to 99.5% (a full-width row moving 2% reads as a jump) | Every `Button`; clickable `ListRows` rows |
| 9 | **Data draws in** | First view; a real change of value | Bars fill 600ms (old → new on change), stagger 40ms capped at 12; charts: series draw 700ms, updates 500ms (columns grow from the baseline, lines reveal, pies sweep); sparks draw 700ms; a dashboard settles in under about a second | `Meter` for every percentage bar; `chartMotion()` applied to every Highcharts chart by `loadHighcharts` (P96); `.spark` lines; `useDrawIn` for a module's own drawing |

## Shared pieces (`prototype/src/parts_motion.js` and the CSS in `assemble.py`)

| Piece | What it does |
| --- | --- |
| `reducedMotion()`, `motionMs(ms)` | Whether the person asked for reduced motion; a wait that is 0 then |
| `motionShake(el)`, `motionInvalid(root)` | One 6px shake; after a refused submit, focus the first field showing an error and shake it |
| `<Num :value :format count>` | A number that tweens to its new value; `count` counts up from 0 on first view |
| `<Collapse :duration>` | Wraps one `v-if` child: height + fade in and out |
| `<TabPanel :name>` | A tab's content: a 120ms fade when the tab changes |
| `useListMotion(rows, keyOf, sigOf)` | Decides a list's motion from what changed between two renders of the same query (`sigOf` is the query) |
| `useDrawIn(el?)` | A ref that turns true the first time the element is in view, and never behind the page curtain |
| `<Meter :value axis delay duration instant>` | Every percentage bar's fill; `axis="y"` for columns; `instant` for live meters (a countdown) |
| `chartMotion()` | The one Highcharts option set (off under reduced motion) |
| CSS | `.dlg-panel`, `.dlg-ov`, `.dlg-out`, `.lr-rise`, `.lr-new`, `.lr-changed`, `.lr-move`, `.tab-ind`, `.tab-in`, `.savebar-*`, `.xfade-*`, `.opt-in`, `button.press`, `div.press-row`, `.spark`, `.spark-wait`, `.spark-area`, the error-line slide |

## Checks

- `tools/prototype-shots/motion-check.cjs` and `data-check.cjs` drive every motion in a browser at 1280 light, 390 dark and with reduced
  motion: no console errors or warnings, no sideways scroll, exits still in the DOM mid-transition, values final at once under reduced
  motion, nothing replayed on a re-render.
- The Design system page's **Motion** tab shows the tokens and a live demo of each motion, with Replay.
