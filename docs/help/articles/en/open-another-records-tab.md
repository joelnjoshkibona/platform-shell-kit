---
id: open-another-records-tab
title: See another record's tab without leaving your page
module: Lists
screens: request, location, role
who: Anyone who can open that record
related: find-records-in-a-list
order: 2
---
Some links open a tab of another record in a window over your page, so you can look something up and come straight back.

::: shot route=#/requests/RQ-2026-0014
1 = main a[aria-label="Open Its people"]  Opens the location's people, over this page
:::

## Steps

1. Tap a link with the window icon ①, such as **Its people**. The location's **Users** tab opens over your page.

::: shot route=#/requests/RQ-2026-0014
> click main a[aria-label="Open Its people"]
1 = [data-testid=app-dialog] header [role=tablist]  The record's other tabs
2 = [data-testid=dialog-footer] button:has-text("Close")  Back to your page
3 = [data-testid=dialog-footer] button:has-text("Open full page")  Go to the record itself, on this tab
:::

2. Switch to another of its tabs ① if you need to. A link inside opens another window on top; each one closes on its own.
3. Tap **Close** ② (or press Esc, or the phone's Back) to return to your page, exactly as you left it.
4. Tap **Open full page** ③ to go to the record itself, on the same tab. Back brings you back.

> The window only closes with its buttons, never by tapping outside it, so you can't lose your place by accident.
