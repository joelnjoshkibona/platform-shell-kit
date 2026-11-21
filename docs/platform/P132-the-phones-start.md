# P132 · The phone's start

Status: **decided** (kit 1.51.0). Amends P118 (the splash opens) and P55 (the first frames are one picture). Owner
2026-11-21, on a phone app's start: "That initial looking like stuck loader I don't like it"; chose the s2br
nativephp-mobile-splashscreen plugin with the animations grouped "an entry one, the loop one and the exit one".

## Decision

### 1. One animation in three parts

The phone's start is a moving brand animation over the web view while it loads, not a still picture: one Lottie
animation with three named parts (markers):

- **entry** plays once when the app opens: short, about half a second or less.
- **loop** repeats only while the app is not ready yet. A fast start may never show it.
- **exit** plays once when the app is ready, when the current loop ends. It ends on P118's **closed curtain**: the
  accent, full screen, with the mark. `SplashOpen` opens from that frame, so the start is one movement: entry, loop,
  exit, open.

It never holds a ready app longer than the rest of one loop plus the exit. An animation without the three markers is
played whole, repeated until the app is ready (the plugin's own behaviour). Under reduced motion (Android's "Remove
animations") only the closed curtain shows, standing still until the app is ready, then the 120 ms fade P118 already
gives.

### 2. Drawn from the product's brand

The animation is made from the product's mark and its default accent (P46) by the brand tool, in a light and a dark
version (the phone's appearance chooses). The launch colour (the operating system's own first frame) is the curtain's
colour in both appearances (the light curtain, and the dark one when the phone is dark), so nothing flashes black, grey
or white. The still splash image NativePHP keeps for itself is the closed curtain:
the mark only, no ring and no words.

### 3. No pretend progress

Nothing in the start says "Loading…", and nothing that looks like a spinner is a still picture. A product that needs to
say what it is waiting for (a first sync) says it in the app, after the start (P126's first sync).

## Why

A picture of a spinner looks stuck on every start, slow or fast. A short entry and an exit that hands over to the
curtain's opening make a fast start feel quick, and a loop that only runs while it must makes a slow one feel alive.

## Notes from building it (Bootbox, 2026-11-22)

- Each part plays from its marker's start to its end (Android: `LottieClipSpec.Marker("loop")`).
  `Markers("loop", "loop")` runs from one start to the same start: no frames, so the ring stood still.
- The plugin coloured only the light theme's launch screen; a phone in dark mode showed the system's grey. Bootbox's
  copy colours the night themes too.
- iOS plays the animation whole (the three parts are Android only for now): it cannot be built or tested on the
  machine that builds Bootbox.
- The emulator checks it: a spec records the start from the screen and checks the curtain's colours and that it moves.
