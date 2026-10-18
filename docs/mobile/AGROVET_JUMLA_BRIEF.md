# Agrovet and Jumla → our phone app: the design brief

Read on 2026-10-18: every page and shared component of both apps (about 29,000 lines), in five slices. This is what we take,
what we change and what we leave. It feeds the phone prototype; nothing here is a decision until the owner picks (section 5).

## 1. What both apps do well (take)

| Pattern | Where | For us |
| --- | --- | --- |
| Off-canvas drawer, 18rem, coloured profile panel (initials, name, code, role pills), grouped menu, active row | both | The phone's main navigation. Panel: Amina / Rehema, role, shop. |
| Sticky list bar: Refresh + one pill that sums up the filter (`Filter · Pending · This week`) with a dot when active | all lists | Every list on a phone. |
| Full-screen filter sheet: status chips, search, date presets, sticky Reset / Apply | all lists | Same sheet; our filters fill it. |
| Bordered list card: title + badge row, label/value rows, footer with total and balance badge | Orders, Sales, Payments | Sales, payments, deliveries, expenses. |
| Balance badge: amber owed, blue overpaid, green Paid | Orders | Our `BalanceText` and `SaleStatus` already say this; same colour logic. |
| Detail page = stacked cards (Order, Customer, Items, Summary, Payments, Collections) + pinned footer action | all | Sale, payment, delivery, supplier pages. |
| Footer action bar: exactly one primary action, a success line or a muted reason why not | Order detail | Every record page (Undo sale, Take payment…). |
| Full-screen slide-up picker, stackable (z-50/60/70/80), search, selected row tinted + check | all | Customer, supplier, account, product pickers. One component. |
| Typed-quantity dialog: big centred number, button carries the line total | all carts | Our `BatchSplitDialog` / `CartLine` (± by sell step is already better). |
| Selected-customer card (green) above a "Change" button; "not listed? Add new" | carts | Till customer chip. |
| Bulk-select mode: ring + check, Select all / Clear all, footer "Action N" | machines | Count lines, deliveries to check, notifications. |
| Confirm with variance: if the number differs, show short/over in colour and ask for a reason | stock confirm | Count gaps, short deliveries (D46, D57). |
| Vertical timeline (dot + line, "A → B", quoted reason) | machine history | Sale / payment / account history, stock movements. |
| Expandable notification card with unread dot; All / Unread tabs | Jumla | Our Notifications. |
| Role-gated quick-action tiles on Home | Jumla | Home: New sale, Take payment, Count, Expense; cashier sees fewer. |
| Tappable count banners ("N pending…") | stocks, machines | Home "Waiting for you" and the cashier's "waiting for the owner". |
| Printer status strip; just-in-time Bluetooth permission; print confirm | both | Receipt printing (P64). |
| Scan with manual fallback, 60 s timeout, `scanMultiple` | Agrovet | Our Scan view (P64). |
| PIN cells with auto-submit, 60 s resend; password strength word | Agrovet auth | Two-step verification, lock PIN (P65). |
| Update dialog / page with states and a mandatory variant | both | Already P53; adopt their state list. |
| `KeyboardAwareScrollView`: focused field to ~30% after 500 ms | both | P62 already says this. |
| Wizard progress bar ("Step n of 3", segments) and footer Back / Next | carts | Sale form for the owner; stock count; delivery receive. |
| Loading skeletons shaped like the content | dashboards | Every list and card. |

## 2. What we change

- **Sizes.** Their controls are small (28–36px targets, `text-xs` for primary data). Sizes come from our prototype
  ([[match-prototype-sizes]]); nothing is copied by number.
- **Colours.** Their badges are raw Tailwind palette classes with no dark variant. We use our tokens and `SaleStatus`,
  `DelStatus`, `LevelBadge` (D13: DevBiz accent is blue).
- **One component, not copies.** They paste the customer picker, the new-customer form and the region/district/ward
  cascade into 3 files each, and the status-badge function into every page. We have `CustomerPicker`, `AccountPicker`,
  one status component per record.
- **Quantity.** They type numbers only. We keep ± by the product's sell step (D75) plus typing.
- **Header.** Jumla's header shows a bell and an avatar. Ours is quiet (P56): menu, title, search, avatar; the avatar
  opens a Profile page that holds notifications, View as, theme and settings (their Profile pattern, our content).

## 3. What we leave (their mistakes)

Hard-coded "Completed" on sales; raw backend strings as labels ("Payg-valid serial No"); light-only colours; Cash/Credit
switch silently wiping the cart; a credit limit that only turns a number red (we warn, D31); landing on the Dashboard
after a sale with no receipt; "Clear Cart" and "Log Out" with no confirm; a mandatory update you can leave with Back;
a Not Found button that goes to a route that doesn't exist; a printer with no disconnect and a paired list you can't pick
from; a stub Cart page that is still routable; search that only covers the loaded pages; detail pages that break on refresh
because they read `history.state`; money figures cut off ("TZS 2,9…") in a 2-column KPI; Settings pages that say
"Coming soon". Their phone gaps are what P56–P70 already answer (lifecycle, connectivity, idempotency, back stack, lock).

## 4. Our screens on the phone

| DevBiz screen | Phone shape, from their pattern |
| --- | --- |
| Home | Greeting, period tabs, KPI cards (money at `text-xl`, not cut), quick-action tiles by role, count banners ("Waiting for you"), recent activity |
| Till | Product tiles, cart bar in the footer, customer chip (their green card), Cash now / On credit, part pay, batch split dialog, receipt with Print and Share |
| Sales / Payments | Sticky bar + filter sheet, bordered cards with balance badge, FAB "New sale" (owner) / Till link |
| Sale / Payment page | Stacked cards, timeline, one footer action (Undo / Change; the cashier's wait for the owner) |
| Customers / Customer | List card with `BalanceText` and `AgeChip`, Call / WhatsApp from the number (P64), tabs as scoped lists (D72) |
| Products / Product / Movements | List card with `LevelBadge`, product page cards, batches, movements as a timeline |
| Stock count + cash up | Wizard bar, bulk-select lines, variance prompt with reason, cash up summary |
| Expenses, Accounts, Account | List cards; account history timeline; `AccountPicker` sheet |
| Suppliers, Supplier, Deliveries | Cards, partial receive grid with "Rem: n", pay from drawer wait |
| Notifications, Alerts | Expandable cards, unread dot, All / Unread; settings as a Profile page row |
| Profile | Their two profile pages merged: avatar, role, shop, Outstanding-style summary where it applies, theme, app version, Check for updates, lock, printer, Log out (with confirm) |
| Sign in, 2-step, lock, session ended, update | Their auth shell (centred, keyboard aware) + our phone kit pieces |

## 5. Open choices (the owner decides)

1. Lists on a phone: their bordered card anatomy, or our `ListRows` (P39/P40/D88: one row shape at every width)?
   Taking their cards needs a new decision.
2. Navigation: drawer only (both apps), or drawer plus a bottom tab bar for the till (Jumla drew one and never used it)?
3. Where the work goes: inside the existing DevBiz prototype's phone mode (the source of truth), or a separate phone prototype?
4. First slice: the six core screens (Home, Till, Sales, Customers, Profile, Notifications), or all twenty at once.
