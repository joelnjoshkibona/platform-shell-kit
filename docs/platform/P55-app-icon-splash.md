# P55 · App icon and splash

Status: **decided** (kit 1.7.0).

## Decision

- **Icon:** the product mark (P48 `BrandMark`) on the product's default brand colour: mark at 46% of the tile, corner
  22% (an adaptive icon on Android). Sizes: 512 (store), 192, 96, 48.
- **Splash:** the closed boot curtain (P8): `--curtain` background, the mark in a 15% tile, "Loading <product>…".
  The splash, the app's first frame and the web view's first paint are one picture, so nothing flashes.

Prototype: Design system › App icon and splash; Screens pill › Phone app › Splash screen.
