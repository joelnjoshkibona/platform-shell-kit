# DevBiz Phone (prototype)

DevBiz drawn for a phone only. One layout (360 to 430 wide), no breakpoints, its own shell, components and Design system.
It shares the API, the money and stock rules, the brand tokens and the web app's sizes with the web kit, and no components or
layouts. Open `index.html` in a browser. It loads Vue, Tailwind and Lucide from CDNs.

## Sizes

The web app's, as the web prototype draws them (D102): buttons and fields h-9 (36), small buttons and chips h-8, header h-14,
icon buttons h-9, switch h-5 w-9, avatars 36 (44 on a record), text-sm body, text-xs meta, 11px labels, text-xl titles,
text-2xl figures, rounded-md controls, rounded-xl cards, rounded-md status chips at 11px. The only phone-only sizes are the
bottom bar (56 + inset) and the round Sell button (48). The Design system screen lists them.

## Where it comes from

- **Agrovet and Jumla** (read in full, see `../docs/mobile/AGROVET_JUMLA_BRIEF.md`): the drawer with a coloured profile panel,
  the Refresh + filter-summary bar, the filter sheet, stacked detail cards, a sticky action footer, the big quantity box, the
  selected-customer card, expandable alerts, the wizard progress bar, confirm-with-a-difference, the printer and update states.
- **Our components and data** (DevBiz prototype): product tile, customer avatar, age chip, balance, sale status, level badge,
  cart line (± by the sell step), customer and account pickers; Water and Trident as they are sold (500 per 2), blue accent.
- **Our phone rules** (P56 to P70): Back closes the top layer first, the cart is kept when you leave the till, the cashier's
  requests wait for the owner, Call / WhatsApp / SMS from a number, Bluetooth receipt printer, lock, offline and update states.

## Screens

Sell: Home, Waiting for you, Till (tiles, cart, who is buying, credit and part pay), Receipt, Sales and Sale page, Payments and
Payment page. People: Customers and Customer page, Suppliers and Supplier page. Stock: Products and Product page (overview,
batches, movements), Stock movements, Deliveries and Delivery page (check, pay), Receive stock, End-of-day count with cash up.
Money: Expenses, Accounts and Account page (history, check, move money). You and the shop: Alerts, Alerts and reminders,
Profile, Users, Settings, Design system. Getting in: Sign in, Two-step code, Locked, Session ended. Phone states: no signal,
update ready, update required.

Use the picker to switch the signed-in person (Amina the owner, Rehema the cashier: her changes wait for the owner), the theme,
the list state, and to open any sheet. The menu is flat (grouped labels, no dropdowns) and owner-only groups hide for the cashier.

## Build

`python3 assemble.py` writes `index.html` from `src/`. `node tools/shoot.cjs` writes `screenshots/` (needs `npm i` in
`../tools/prototype-shots`). Data is made up: Water and Trident are real, the other products, the customers, suppliers and
amounts are not.
