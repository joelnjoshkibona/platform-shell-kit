---
id: act-on-many-rows
title: Do the same thing to many rows at once
module: Lists
screens: members, trash
who: People allowed to do that action on those records
related: find-records-in-a-list
order: 3
---
Batch mode lets you tick several rows, or everything your filters match, and act on them together.

::: shot route=members
1 = main [data-testid=batch-toggle]  Turn batch mode on
:::

1. Filter the list to the rows you want (see [Find what you need in a list](help:find-records-in-a-list)).
2. Tap **Batch** ①. Tick boxes appear. On a phone you can also press and hold a row.

::: shot route=members phone=no
> click main [data-testid=batch-toggle]
> click main button:has-text("Tick this page")
1 = [data-testid=batch-count]  How many you are acting on
2 = main button:has-text("Tick this page")  Tick every row on the screen
3 = [data-testid=batch-all]  Everything your filters match, on every page
4 = [data-testid=batch-bar] button:has-text("Resend")  The actions
:::

3. Tick rows one by one, or tap **Tick this page** ②, or **All that match** ③ for every row your filters match. The count ① always says which.
4. Choose an action ④ (more are under **More**). Actions that can't be undone ask first; deleting asks you to type YES.
5. You see what was done, and which rows were skipped and why. Large batches run in the background, and you get a notification when they finish.
6. Tap **Done** (or press Esc) to leave batch mode.

> Changing the filters or the search clears your ticks, so you never act on rows you can no longer see.
