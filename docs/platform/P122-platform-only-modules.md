# P122 A module may be a platform tool

**Amends** P81 (the manifest) and P97 (the system screens). **Owner**, 2026-11-17.

## Why

Some screens show rows that belong to no one organisation: every customer organisation on the platform, the server's
logs, its queue. The core already kept four such tools (Menus, Logs, Queue, Scheduled tasks) away from organisation roles,
but as a fixed list in the core. A product's own screen of that kind could not join it, so the owner and admin of every
customer organisation held its permissions (they hold every permission) and saw its menu link, even though the server
refused them.

## The decision

A module's `module.json` may say:

```json
{ "key": "Customers", "tier": "Custom", "group": "Platform", "platform_only": true }
```

Its permissions are then platform tools, exactly like the core four:

| Where | What happens |
|---|---|
| Effective permissions | Only the developer role grants them. An organisation role row or a direct grant that names them grants nothing. |
| `*` (Owner, Admin) | Leaves them out. |
| Role editor and direct grants | Not offered; saving a role that names one is a 422 on that field. |
| Menu (`GET /menus/mine`) | Their links are hidden from everyone without the permission, so from every organisation role. |
| Roles' figures | Not counted in "permissions in total". |

The full list is the core four plus every **enabled** module that declares it, read from the manifests
(`platformOnlyModules()`); nothing about a product is written in the core.

## When to use it

Only when a screen's rows belong to no one organisation. A module whose rows carry an `organization_id` is never
platform-only: scope it (P103) instead. A platform-only screen still checks its own permission on every route.

## Checks

- A test declares a module platform-only and proves: an owner loses it, `*` leaves it out, a role cannot be given it.
- The core four stay platform-only without any manifest saying so.
