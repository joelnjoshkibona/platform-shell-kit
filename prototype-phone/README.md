# Bootbox Phone (prototype)

The kit's example phone app, a small shop, drawn for a phone only. One layout (360 to 430 wide), no breakpoints, its own shell, components and Design system.
It shares the API, the money and stock rules, the brand tokens and the web app's sizes with the web kit, and no components or
layouts. Open `index.html` in a browser. It loads Vue, Tailwind and Lucide from CDNs.

## Sizes

The web app's, as the web prototype draws them: buttons and fields h-9 (36), small buttons and chips h-8, header h-14,
icon buttons h-9, switch h-5 w-9, avatars 36 (44 on a record), text-sm body, text-xs meta, 11px labels, text-xl titles,
text-2xl figures, rounded-md controls, rounded-xl cards, rounded-md status chips at 11px. The only phone-only sizes are the
bottom bar (56 + inset) and the round Sell button (48). The Design system screen lists them.

## Where it comes from

- **Earlier phone apps built on the platform**: the drawer with a coloured profile panel,
  the Refresh + filter-summary bar, the filter sheet, stacked detail cards, a sticky action footer, the big quantity box, the
  selected-customer card, expandable alerts, the wizard progress bar, confirm-with-a-difference, the printer and update states.
- **The example's components and data**: product tile, customer avatar, age chip, balance, sale status, level badge,
  cart line (± by the sell step), customer and account pickers; Water and Trident as they are sold (500 per 2), blue accent.
- **Our phone rules** (P56 to P70): Back closes the top layer first, the cart is kept when you leave the till, the cashier's
  requests wait for the owner, Call / WhatsApp / SMS from a number, Bluetooth receipt printer, lock, offline and update states.

## Screens

Sell: Home, Waiting for you, Till (tiles, cart, who is buying, credit and part pay), the receipt screen after a sale or a payment, Sales and Sale page, Payments and
Payment page. People: Customers and Customer page, Suppliers and Supplier page. Stock: Products and Product page (overview,
batches, movements), Stock movements, Deliveries and Delivery page (check, pay), Receive stock, End-of-day count with cash up.
Money: Expenses, Accounts and Account page (history, check, move money). You and the shop: Alerts, Alerts and reminders,
Profile, Users, Settings, App update (P79: one card), Background health (P119: the checks the modules supply, the auto-start card), Design system.
Getting in: Sign in, Two-step code, Locked, Session ended. Phone states: no signal, update ready (the short offer: Later or Update), update required.

**This phone** (Settings, P76) and **Where this phone was** (P77) are drawn in `src/79_device.js` with no real sensors and no real map: the live reading, 24 hours of battery and network, what is kept and Delete the trail; the map with path, stops, day arrows, centre button and attribution, and its states (no trail yet, no network for the map pictures). The picker's Phone state has buttons for each.

**Keyboard open** (the picker's Phone state, P71) draws a stand-in keyboard and shows what the app does on Android 10, where the web view is not resized: every sheet lifts above the keyboard and the page behind keeps above it.

Use the picker to switch the signed-in person (Amina the owner, Rehema the cashier: her changes wait for the owner), the theme,
the list state, and to open any sheet. The menu is flat (grouped labels, no dropdowns) and owner-only groups hide for the cashier.

## Data modes (P102)

The picker's **Data mode (P102)** switches between connected (as drawn everywhere else), on the phone and sync. Sync adds the sync line on Home, the Sync page (waiting, couldn't be sent, what is kept), the no-signal bar that says to keep working, the conflict screen (mine and theirs), the first sync, and signing out with changes waiting. On the phone shows Data and backups. Drawn in `src/25_sync.js`.

## Receipts

Drawn here first, so the owner can approve the look before anything is built (`src/73_receipt.js`).

