---
id: choose-your-notifications
title: Choose how you are notified
module: Notifications
screens: notifications
who: Everyone, for themselves
related: export-a-list
order: 1
---
You choose, for each kind of notification, whether it also comes by email, SMS or push. Notifications always appear in the app.

::: shot route=notifications
> click main [role=tab]:has-text("Settings")
1 = main [role=switch][aria-label$=": email"]  Email for this kind
2 = main [role=switch][aria-label$=": SMS"]  SMS
3 = main [role=switch][aria-label$=": push"]  Push to your phone
:::

::: shot route=notifications
> click main [role=tab]:has-text("Settings")
1 = main [role=switch][aria-label="Quiet hours"]  Quiet hours: no SMS or push at night
:::

## Steps

1. Open **Notifications** and choose the **Settings** tab.
2. For each kind, switch email ①, SMS ② or push ③ on or off.
3. Further down, switch on **Quiet hours** ① to stop SMS and push at night. They wait until the morning; nothing is lost.
