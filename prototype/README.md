# Prototype

`index.html` is the clickable prototype of the whole product: admin app, builder, results and respondent. **It is the visual source of truth** (D17, D27).

## Open it

- **Quickest:** open `index.html` in a browser. It loads Vue 3, Lucide and the Tailwind play CDN from the internet.
- **Offline or in CI:** `cd tools/prototype-shots && npm i && npm run css && node shoot.js --only dashboard`. This serves the same page with local copies of those libraries, and is how the screenshots in `../screenshots/` were made.
- **Moving around:** use the bottom-left **Screens** pill to jump between screens. On the respondent screen, the **Prototype states** button shows every edge case. Both are prototype-only; don't build them.

## Read the source

`index.html` is assembled from the parts in `src/`. Read the parts; they are easier to follow:

| File | Contains |
| --- | --- |
| `parts_helpers.js` | Vue imports and helpers (ulid, class names, dates) |
| `parts_atoms.js` | Atoms mirroring shadcn-vue: Button, Input, Select, Checkbox, Switch, Badge, Card, Tabs, Tooltip, DropdownMenu, Dialog, Sheet, `usePopover`, Escape handling |
| `parts_shell.js` | App shell: sign-in, org switcher, sidebar, menus/permissions model, Roles list/details, Design system page, Forms list, Templates, Users, Settings, ShellView |
| `parts_list.js` | `useList`, ListToolbar, FiltersDialog, DatePicker, HeaderSearch (contextual/global), Dashboard |
| `parts_comp.js` | ApiSelect (paging, labels, stale states), FilePicker, Media library, RichText, drafts, DeleteDialog, RelatedLink |
| `parts_loc.js` | Locations: data, effective permissions, View as, Locations list, Location details |
| `parts_appr.js` | Approvals: workflows, routing, capacity rule, notifications, inbox, request page, editor, delegations, notification settings |
| `parts_resp.js` | Results: summary charts, individual responses, filters, export, void/reset |
| `parts_app.js` | Respondent: OTP, rules, timer, violations, gates, Prototype states panel |
| `builder.html` | The builder (Questions + Settings), plus the base page: theme tokens, Tailwind config, fonts. The assembly starts from it |
| `assemble.py` | Stitches everything into `index.html`, and holds the glue: the global store `G` (route, theme, org), `nav()`, the curtain, the Screens pill and app mounting. Its paths point to the original workspace |

When you port a component, copy its Tailwind classes and its states (hover, focus, disabled, loading, empty, error) from these files. Don't re-imagine them.

## Data in the prototype

The demo data covers three organisations: Kilima Retail (Owner, the main one), Kilima Wholesale and Pwani Agro Dealers. Kilima Retail has locations, roles, requests, delegations and responses. Use it to write the seeders, so the app renders the same content as the screenshots.
