# P50 · Row actions on tight rows sit level with the title

Status: **decided** (kit 1.5.0). Amends P40. Raised by the DevBiz owner: on phones every row ended in a line holding
only the ⋮ button.

## Decision

- When a ListRows card is tight (its own width; phones), the row's `#actions` slot takes the chevron's place: top
  right, level with the title, `max-content` wide.
- The row still opens on tap (the actions stop the tap). A row without actions keeps its chevron.
- Wider cards are unchanged: actions have their own column before the chevron.

## Why

The extra line made every row taller by one line for one small button, so a phone showed a third fewer rows, and the
button sat far from the name it acts on.
