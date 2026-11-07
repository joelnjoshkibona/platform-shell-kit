---
id: keep-your-unfinished-work
title: Come back to a form you didn't finish
module: Forms
screens: locations, location
who: Everyone, for their own drafts
related: find-records-in-a-list
order: 1
---
You never lose what you typed in a form. While you type, it is saved as a draft every few seconds, and the moment you close the form it is saved again. Only you see your drafts.

::: shot route=locations
> click main button:has-text("New")
1 = [data-testid=app-dialog] button:has-text("View drafts")  Pick up a draft you left
2 = [data-testid=dialog-footer] button:has-text("Close")  Close: what you typed is kept
:::

1. Close a form whenever you like ②, with Close, Esc or the phone's Back. A message says **Kept as a draft**.
2. Open the same form again. It says how many drafts you have; tap **View drafts** ① to pick one up.
3. You can also find every draft under your picture, top right, in **My drafts**.

> If the draft can't be saved (for example, with no signal), the form stays open and tells you, so you can try again or close without saving.
