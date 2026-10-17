# P46 · Any brand colour, with contrast enforced

Status: **decided when this note merges** (kit, 2026-10-17, from the Pangisha build: its deep green is not one of the six P41 accents).
Builds on P41 (the organisation's accent recolours primary and the curtain) and P8 (the page curtain). **Amends P41:** the accent is no longer limited to six keys.

## Decision

- **The organisation picks it, not each person.** One accent per organisation, set by the owner (Settings permission) in Settings › Brand colour. People still choose Light, Dark or System for themselves; that is the only personal colour choice. One look per organisation keeps support, training, screenshots and visual parity (P37) working.
- **Any colour.** The picker offers the six P41 presets plus **Custom**: a hex field and 12 suggested colours. No native colour input (P26).
- **One input, everything derived.** The owner picks one colour, which is the **light-theme primary**. The kit works out everything else, in both themes: `--primary`, `--ring`, `--primary-foreground`, `--curtain` and `--curtain-fg`. Nobody types a foreground, a dark shade or a curtain colour.
- **Contrast is enforced, not trusted.** These rules hold after derivation for every colour:

  | Rule | Minimum | Both themes |
  |---|---|---|
  | Button text on primary | 4.5:1 | yes |
  | Primary (links, focus ring) against the page | 3:1 | yes |
  | Curtain text on the curtain | 6:1 | yes (P41) |

- **Failing colours are adjusted, not refused.** If the picked colour fails in light mode, its lightness is lowered until it passes, and the picker says so: *Adjusted for readability*, with before → after chips. The dark shade is always derived. A bright yellow `#FFD400` becomes `#877100` in light mode, for example.
- **What follows the accent:** primary buttons, links, focus rings, active controls, the organisation badge, sign-in, and the page curtain. **What never does:** backgrounds, borders, status colours (success, warning, destructive and the product's status tones), chart colours c1–c5 and form accents (Fomu). Their meaning can't change with a brand.
- **Sign-in and first paint.**
  - The server HTML carries the product default tokens. A small inline script swaps in the **last accent this browser saw**, before anything paints, so the boot curtain and sign-in are already in the right colour.
  - Sign-in itself doesn't know the organisation yet, so it keeps that last accent. It never shows another organisation's colour on purpose.
  - A product served on a **per-organisation domain** (one instance per customer, e.g. Pangisha D1) inlines that organisation's tokens in the server HTML, so even a first visit is in its colour.
- **When it applies:** on sign-in, on organisation switch and on first load. For the owner who changes it, it applies at once (live preview). For everyone else, it applies from their next page.

## Derivation

Input: a preset key, or `#rrggbb`. Presets return their P41 table values, which all pass the rules. For a custom colour (HSL `h s l0`, hue and saturation rounded):

| Token | Start | Then |
|---|---|---|
| light `--primary` / `--ring` | `h s min(l0, 60)` | darken in 0.5% steps until near-white text (`0 0% 98%`) is at least 4.5:1 |
| light `--primary-foreground` | `0 0% 98%` | |
| dark `--primary` / `--ring` | `h min(s,85) clamp(l0+20, 46, 80)` | lighten until near-black text (`240 10% 4%`) is at least 4.5:1 |
| dark `--primary-foreground` | `240 10% 4%` | |
| light curtain | the dark primary, text `h min(s,80) 8%` | lighten until 6:1 |
| dark curtain | `h min(s,58) 13%`, text `h min(s,40) 92%` | darken until 6:1 |

Passing the button-text rule also clears the 3:1 page rule, because the page is near-white in light and near-black in dark. The checks run anyway.

`adjusted` is set when the light primary moved more than 0.5% from the picked lightness: `{ from: '#ffd400', to: '#877100' }`.

The reference implementation is `deriveAccent` and `accentChecks` in `prototype/src/parts_helpers.js`, between the `ACCENT-CORE` markers.

## Contract

- **API.**
  - `PATCH` the organisation's `branding.accent` with a preset key or `#rrggbb`.
  - Anything else gets **422** with `branding.accent: "Pick a preset or a colour like #166445."`. That is the only refusal; a colour that fails contrast is adjusted, never refused.
  - The server runs the same derivation (a PHP port) and stores `branding.accent` (what was picked) and `branding.accent_tokens` (the ten derived values plus `adjusted`). The response returns both.
  - The port must reproduce `docs/platform/p46-accent-vectors.json` exactly (a unit test). Server and web therefore never disagree, and the stored tokens are what every client paints.
  - Existing P41 rows (`teal` … `slate`) need no migration.
- **Web.**
  - `applyAccent(value)` writes one `<style id="org-accent">` with both themes (`:root:root` so it outranks the product tokens wherever it lands). It also stores that CSS under `<storageKey>-accent` for the boot script.
  - The built app applies the server's `accent_tokens` and derives only for the picker's live preview.
  - `accChip(value)` gives the four variables the `.acc-chip` class uses, for badges and swatches drawn in some organisation's colour, not the current one.
- **Component:** `AccentPicker` (see COMPONENTS.md › Accent picker): full in Settings, compact in Create organisation.
- **Product:** `PRODUCT.accent` is the default for new organisations and the server-HTML tokens; it may be a preset key or a hex. The product's tokens in `builder.html` must equal `deriveAccent(PRODUCT.accent)`.
- **Tests:** `tools/prototype-shots/accent.test.js`.
  - Unit checks: every preset and 5,000 random colours pass all six rules after derivation, and malformed values are rejected. The vectors file must also be current.
  - Browser checks: a custom colour sets `--primary`, `--ring` and `--curtain` in both themes. The next load's boot curtain and sign-in use it. Switching organisation applies that organisation's accent.
  - Screenshot state `workspace--custom-accent`.

## Why

P41 gave each organisation its own colour, but only six. Real brands, starting with Pangisha's deep green, are rarely one of six. Contrast was the reason P41 refused a free picker, and contrast can be computed. With every derived value checked against fixed minimums, a free choice can't produce an unreadable button, an invisible focus ring or a curtain without legible text.

Keeping the choice at the organisation level, with personal choice limited to Light, Dark or System, keeps one look per organisation for support, docs and visual tests.

## Amends

- **P41:** "one of the six kit accents" becomes "a preset or any colour, derived and checked". The API accepts `#rrggbb` as well as the six keys. The six stay as the presets.
- **P8:** unchanged beyond P41. The curtain pair is derived for custom colours, with the same 6:1 rule.
