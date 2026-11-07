# The pieces of a product

A product on the platform (Fomu, DevBiz, Shelui Tasks, …) is one repository with these parts.

| Part | Folder | What it is | Built with |
| --- | --- | --- | --- |
| API | `api/` | The server: data, rules, permissions. Everything the apps show comes from here. | Laravel (PHP), MySQL or PostgreSQL |
| Web app | `web/` | The admin app in a browser, on a desktop or a phone. | Vue 3, TypeScript, Tailwind, shadcn-vue |
| Phone app | `mobile/` (if the product has one) | An Android app crafted for a phone only, its own app (P93): its own screens and pieces, a small Laravel inside for the phone's own work. It talks to the same API. | NativePHP (Laravel inside the app) + Vue 3, TypeScript |
| Shared code | `packages/shared/` | What the web and phone apps must agree on: talking to the API and its types, permission names, statuses, formatting. | TypeScript |
| Prototype | `docs/design/prototype/` | A clickable copy of the product with fake data. The look and behaviour every screen must match. | Plain JavaScript, opens from a file |
| Documents | `docs/` | Decisions, data model (ERD), screens, rules, components, the plan, the tracker and this guide. | Markdown, generated HTML |

## How they talk

```
 person ──► web app (web/)  ──┐
                              ├──► API (api/) ──► database
 person ──► phone app (mobile/)┘
```

- The **web app** and the **phone app** never touch the database. They call the API over HTTPS with a sign-in token, and show what it returns.
- The **API** checks who is asking (sign-in), what they may do (permissions, named like `Tasks.create`) and where (their organisation and locations), then reads or writes the database.
- The **prototype** is not connected to anything. It holds its own fake data so a screen can be clicked and judged before any code exists.

## The core every product inherits

Every product gets these modules from the platform without writing them: users, roles and permissions, organisations, locations (a tree of branches, zones and regions), settings, menus, media (files), drafts, approvals and notifications, statuses, the dashboard and global search, and the system screens (P97): logs of who did what and what went wrong, the queue of background work, scheduled tasks, the trash, notification rules and announcements, and who has which permission. A product adds **its own modules** (Fomu: forms and responses; Shelui Tasks: tasks, tickets, projects).

> **Why**: Writing the same users-and-roles screens for every product wastes months and makes every product behave a little differently. The core is written once and kept the same everywhere.
