# P56 · Quiet header on a phone

Status: **proposed** (kit 1.8.0, the mobile kit; docs/mobile/PROPOSAL.md). Source: a first real-phone test.

## Decision

Below 640px the header keeps the menu, the page title, search and the avatar. Notifications (with the new count), View as someone and the theme (Light, Dark, System) move into the avatar menu, above the usual items; a dot on the avatar says something is unread. From 640px up nothing changes. The View as exit stays in the banner.

## Rules

- Below 640px: menu, title, search, avatar. Nothing else.
- The avatar menu gets Notifications · n new (opens the Notifications page), View as someone (when allowed), Theme: Light / Dark / System, a rule, then Profile, Notification settings, My drafts, Two-step verification, Trusted devices, Sign out.
- A dot on the avatar while anything is unread; the bell and its count are for 640px and up.
- The View as banner keeps its Exit button on a phone.

## Why

On the first real-phone test the header had five controls beside the title on a 411px screen. The owner asked for title, search and profile only.

## Where

Prototype: the shell header (parts_shell.js, phoneItems); shot shell--phone-menu. Product: AppShell shows two menus, one per width.
