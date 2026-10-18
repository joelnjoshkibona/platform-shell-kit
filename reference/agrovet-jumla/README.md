# Agrovet and Jumla UI (reference prototype)

A clickable prototype of the Agrovet and Jumla phone apps, built from their code on 2026-10-18. It is a reference for what
those apps look like, not a proposal. Open `index.html` in a browser (it loads Vue, Tailwind and Lucide from CDNs).

Sources: `ONGEZA/AgrovetAppProject/agrovetapp-nativephp/resources/js/src` and
`ONGEZA/JumlaAppProject/jumlaapp-nativephp/resources/js/src`.

## Copied from their code

- Colour tokens (`style.css`, identical in both apps, light and dark), radius 0.625rem, Instrument Sans.
- Shell: header (trigger or back, title, bell with count in Jumla, initials avatar), off-canvas sidebar 18rem with the
  primary-coloured profile panel, role pills (Jumla), grouped menu, active item; both menus (`menus.json`).
- Lists: sticky bar with Refresh and the filter-summary pill, stacked cards (badge row, label/value rows, total and
  balance badge), Load more, floating + button, empty, loading and error states; the full-screen filter sheet.
- Customers (ListItemCard), Notifications (segmented tabs, unread dot, expand), detail page (DetailCards), dashboard
  (period tabs in Agrovet, KPI cards, recent activity), both profile pages, Theme.

## Not theirs

- All data (names, TZS amounts, order numbers) and the Sign in, Device Info and Theme page contents are made up.
  Jumla's own Settings and Theme pages are "Coming soon" stubs in the app.
- Menu entries without a drawn screen open a "Not drawn in this prototype" page.
- The phone frame and the screen picker are the prototype's, as in the kit prototype.
