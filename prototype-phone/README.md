# DevBiz Phone (prototype)

DevBiz drawn for a phone only. One layout (360 to 430 wide), no breakpoints, its own shell, components and Design system.
It shares the API, the money and stock rules and the brand tokens with the web kit, and nothing else.
Open `index.html` in a browser. It loads Vue, Tailwind and Lucide from CDNs.

## Where it comes from

- **Agrovet and Jumla** (read in full, see `../docs/mobile/AGROVET_JUMLA_BRIEF.md`): the drawer with a coloured profile panel,
  the Refresh + filter-summary bar, the filter sheet, stacked detail cards, a sticky action footer, the big quantity box, the
  selected-customer card, expandable alerts, the printer and update patterns.
- **Our components and data** (DevBiz prototype): `ProductTile`, `CustAvatar`, `AgeChip`, `BalanceText`, `SaleStatus`, `LevelBadge`,
  `CartLine` (± by the sell step), `CustomerPicker`, `AccountPicker`; Water and Trident as they are sold (500 per 2), blue accent.
- **Our phone rules** (P56 to P70): back closes the top layer first, the cart is kept when you leave the till, the cashier's
  requests wait for the owner, Call / WhatsApp / SMS from a number, Bluetooth receipt printer.

## Screens (first pass)

Home, Waiting for you, Till (tiles, cart, who is buying, credit and part pay, paid into), Receipt, Sales (list, filter sheet,
loading / empty / error), Sale page (take payment, undo or ask to undo), Customers, Customer page (take payment, call sheet),
Alerts, Profile (theme, lock, printer, update check, view as, sign out), search, the flat drawer, and the Design system.
Switch the signed-in person (Amina / Rehema) and the theme in the picker; "Open on top" jumps to every sheet.
Menu entries not drawn yet open a "Drawn in the next pass" page.

## Build

`python3 assemble.py` writes `index.html` from `src/`. `node tools/shoot.cjs` writes `screenshots/` (needs `npm i` in
`../tools/prototype-shots`). Sizes in the Design system screen are a proposal for the phone kit, not yet decisions.
