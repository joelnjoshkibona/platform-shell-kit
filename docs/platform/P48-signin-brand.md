# P48 · The sign-in panel and the brand mark are product content

Status: **decided when this note merges** (kit, 2026-10-17, from a product whose sign-in page still showed the example's headline, quiz illustration and clipboard icon).
Builds on P1 (sign-in), P8 (page curtain) and P46 (brand colour).

## Decision

- **The sign-in brand panel** (the left half on wide screens) shows the product's own content, from `PRODUCT.signin`:
  - `headline`: one sentence, about 6–10 words, saying what the product does for the person signing in.
  - `points`: exactly three `[lucideIcon, text]` lines, each a concrete job, not an adjective.
  - `art`: the name of a registered component drawn on the panel (a small, non-interactive picture of the product's real work), or `null` for none.

  The kit owns the layout (mark and name top-left, art, headline, points, footer), the colours (the organisation's primary, P46) and the motion. The product owns only the words and the picture.
- **The brand mark.** `PRODUCT.logo` is an optional inline SVG:
  - 24 × 24 `viewBox`, strokes or fills in `currentColor`, no fixed colours, no text, no width or height.
  - Without one, the kit uses `PRODUCT.icon` (Lucide). In the boot curtain and the favicon, it falls back to the product's initial.
- `BrandMark :size` draws the mark (or the icon fallback) wherever the product identifies itself: the sidebar header (desktop and phone), the sign-in panel and phone header, the page curtain, the boot curtain in the server HTML, and the favicon.
- **The favicon** is the mark on a rounded tile in the organisation's light primary, redrawn by `applyAccent` (P46), so it follows the brand colour.
- Nothing else in the shell carries product identity. The example's content moves to `product.js` (`signin`) and `ExampleSignInArt`.

## Why

The panel was markup inside the shell, so every product inherited the example's "Assessments and surveys…" page and timer illustration, and the curtain showed the example's clipboard whatever the product. Branding then needed a patch to the locked shell.

## Contract

- **`product.js`:** `logo` (string or `null`) and `signin: { headline, points: [[icon, text] × 3], art }`.
- **Prototype:** `BrandMark` and `ExampleSignInArt` in `parts_shell.js`. `assemble.py` inlines the logo into the boot curtain (`BOOT_MARK`). `setFavicon(t)` lives in `parts_helpers.js`.
- **Web:** `BrandMark.vue` reads the product config. `SignInBrandPanel.vue` takes the product's art as a slot. The favicon SVG is generated at build time for the product default and swapped at runtime by the accent.
- **Review:** no product name, icon or illustration appears anywhere outside `product.js` and the product's own art component.

## Amended (1.59.0, 2026-11-25): a dark panel in dark mode

In dark mode the brand panel used the dark theme's bright accent: half the sign-in screen a glaring light blue. The
panel (`.brand-panel`) now takes the accent's deep curtain shade with its light text in dark mode, and the accent in
light mode, as before. Its contents keep using primary and primary-foreground.

## Amended (1.60.0, 2026-11-26): the product's own example, a picture on the headline's edge

- The sign-in field's example (`placeholder` in `brandPanel.json`) is the product's own, like the panel's words: a
  product no longer shows the shell's demo address.
- The panel's picture is aligned left with the headline: on a 2560 screen a centred picture floated away from the words.
