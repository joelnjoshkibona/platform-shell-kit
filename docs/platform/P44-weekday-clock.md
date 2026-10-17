# P44 · The demo clock is a weekday

Status: **decided when this note merges**, from SOMA (attendance and timetables had nothing to show on the kit's Saturday).

## Decision

- The prototype's one clock, `TODAY`, is **Monday 12 October 2026, 12:00 EAT** (was Saturday 10 October). `NOW` in the respondent part is the same day.
- Every seeded date, relative time ("2 days ago"), date-picker "today", export file stamp and "updated" stamp derives from `TODAY` (`isoDay(TODAY)`, `daysAgo(n)`, `fmtDay`). No part hard-codes today's date.
- A product may move `TODAY` only to another **weekday**, and says so in its D-log.
- The real app uses the server clock; this is a prototype and screenshot rule only.

## Why

Products with working days (school registers, timetables, shifts, deliveries) showed an empty "today" on a Saturday, so every product had to fake a second "last working day" clock. One weekday clock removes that and keeps screenshots stable.

## Contract

- **Prototype:** `parts_list.js` → `TODAY`; `parts_resp.js` → `NOW`; location save stamps `fmtDay(isoDay(TODAY))`; Design system date demo uses the same day.
- **Screenshots:** regenerated; dates move forward two days where they are relative.
