# P45 · Recent activity belongs to one organisation

Status: **decided when this note merges**, from SOMA (the kit's single activity list showed Kilima Retail entries in every organisation).
Builds on P12 (shared core, `organization_id` everywhere), P23 (View as) and the activity log behind every History tab.

## Decision

- The **Recent activity** card (Dashboard, Location › Overview) reads the activity log of the **current organisation only**. Switching organisation replaces it.
- Each entry carries the location it happened at (or none, for organisation-wide changes such as roles and settings).
  - **Dashboard:** the organisation's latest five entries the viewer may see.
  - **Location page:** the latest five entries at that location or below it (its subtree).
- **View as** (P23) narrows the card to the previewed person's locations, like every other card.
- Actions taken in the session appear at the top at once ("Just now"), for example saving or moving a location.
- An empty feed says so: "Nothing has happened in {organisation} yet." / "Nothing has happened here recently."

## Why

Activity is tenant data. A global list leaks one organisation's names into another and makes the demo look broken after a switch.

## Contract

- **Prototype:** `parts_loc.js` → `ACTIVITY` keyed by organisation id, `activityOf(locId?)` and `logActivity(entry)`; products push their own entries per organisation.
- **API:** `GET /activity?location={id}&limit=5` reads `activity_log` scoped by `organization_id` and, with `location`, by the location closure table; results are filtered by the caller's effective locations.
- **Web:** `RecentActivityCard` takes an optional `locationId`.
