# P62 · Safe areas and keyboard

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: DevBiz D192; Cobley, Agrovet, Jumla (all four hit it).

## Decision

One contract. --sa-top / -bottom / -left / -right are the inset NativePHP injects, in px, with env(safe-area-inset-*) behind them; the injected body padding is overridden (it is unlayered and would double the header). Everything fixed to an edge adds its inset. When the keyboard opens the view shrinks (100dvh), the focused field is scrolled to about 30% from the top after 300 ms, and the primary action rides above the keyboard in a BottomBar. Bottom sheets and toasts clear the gesture bar.

## Rules

- --sa-* variables and the !important body-padding override live in the kit's base CSS.
- Header = 3.5rem + --sa-top; BottomBar and sheets add --sa-bottom; toasts sit below --sa-top.
- 100dvh; a KeyboardAware container scrolls the focused field to ~30% after 300 ms.
- Primary action in a BottomBar, never position: fixed.
- Inputs get the right inputmode and enterkeyhint.

## Why

All four apps hit the doubled header; Cobley still has a safe-area-sheet class defined nowhere and one field 7px under the keyboard.

## Where

Prototype: Phone foundations, Bottom bar, app--keyboard.
