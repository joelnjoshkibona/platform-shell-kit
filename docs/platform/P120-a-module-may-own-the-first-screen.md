# P120 · A module may own the first screen; the messaging pieces

Status: **decided** (kit 1.36.0). Amends P93 (the phone app's Home) and P82 (what a module declares). Built in a product's phone
app (an SMS app whose first screen is its conversations), tested on an emulator and lifted into `templates/mobile/`.

## Why

- The kit's phone Home is "my work": cards from the modules and quick ways in. A product that is one thing (a messaging app,
  a till, a scanner) opens on that thing. Nothing said how, so each would have edited the router by hand.
- Such a product needs pieces the library did not have: a row that swipes to an action, Undo instead of a confirmation, a
  first run that asks one thing at a time, and a conversation (bubbles with a state each, a composer that counts SMS parts).
  Under the library rule (a missing component is added to the library first), they are kit pieces, written in neutral
  words so any product with messages can use them.

## Decision

### The first screen

- `defineModule({ home: true })`: that module's route named `home` (path `''` under `/:org`) is the first screen. The
  platform's Home module says `home: 'fallback'` and is left out when a module claims the first screen. **At most one
  module may**: two throw at start-up.
- The drawer leads with that module's menu group. Menu links can carry numbers: `badge` (stands out: unread) and `count`
  (quiet: how many), each a function read when the drawer opens.
- Back on that screen is P52's "press again to leave". The bottom bar shows only if the route says `meta.tab`.

### The pieces (COMPONENTS.md › Phone)

| Piece | What | Rule |
| --- | --- | --- |
| `SwipeRow` | a row swiped sideways to one action per side; arms at 96px with a short vibration; a vertical drag cancels; a long press (480 ms) asks for the row's menu | every swipe action is also in that menu: nothing depends on a gesture |
| Toast with Undo | `toast(title, { undo })`: an Undo button and a bar that drains over 5 s | a step that can be put back (archive, delete) takes Undo, not a confirmation; something that cannot be put back keeps the confirmation |
| `FirstRun` | full screen, one step at a time: progress, glyph, title, why, the main button, Not now when the step can wait, a note after a no | P63: at the moment of need, reason first; a step already done is skipped; the product decides the steps |
| `MessageBubble` | sent (primary, right) or received (muted, left); under it the time and one state: Sending, Sent, Delivered, Not sent with Retry | one state per message, never per part |
| `Composer` | a field that grows to five lines, `{chars} · {parts} SMS`, the SIM chip on a two-SIM phone, Send | above the keyboard (`--kbd`, P62), never `position: fixed`; Send off while blank or sending (P60); the draft is kept (P58) |
| `textParts(text)` | characters, parts and room left: GSM 03.38 160 / 153 (the extension characters count twice), anything else 70 / 67 | |

## Built

- `templates/mobile/resources/spa/src/app/modules.ts` (`home`, menu `badge` and `count`), `src/app/textParts.ts`.
- `templates/mobile/resources/spa/src/components/` `SwipeRow.vue`, `FirstRun.vue`, `MessageBubble.vue`, `Composer.vue`;
  the Undo toast in the product's `toast` (the template does not carry the toast; the option is specified above).
- `prototype-phone`: Messages (P120) in the picker: conversations (swipe, Undo, the long-press menu), a conversation
  (states, Retry, the counter and the SIM chip) and first run.
