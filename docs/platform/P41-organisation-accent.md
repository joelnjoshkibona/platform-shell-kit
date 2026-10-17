# P41 · The organisation's accent recolours primary and the curtain

Status: **decided when this note merges**, from DevBiz D92, D93 and D95 (built and tested in DevBiz Phase 2: unit tests for every accent and theme, visual tests in light and dark).
**Amended by P42:** any colour is allowed, derived and contrast-checked; the six below stay as presets. See `P42-any-accent.md`.
Builds on P8 (page transitions: the curtain) and the organisation's branding setting (the accent chosen when the organisation is created, today shown only on its badge in the switcher and the picker).

## Decision

- Every organisation has one **accent**, one of the six kit accents: teal, blue, violet, rose, amber, slate. The product sets the default (DevBiz: blue, D13).
- The accent drives three things, in light and dark:
  - `--primary` and `--ring`, plus `--primary-foreground` where the accent needs a different one for contrast;
  - the page-change **curtain**: `--curtain` and `--curtain-fg`. Each accent has its own curtain pair, so the curtain always matches the primary colour (this settles the P8 curtain colour per product instead of hard-coding teal).
- Nothing else follows the accent: backgrounds, borders, status colours, chart colours c1–c5 and the radius stay the product's tokens.
- The owner (Settings permission) picks it on the workspace settings screen; it applies to everyone in the organisation from their next page load, and immediately for the person who changed it.
- The accent is applied on sign-in, on switching organisation and on the first app load. The closed curtain in the server HTML uses the last accent this browser saw, so nothing flashes.

## Why

The accent is already stored per organisation, but only a badge uses it, so the app looks the same for every organisation, and the curtain is teal in every product. One token swap gives each organisation its own colour without letting it break contrast, dark mode or visual parity. A free colour picker or full theme overrides would.

## Contract

- **API:** the organisation's `branding.accent` setting (existing). Allowed values are the six keys; anything else is refused with 422.
- **Web:** one `applyAccent(key)` that sets the five custom properties on `:root` for both themes, from a single accents table that has, per key, `l`/`d` for primary and ring, optional foregrounds, and a `curtain` pair for light and dark.
- **Tests:** a unit test for the token swap (every key, both themes, unknown key falls back to the product default). Visual tests shoot the product default; one extra check shoots another accent.

## The six accents

Primary (`--primary`, `--ring`) and the curtain pair per theme, as HSL triples. The kit ships all six curtain pairs, so a product only picks its default. Every curtain pair has a contrast of at least 6:1; they follow the teal pattern (the light theme's curtain is the dark primary with near-black text; the dark theme's is a deep shade with near-white text).

| Accent | Primary light | Primary dark | Curtain light (bg / fg) | Curtain dark (bg / fg) |
|---|---|---|---|---|
| teal | 174 72% 26% | 170 62% 46% | 170 62% 46% / 174 80% 8% | 166 58% 13% / 166 40% 92% |
| blue | 221 83% 45% | 217 91% 64% (fg 222 47% 8%) | 217 91% 64% / 221 80% 8% | 217 58% 13% / 217 40% 92% |
| violet | 262 62% 50% | 262 80% 72% | 262 80% 72% / 262 80% 8% | 262 58% 13% / 262 40% 92% |
| rose | 346 72% 44% | 346 80% 66% | 346 80% 66% / 346 80% 8% | 346 58% 13% / 346 40% 92% |
| amber | 28 90% 36% | 38 92% 56% | 38 92% 56% / 28 80% 8% | 38 58% 13% / 38 40% 92% |
| slate | 215 25% 27% | 215 20% 72% | 215 20% 72% / 215 80% 8% | 215 25% 15% / 215 20% 92% |

## Amends

- **P8 (page transitions):** the curtain colour is the organisation's accent pair above, not a fixed teal. The closed curtain in the server HTML reads the last accent this browser applied (a small inline script with the same table), falling back to the product default.
