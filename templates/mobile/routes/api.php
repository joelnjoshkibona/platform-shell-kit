<?php

use Illuminate\Support\Facades\Route;

/*
 * P93: the phone's own work, served by the app's own Laravel. The product's data is never here: the interface calls the remote API
 * directly with the token from secure storage (P57). Controllers live in app/Http/Controllers/Native/; Hodie's routes/api.php and
 * routes/web.php are the working example (NATIVE-PHP/hodie).
 *
 *   /api/native/insets, /keyboard, /back-intercept      safe areas (P62), keyboard height (P71), the Back key (P61)
 *   /api/native/files/*, /photo/*, /voice/*             picking, the camera, voice notes; kept by the plugin until acknowledged (P75)
 *   /api/native/alarms/*                                local reminders (P74)
 *   /api/native/update                                  the update feed, read on this server, never from the page (P79)
 *   /api/drafts/{key}                                   unsent work, written as it is typed, survives Android closing the app (P58, P75)
 *   /api/cache/{key}                                    the last data, for opening without a signal (P57, read-only)
 *   /api/log                                            the app log (P72)
 *
 * Every write that opens a transaction goes through one lock (P78).
 */
