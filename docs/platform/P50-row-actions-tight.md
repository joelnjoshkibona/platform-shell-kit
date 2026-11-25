# P50 · Row actions on tight rows sit level with the title

Status: **decided** (kit 1.5.0). Amends P40. Raised by the owner: on phones every row ended in a line holding
only the ⋮ button.

## Decision

- When a ListRows card is tight (its own width; phones), the row's `#actions` slot takes the chevron's place: top
  right, level with the title, `max-content` wide.
- The row still opens on tap (the actions stop the tap). A row without actions keeps its chevron.
- Wider cards are unchanged: actions have their own column before the chevron.

## Amended (1.6.0): only when the name keeps its room

- The actions move up only while the identity column keeps **at least 140px** beside them: the 40px icon tile plus a readable name. The card measures this itself, from its own width, `actionsWidth`, and the status and hero column.
- **When the name would be squeezed, the actions keep their own line** under the meta line, as P40 had it. This happens with a labelled button such as *Record*, or with a hero amount beside two buttons. On a 390px phone, such a tenant's name otherwise broke one letter per line.
- A ⋮ menu, or one or two icon buttons, still sits level with the title on every phone width the kit tests.

## Why

The extra line made every row taller by one line for one small button, so a phone showed a third fewer rows, and the
button sat far from the name it acts on.

## Amended (1.58.0, 2026-11-25): behind one ⋮, never a line of their own

The review at phone width found every list row about 110px tall when the actions kept their own line (13 modules took
three screens). **When the actions cannot sit level with the title (the 140px rule above), they wait behind one ⋮ in the
chevron's place**: a 32px button that opens the row's own actions in a small popover. The row keeps one line of height
for its name and meta, and the actions stay next to the record they act on. This replaces "the actions keep their own
line" of 1.6.0.
