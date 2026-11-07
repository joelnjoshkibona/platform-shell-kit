# The pieces of a product

A product on the platform (Fomu, DevBiz, Shelui Tasks, …) is one repository with these parts.

| Part | Folder | What it is | Built with |
| --- | --- | --- | --- |
| API | `api/` | The server: data, rules, permissions. Everything the apps show comes from here. | Laravel (PHP), MySQL or PostgreSQL |
| Web app | `web/` | The admin app in a browser, on a desktop or a phone. | Vue 3, TypeScript, Tailwind, shadcn-vue |
| Phone app | `mobile/` (the Android shell) + each module's `web/src/modules/{module}/phone/` screens (if the product has one) | An Android app drawn for a phone only. Its screens are a phone-only build of the web project; it talks to the same API. | NativePHP (Laravel inside the app) + Vue 3, TypeScript |
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

Every product gets these modules from the platform without writing them: users, roles and permissions, organisations, locations (a tree of branches, zones and regions), settings, menus, media (files), drafts, approvals and notifications, statuses, the dashboard and global search. A product adds **its own modules** (Fomu: forms and responses; Shelui Tasks: tasks, tickets, projects).

> **Why**: Writing the same users-and-roles screens for every product wastes months and makes every product behave a little differently. The core is written once and kept the same everywhere.
