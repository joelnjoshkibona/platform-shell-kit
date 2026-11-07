# P103 · An organisation is the root of its location tree

Status: **decided** (kit 1.22.0). Amends P13 (where the main role is stored) and the core ERD, which drew `organizations` and `organization_users` tables that no product built. The owner, 2026-11-07, while building Bootbox: "User locations cannot work? Locations too is not enough?", then chose to keep locations.

## Decision

- **An organisation is a root location**: a `locations` row with `parent_id` NULL. It carries the organisation's `slug` (the `/{org}` path segment, unique) and its name. Branches, shops, offices and other places are ordinary locations under it.
- **`organization_id` on every tenant row is the root location's id**, the root included. One global scope (`OrganizationScope`) keeps organisations apart. The request's organisation comes from the `X-Organization` header or the `{org}` route segment. Membership is checked on every request.
- **Membership is `user_locations`.** A person belongs to an organisation when they have a row anywhere in its tree. Their **one main role** (Owner, Admin, Editor, Viewer; `role_type = system`) is `role_id` on their **primary** row in that organisation (`is_primary`, one per person per organisation). **Custom roles** stay in `user_locations.roles` and apply at that location and below.
- **The organisation's own settings** live in `settings` rows scoped to it: branding and accent (P41, P46), `require_2fa`, time zone and quiet hours. There are no columns for them on `locations`.
- **There is no `organizations` and no `organization_users` table.** "Is this an organisation?" means "is this a root location?"

## Why

It is how the platform core already works (Cobley, then DevBiz), and every flow is tested on it: sign-in, the organisation picker, isolation between organisations, effective permissions, View as and menus. Separate tables would add no capability, only a second place to keep membership in step.

## What changes

- `docs/architecture/CORE_ERD.md` and `erd_data.py`:
  - `ORGANIZATIONS` and `ORGANIZATION_USERS` are removed;
  - `locations.slug` and `user_locations.role_id` are drawn;
  - the relations name the root location as the organisation.
- **P13**: the main role sits on the member's primary `user_locations` row.
