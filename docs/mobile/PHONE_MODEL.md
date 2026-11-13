# The phone model

What a phone is, and how it moves. The mobile kit (P56–P79) is these two tables; every rule and every phone component answers one row.
Evidence: four phone apps built on the platform, compared (`PROPOSAL.md`).

## What a phone is (device facts: asked once, never assumed)

| Fact | Values | Used by |
| --- | --- | --- |
| Android version, CPU | 8+ (API 26), arm64 | updates (P67), permissions (P63) |
| Network | none · data · Wi-Fi, and when it changed | P51, P59 |
| Phone status | battery and charging, network and signal 0 to 4, generation (to Android 10), power saving, free storage; a history on the phone | P76 |
| Insets | status bar, gesture bar, notch, sides (px) | P62 |
| Keyboard | open / closed, height (the view may not resize: Android 10 asks the plugin) | P62, P71 |
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
| Keyboard opens | the field stays visible; sheets and the page keep above the keyboard by its height; the primary action rides above it (P62, P71) |
| A permission is needed | reason first, what still works, Allow / Not now; denied for good: Open Settings (P63) |
| Leave for the system (installer, Settings, share, call) | expect to come back; re-read state on return (P58, P64, P67) |
| Notification or link opened | open the record; sign in first if needed (P66) |
| Update appears | banner or a once-per-version dialog; below the minimum nothing else; download, check the file, open Android's installer, and say what Android will ask (P53, P67, P79) |
| Phone handed on | lock after time away; sign out wipes the phone (P57, P65) |
| The app fails or the process dies | the log records it; the next start offers to export it (P72) |
| Recording in the background (location, reminders) | each run leaves a line in the log; the screen shows when it last worked (P72, P73, P74) |
| Where the person was | the fixes are kept as a trail until deleted, shown on a map one day at a time; positions never leave the phone, only tile pictures come in (P77) |
| Two writes at once | one at a time through a lock; a drifted transaction is reset and logged (P78) |
| A picture is taken outside the page | the plugin keeps it until the page has it; at the next start it goes back into the form that was waiting (P75) |

The prototype's Screens pill has a **Phone movements** group that triggers each one.