- **After a sale or a payment** the Receipt screen shows the paper exactly as the 58 mm printer gets it (32 letters across), with Print and Share PDF first, then Copy text and Printer. A payment taken ends here too.
- **Asked for again** (the Receipt row on a sale or a payment page) the paper says COPY and when it was printed again; a sale that was undone says CANCELLED.
- **Print** simulates the Bluetooth printer. In the picker's Phone state: Printer is off, Bluetooth is off, No printer chosen. A failure never loses the sale: Try again, Choose a printer, or Share instead.
- **Share PDF** opens a stand-in for Android's own share list with the PDF named by its receipt number.
- **Printer** (Profile and the receipt screen): paired printers, Test print, kept on this phone.
- **Receipt settings** (owner only; drawer, Shop, Receipt; or Settings): live preview (Printer 58 mm and PDF), the logo with the black-and-white copy the printer prints, what shows (ten blocks, fixed order, items and total always), the owner's words (address, TIN, header 48, footer 96, fill-ins). A cashier sees "Only Amina can change the receipt".
- The logo, the shop details and the sale lines in the paper are made up.

## Backend adapter (P117)

The Picker's **Backend** switch draws the same app on another backend (`src/79_backend.js`, `BACKEND`). Every remote call goes through
one adapter in the app; here only its capabilities change what is drawn: sign-in by username, a 4-digit code by SMS after the password
(`CodeBoxes`: four boxes over one input with `autocomplete="one-time-code"`, a resend countdown, a wrong code shakes once), "Forgot
password?" sends a code and resets the password with it, one organisation (no picker or switcher), the menu built from the permissions,
and no notifications (no Alerts tab, no Notifications in the menu). States: `backend-other-signin`, `backend-other-code`,
`backend-other-code-wrong`, `backend-other-forgot`, `backend-other-reset`, `backend-other-home`, `backend-other-drawer` (+ dark).

## Motion (P118)

P116's tokens are defined once in `00_head.html` (`--dur-fast`, `--dur-base`, `--dur-slow`, `--ease-standard`, `--ease-exit`).
`src/27_motion.js` holds the phone's own pieces: `SplashOpen` (the closed curtain with an example P114 boot loader that builds a mark in
CSS, then a circle closes into the mark when the app is ready, at most 520ms), `DoneMoment` (`done({...})`: the ring and tick draw, the
number, what happens next, facts, next actions) and the page motion in `Screen` (90_root.js): `go` pushes from the right, `back` pops to
the right, tabs fade, wizard steps slide by direction (only the step's body moves; the header and steps stay still); the leaving page is pinned so sheets keep the app as their frame. The Picker's
**Motion** group replays them, with **Reduce motion** (everything appears at once, the check already drawn) and **Slow motion**
(prototype only, stretches the tokens). States: `motion-splash`, `motion-splash-opening`, `motion-push`, `motion-pop`, `motion-step`,
`motion-done` (+ dark), `motion-printing`, `motion-reduced`.

## Lines on a phone (P115)

**New order** (Sell › New order, `src/45_lines.js`) is a document with lines in three steps (Customer, Lines, Check). Lines come from
`ItemCatalogue` (sticky search with scan, category chips, price, stock, the quantity already in the order as a badge; an out-of-stock item
says why), a tap opens `QtySheet` (large quantity, − / +, +10 … +100, the line total, Add / Update / Remove; it stops at the stock and, on
credit, at what is left of the customer's limit, and says which), and `CartBar` opens the lines (`LinesSheet`). Making the order ends in
the done moment. The till keeps its own tap-to-add pattern. States: `lines-customer`, `lines-catalogue` (+ dark), `lines-qty`,
`lines-qty-update`, `lines-qty-over-stock`, `lines-qty-over-limit`, `lines-cart`, `lines-check`.

## Build

`python3 assemble.py` writes `index.html` from `src/`. `node tools/shoot.cjs` writes `screenshots/` (needs `npm i` in
`../tools/prototype-shots`). Data is made up: Water and Trident are real, the other products, the customers, suppliers and
amounts are not.
