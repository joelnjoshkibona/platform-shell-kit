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

Sell: Home, Waiting for you, Till (tiles, cart, who is buying, credit and part pay), the receipt screen after a sale or a payment, Sales and Sale page, Payments and
Payment page. People: Customers and Customer page, Suppliers and Supplier page. Stock: Products and Product page (overview,
batches, movements), Stock movements, Deliveries and Delivery page (check, pay), Receive stock, End-of-day count with cash up.
Money: Expenses, Accounts and Account page (history, check, move money). You and the shop: Alerts, Alerts and reminders,
Profile, Users, Settings, Design system. Getting in: Sign in, Two-step code, Locked, Session ended. Phone states: no signal,
update ready, update required.

**Keyboard open** (the picker's Phone state, P71) draws a stand-in keyboard and shows what the app does on Android 10, where the web view is not resized: every sheet lifts above the keyboard and the page behind keeps above it.

Use the picker to switch the signed-in person (Amina the owner, Rehema the cashier: her changes wait for the owner), the theme,
the list state, and to open any sheet. The menu is flat (grouped labels, no dropdowns) and owner-only groups hide for the cashier.

## Receipts (DevBiz D204-D208, Phase 12e)

Drawn here first, so the owner can approve the look before anything is built (`src/73_receipt.js`).

- **After a sale or a payment** the Receipt screen shows the paper exactly as the 58 mm printer gets it (32 letters across), with Print and Share PDF first, then Copy text and Printer. A payment taken ends here too.
- **Asked for again** (the Receipt row on a sale or a payment page) the paper says COPY and when it was printed again; a sale that was undone says CANCELLED.
- **Print** simulates the Bluetooth printer. In the picker's Phone state: Printer is off, Bluetooth is off, No printer chosen. A failure never loses the sale: Try again, Choose a printer, or Share instead.
- **Share PDF** opens a stand-in for Android's own share list with the PDF named by its receipt number.
- **Printer** (Profile and the receipt screen): paired printers, Test print, kept on this phone.
- **Receipt settings** (owner only; drawer, Shop, Receipt; or Settings): live preview (Printer 58 mm and PDF), the logo with the black-and-white copy the printer prints, what shows (ten blocks, fixed order, items and total always), the owner's words (address, TIN, header 48, footer 96, fill-ins). A cashier sees "Only Amina can change the receipt".
- The logo, the shop details and the sale lines in the paper are made up; the decisions are in the DevBiz repo (`docs/architecture/erd_data.py`, D204-D208).

## Build

`python3 assemble.py` writes `index.html` from `src/`. `node tools/shoot.cjs` writes `screenshots/` (needs `npm i` in
`../tools/prototype-shots`). Data is made up: Water and Trident are real, the other products, the customers, suppliers and
amounts are not.
