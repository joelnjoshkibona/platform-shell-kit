# The phone model

What a phone is, and how it moves. The mobile kit (P56–P70) is these two tables; every rule and every phone component answers one row.
Evidence: the DevBiz app and the Cobley spare parts, Agrovet and Jumla apps (`PROPOSAL.md`).

## What a phone is (device facts: asked once, never assumed)

| Fact | Values | Used by |
| --- | --- | --- |
| Android version, CPU | 8+ (API 26), arm64 | updates (P67), permissions (P63) |
| Network | none · data · Wi-Fi, and when it changed | P51, P59 |
| Insets | status bar, gesture bar, notch, sides (px) | P62 |
| Keyboard | open / closed, height | P62 |
| Permissions | each of camera, Bluetooth, notifications, install unknown apps: unasked · allowed · denied · denied for good | P63 |
| Hardware | camera, Bluetooth, biometric, vibrate (declared optional) | P64, P65 |
| Installed version | name and integer code | P67 |
| Memory | the process may be killed in the background | P58 |

## How it moves (movements, one rule each)

| Movement | What the app does |
| --- | --- |
| Cold start | curtain; keep the session; validate with a network, else read-only on last data (P57) |
| Back pressed | close the top layer; then back; first screen asks twice; nothing on a forced screen (P52, P61) |
| To the background | stop polls; save the cart and the open form; start the lock timer (P58, P65) |
| To the foreground | refresh what is on screen; recheck session, update, network; "Updated just now" (P58) |
| Process killed | reopen where they were, cart and draft back (P58) |
| Signal lost / back | banner or page with how old the data is; reads retry on return; writes never replayed (P51, P59, P60) |
| A write times out | keep the form; "Check recent … before you try again"; Idempotency-Key makes a deliberate retry safe (P60) |
| Keyboard opens | the field stays visible; the primary action rides above the keyboard (P62) |
| A permission is needed | reason first, what still works, Allow / Not now; denied for good: Open Settings (P63) |
| Leave for the system (installer, Settings, share, call) | expect to come back; re-read state on return (P58, P64, P67) |
| Notification or link opened | open the record; sign in first if needed (P66) |
| Update appears | banner; below the minimum nothing else (P53, P67) |
| Phone handed on | lock after time away; sign out wipes the phone (P57, P65) |

The prototype's Screens pill has a **Phone movements** group that triggers each one.
