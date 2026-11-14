# P118 · Phone motion

Status: **decided** (kit 1.34.0; amended in 1.36.0: steps move only the step's body). Amends P116 (motion) for the phone app, P55 (splash), P114 (the product's boot loader) and the
Phone foundations › Motion entry in `docs/COMPONENTS.md`.

## Why

P116 made the web app's motion answer one question, what just happened. The phone app had only short fades and rises: a record opened
with no sense of going deeper, Back gave no sense of coming back, the splash simply vanished, and an important write (an order made, goods
out, stock confirmed) ended in the same small toast as a filter change. People on a phone work fast and often outdoors; motion that says
where they are and what just happened saves them from re-reading the screen.

## Rules

- **P116 holds on the phone**: every motion answers what just happened, nothing loops (spinners aside), nothing moves on a changed query,
  and the same tokens apply (`--dur-fast` 120ms, `--dur-base` 180ms, `--dur-slow` 280ms, `--ease-standard`, `--ease-exit`).
- **Motion never blocks**: a tap during a transition goes to the new screen; nothing waits for an animation to finish.
- **Under `prefers-reduced-motion`** (and the app's own Reduce motion setting, which follows the system by default) all of it is off:
  screens and sheets appear at once, the splash fades in 120ms, the done moment shows its check already drawn.
- P116's shared pieces are used as they are (`Num`, `Meter`, `useListMotion`, `motionInvalid`); the phone adds only what has no web twin.

## The phone's motions

1. **The splash opens.** The native splash (P55) is the closed curtain. The first web frame matches it, then, as soon as the app is ready,
   the curtain **opens**: a circle closes into the mark (`SplashOpen`, at most 520ms). It never waits for its own animation and never holds
   a ready app; if the app is not ready the curtain stays with the mark (and the P8 loader after 300ms). A product's P114 `boot` loader may
   **build** its mark with CSS while the curtain is closed (bars grow, a dot settles), up to 150px wide.
2. **Pages push and pop.** Opening a record or a deeper page slides it in from the right (`--dur-slow`, standard ease); Back slides it out
   to the right (exit ease, faster). Bottom-bar tabs and the drawer's top-level pages fade (`--dur-base`). Wizard steps slide by direction
   (Next from the right, Back from the left) (`PageTransition`). **A step change moves only the step's body.** The header, the steps
   and the footer stay still. The transition wraps the body inside the page's scrolling area, and the leaving body is pinned at its own
   box (where it was, its own width and height), never `position: absolute; inset: 0`. Inset 0 stretches it over whatever positioned box
   is nearest, which is the page when the wizard's body has none, so the step rose over the header and the steps on every Next and Back.
   The same holds for the router view: the leaving page is pinned at its own box.
3. **Lists rise once.** The first load of a list rises in with P116's stagger (30ms, capped at 8 rows); Refresh, filters, search and scope
   move nothing; a new row is highlighted once.
4. **The done moment.** After a write that matters (a record created that the person will hand over or act on, goods out, stock received
   or confirmed, a payment recorded) a full-screen **done moment** replaces the toast: a ring and a tick draw (420ms), then the record's
   number, one line on what happens next, the facts (who, how many, how much) and the next actions (print, make another, open it)
   (`DoneMoment`). Everything else keeps the toast (P9).
5. **Printing shows progress.** A print action shows the printer working until the printer answers (sent, failed with the reason), never a
   toast before the job is done (P64).
6. **Sheets** rise from the bottom and go back down (as today), with a gentle settle; the quantity sheet of P115 and every picker use it.

## Shared pieces (phone)

| Piece | What it does |
| --- | --- |
| `SplashOpen` | The opening curtain over the first frame; `ready` prop opens it; reduced motion fades. |
| `PageTransition` | Wraps the router view; `push` / `pop` / `tab` / `step-next` / `step-back` from the navigation, not from the screen. |
| `DoneMoment` | `title`, `ref`, `text`, `facts`, `primary`, `secondary`; opened with `done({...})`, closed by its actions or Back. |

## The prototype

`prototype-phone/` draws each one: the splash opening (with an example boot loader that builds a mark), push into a record and pop back,
the done moment after a sale, the printing state. The Picker's **Motion** group replays them; the shots include reduced motion.

## Checks

- With reduced motion on, no element has a running animation or transition after the first frame.
- A tap during a push lands on the new screen (no blocked input).
- During a step change the header, the steps and the footer do not move, and the step's body never rises above the steps.
- The splash never stays after the app reports ready plus 520ms.
