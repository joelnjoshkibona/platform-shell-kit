---
id: broken
title: A guide whose button was removed
module: Test
who: Anyone
---
::: shot route=members phone=no
1 = main button[aria-label^="Filters"]  This one exists
2 = main button:has-text("A button that was removed")  This one does not
:::
